import models
from datetime import datetime
from pymongo import MongoClient
from typing import List
from bson import ObjectId
from core_functions import embed_answer, generate_top_5_qa_pairs, extract_top_faqs
from langchain.memory import ConversationBufferMemory
import asyncio
import adminQaModels
import os
mongo_client = MongoClient(os.getenv("MONGO_CLIENT"))
db = mongo_client[os.getenv("DB_NAME")]
userColl = db['users']
adminQaColl = db['adminQa']

def initConversationChain(request : models.QARequest):
        
        memory = ConversationBufferMemory(
                memory_key="chat_history",  
                input_key="question",      
                output_key="answer",      
                return_messages=True
            )
        
        if request.thread_id:
            thread = db[request.dept].find_one({"_id": ObjectId(request.thread_id)})
            if thread:
                conversation = models.Conversation.model_validate(thread)
                for thread_item in conversation.thread:
                    memory.save_context({"question": thread_item.question}, {"answer": thread_item.answer})
        
        return memory

def initAdminConversationChain(request : adminQaModels.AdminChatReq):
        
        memory = ConversationBufferMemory(
                memory_key="chat_history",  
                input_key="question",      
                output_key="answer",      
                return_messages=True
            )
        if request.chat_id:
            chat = adminQaColl.find_one({"_id": ObjectId(request.chat_id)})
            if chat:
                conversation = adminQaModels.AdminConversation.model_validate(chat)
                for chat_item in conversation.chat:
                    memory.save_context({"question": chat_item.human}, {"answer": chat_item.system})
        
        return memory


def adminChat(request: adminQaModels.AdminChatReq, sysResponse: str):
    chatItem = adminQaModels.ChatItem(human=request.msg, system=sysResponse)
    if request.chat_id != "":
        data = adminQaColl.find_one({"_id" : ObjectId(request.chat_id)})
        adminConversation = adminQaModels.AdminConversation.model_validate(data)
        adminConversation.chat.append(chatItem)

        res = adminQaColl.update_one({"_id" : ObjectId(request.chat_id)},
                                    {"$set" : adminConversation.model_dump()})
        return request.chat_id
    else:
        chat: List[adminQaModels.ChatItem] = []
        chat.append(chatItem)
        newAdminConversation = adminQaModels.AdminConversation(chat=chat, email=request.email, 
                                                     dept=request.dept, timestamp=datetime.now())
        res = adminQaColl.insert_one(newAdminConversation.model_dump())
        return str(res.inserted_id)
        


def addThread(request: models.QARequest, ans: str):    
    threadItem = models.ThreadItem(
            question=request.query,
            answer=ans,
            answerBy=models.ResolutionSource.AI,
            email= None
        )
    if request.thread_id != "":
        thread = db[request.dept].find_one({"_id" : ObjectId(request.thread_id)})
        conversation = models.Conversation.model_validate(thread)
        conversation.thread.append(threadItem)
        conversation.details = request
        result = db[request.dept].update_one({"_id": ObjectId(request.thread_id)}, 
                                             {"$set" : conversation.model_dump()})
        return request.thread_id
    else:
        threadList: List[models.ThreadItem] = []
        threadList.append(threadItem)
        conversation = models.Conversation(thread=threadList, details=request, adminInt=models.AdminInteractionStatus.UNSEEN,
                                           escalated_query=None, isResolved=False, isEscalated=False, 
                                           resolvedAt=None, resolvedBy=None, timestamp=datetime.now(),
                                           escalate_time=None, escalated_qidx=None)
    
        result = db[request.dept].insert_one(conversation.model_dump())

        usr = models.User.model_validate(userColl.find_one({"email" : request.userEmail}))
        if usr:
            if request.dept not in usr.threadsInDepts or len(usr.threadsInDepts) == 0:
                usr.threadsInDepts.append(request.dept)
            userColl.update_one({"email": request.userEmail}, {"$set" : usr.model_dump()})
        return str(result.inserted_id)
    
def escalateQuery(escalationReq: models.EscalationRequest):
    doc = db[escalationReq.dept].find_one({"_id" : ObjectId(escalationReq.thread_id)})
    conversation = models.Conversation.model_validate(doc)
    if conversation:
        
        conversation.escalated_query = escalationReq.query_to_escalate
        conversation.escalate_time = datetime.now()
        conversation.isEscalated = True
        if not conversation.escalated_qidx:
            qidxList: List[int] = []
            qidxList.append(len(conversation.thread) - 1)
            conversation.escalated_qidx = qidxList

        else: 
            conversation.escalated_qidx.append(len(conversation.thread) - 1)

        res = db[escalationReq.dept].update_one({"_id" : ObjectId(escalationReq.thread_id)}, {"$set" : conversation.model_dump()})
        print(res.acknowledged)
        return res.acknowledged
    else:
        return False
    
