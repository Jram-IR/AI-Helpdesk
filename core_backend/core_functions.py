import os
from langchain_community.vectorstores import Pinecone
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationalRetrievalChain
from pymongo import MongoClient
from dotenv import load_dotenv
from pinecone import Pinecone as PineconeClient
import pinecone
import models
import re
from typing import List

from sklearn.cluster import KMeans
from sentence_transformers import SentenceTransformer
import numpy as np
# Load environment variables
load_dotenv()

# MongoDB connection
mongo_client = MongoClient('mongodb://127.0.0.1:27017')
db = mongo_client['escalated_queries']

# Pinecone initialization
index_name = 'knowledge-base'
pc = PineconeClient(api_key=os.getenv("PINECONE_API_KEY"))
pinecone_uri = os.getenv("PINECONE_HOST")
index = pinecone.Index(api_key=os.getenv("PINECONE_API_KEY"),index_name=index_name, host=pinecone_uri)

PROMPT_TEMPLATE = """ Answer in english only. Assume that the only information you have is the context given nothing else.
                    The use of the contextual knowledge must be evident. Answer in a descriptive format.
                    Answer the question in detail from the provided document, make sure to cover all the relevant points, there should be no additional information, only reply based on the document.\n
                    Use on the contexts to formulate the response. The response must NOT contain anything that is not there in the context. If the answer is not available in the context just say, 'answer is not available in the context' .\n
                    Don't provide the wrong answer, do not mention anything not in the document, the entire response must be crafted strictly from what is available in the context. Also, don't add any extra observations or considerations on your own if not present in the context. If there is code, give the complete code.\n
                    Context:\n{context}?\n
                    Question:\n{question}\n
                    Answer: """
SYSTEM_PROMPT = """ You are an assistant that generates top 5 Q&A pairs based on a conversation thread and retrieved context.No introduction start directly with question and answer pair only.
                         Use the context provided to generate the most relevant Q&A pairs.
                         the answers should be to the point and precise.
                         Strictly follow this regular expression \*\*Question: (.*?)\?\*\*\s*\n\*\*Answer: (.*?)\?**
                        Example: **Question: What is python?**\n**Answer: python is programming language?**"""

def get_vectorstore():
    """Initialize and return the vector store connection."""
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    return Pinecone.from_existing_index(
        index_name=index_name,
        embedding=embeddings,
        namespace="ns1"
    )

def get_conversation_chain(memory: ConversationBufferMemory):
    """Initialize and return the conversation chain."""
    vectorstore = get_vectorstore()
    model = ChatGoogleGenerativeAI(model="gemini-1.5-flash", 
                                   generation_config={"language": "en" }) # Explicitly set English as the output language
    
    prompt_template = PROMPT_TEMPLATE
    prompt = PromptTemplate(template=prompt_template, input_variables=["context", "question"])
    return ConversationalRetrievalChain.from_llm(
        llm=model,
        retriever=vectorstore.as_retriever(),
        memory=memory,
        combine_docs_chain_kwargs={"prompt": prompt}
    )


async def embed_answer(answer: str):
    """Embed an answer in the vector store."""
    try:
        vectorstore = get_vectorstore()
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
        embedded_response = embeddings.embed_query(answer)
        result = vectorstore.add_texts([answer], embeddings=[embedded_response], namespace="ns1")
        print(f"Embedding successful for answer: {answer}")
        return result
    except Exception as e:
        print(f"Error embedding answer: {e}")
        raise e  # Re-raise the exception after logging



async def generate_top_5_qa_pairs(qa_list: List[models.QaModel]):
    """
    Generates top 5 Q&A pairs using LLM based on the entire context of the provided conversation thread,
    including relevant documents retrieved from the vectorstore.
    """
    try:
        # Initialize LLM and vectorstore
        model = ChatGoogleGenerativeAI(model="gemini-1.5-flash", generation_config={"language": "en"})
        vectorstore = get_vectorstore()  # Function to retrieve the vectorstore connection
        qa_pairs: List[models.QaModel] = []

        # Combine the conversation thread from qa_list
        conversation_thread = "\n".join([f"Question: {qa.question}\nAnswer: {qa.answer}" for qa in qa_list])
        retrieved_context = ""
        retriever = vectorstore.as_retriever()

        for qa in qa_list:
            # Retrieve additional context from the vectorstore
            retrieved_docs = retriever.get_relevant_documents(query=qa.answer)
            retrieved_context += "\n".join([doc.page_content for doc in retrieved_docs]) + "\n"

        # Generate response from the model
        messages = [(
                        "system", 
                        SYSTEM_PROMPT
                    ),
                    ("human", conversation_thread),  # Pass the conversation thread here
                    ("human", retrieved_context)  # Request from user
                ]
        response =  model.invoke(messages)  # Asynchronous call to LLM
        lines = response.content.split('\n')
        current_question = ""
        current_answer = ""

        for line in lines:
            # Remove empty lines
            if not line.strip():
                continue
                
            # Check if line starts with "Question:"
            if line.strip().startswith("**Question:"):
                # If we have a previous QA pair, save it
                if current_question and current_answer:
                    qa_pairs.append({
                        "question": current_question.strip(),
                        "answer": current_answer.strip()
                    })
                # Start new question
                current_question = line.strip()[11:-2]  # Remove "**Question: " and "**"
                current_answer = ""
            # Check if line starts with "Answer:"
            elif line.strip().startswith("**Answer:"):
                current_answer = line.strip()[10:-2]  # Remove "**Answer: " and "**"
        
        # Add the last QA pair
        if current_question and current_answer:
            qa_model_instance = models.QaModel(question=current_question.strip(), answer=current_answer.strip())
            qa_pairs.append(qa_model_instance)
    

        return qa_pairs[:5]  # Limit to top 5 Q&A pairs 

    except Exception as e:
        print(f"Error generating top 5 Q&A pairs: {e}")
        return []

def extract_top_faqs(qa_pairs: List[models.QaModel], n_clusters: int = 5) -> List[models.QaModel]:
    """Extracts top FAQs from a list of QaModel objects using clustering."""

    # Extract questions from QaModel objects
    questions = [qa.question for qa in qa_pairs]

    # Preprocess and embed questions using SBERT
    model = SentenceTransformer('paraphrase-MiniLM-L6-v2')
    embeddings = model.encode(questions)

    # Perform clustering
    kmeans = KMeans(n_clusters=n_clusters, random_state=42)
    cluster_labels = kmeans.fit_predict(embeddings)

    # Extract FAQs by finding the closest question to the cluster centroid
    faqs = []
    for cluster_id in range(n_clusters):
        # Find questions belonging to the current cluster
        cluster_indices = np.where(cluster_labels == cluster_id)[0]
        cluster_embeddings = embeddings[cluster_indices]
        cluster_questions = [questions[i] for i in cluster_indices]

        # Compute the centroid and find the closest question
        centroid = np.mean(cluster_embeddings, axis=0)
        closest_idx = np.argmin(np.linalg.norm(cluster_embeddings - centroid, axis=1))
        faqs.append(qa_pairs[cluster_indices[closest_idx]])

    return faqs