def  resolveThread(resolutionReq: models.ResolutionRequest):
    doc = db[resolutionReq.admin_details.dept].find_one({"_id" : ObjectId(resolutionReq.thread_id)})
    conversation = models.Conversation.model_validate(doc)
    if(conversation):
        threadItem = models.ThreadItem(
            question=conversation.escalated_query,
            answer=resolutionReq.response,
            answerBy=resolutionReq.admin_details.adminName,
            email= resolutionReq.admin_details.email

        )
        conversation.thread.append(threadItem)

        if conversation.escalated_qidx:
            conversation.escalated_qidx[-1] +=  1

        conversation.adminInt = models.AdminInteractionStatus.PENDING
        res = db[resolutionReq.admin_details.dept].update_one({"_id" : ObjectId(resolutionReq.thread_id)}, 
                                                               {"$set": conversation.model_dump()})  
            
        return res.acknowledged
    else:
        return False
    
async def accecptResolution(acceptReq: models.AcceptanceRequest):
    doc = db[acceptReq.dept].find_one({"_id" : ObjectId(acceptReq.thread_id)})
    conversation = models.Conversation.model_validate(doc)
    if(conversation):
        conversation.isResolved = True
        conversation.resolvedAt = datetime.now()
        conversation.adminInt = models.AdminInteractionStatus.RESOLVED
        human_answer_count = sum(1 for item in conversation.thread if item.answerBy.lower() != "ai")
        if(human_answer_count > 0): conversation.resolvedBy = models.ResolutionSource.HUMAN
        else: conversation.resolvedBy = models.ResolutionSource.AI
        res = db[acceptReq.dept].update_one({"_id" : ObjectId(acceptReq.thread_id)},
                                                          {"$set" : conversation.model_dump()})
        
        human_answers = [item.answer for item in conversation.thread if item.answerBy.lower() != "ai"]
        formatted_string = "\n".join(human_answers)
        print(formatted_string)
        embed_result = await embed_answer(formatted_string)
        if embed_result:
            print("Embedding successful.")
        else:
            print("Embedding failed.")
            return False
        
        qaSetResTask = asyncio.create_task(generateQaSet(conversation.thread, acceptReq.thread_id ,conversation.details.dept))
        qaSetResTask.add_done_callback(lambda t: handle_qa_generation_result(t))
        return res.acknowledged
    else:
        return False
    
async def generateQaSet(thread: List[models.ThreadItem], tid: str, dept: str):
    qaList: List[models.QaModel]= []
    for item in thread:
        qa = models.QaModel(
            question=item.question,
            answer=item.answer
        )
        qaList.append(qa)
    qaPairs = await generate_top_5_qa_pairs(qaList)
    qaSetModel = models.QaSetModel(
        thread_id= tid,
        qaSet=qaPairs,
        dept=dept
    )
    res = db["qaSet"].update_one(
        {"thread_id": tid},
        {"$set": qaSetModel.model_dump()},
        upsert=True  # Insert if no document matches
    )
    return res.acknowledged
    

def handle_qa_generation_result(task):
    try:
        result = task.result()
        print(f"QA Generation completed with result: {result}")
    except Exception as e:
        print(f"Error in QA Generation: {str(e)}")

def fetchQaSetBydept(request : models.FaqReq):
    # Fetching data from the database;
    result_cursor = db["qaSet"].find({"dept": request.dept}, {"qaSet": 1, "_id": 0})
    
    # If the result is empty, return None
    if not result_cursor:
        return None

    # Convert the cursor to a list of documents
    result = list(result_cursor)
    
    # Assuming each document contains a 'qaSet' field
    qa_pairs: List[models.QaModel] = []

    # Iterate through the result and extract 'qaSet' if available
    for document in result:
        if "qaSet" in document:
            qa_pairs.extend([models.QaModel(**qa) for qa in document["qaSet"]])

    # Extract top FAQs if there are qa_pairs
    if qa_pairs:
        faq = extract_top_faqs(qa_pairs)
        return faq
    
    return None





    

    


        



    





        
        
        



       

