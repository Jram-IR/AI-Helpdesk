# main.py
from fastapi import FastAPI, HTTPException, Depends
from models import QARequest, QAResponse, EscalationRequest, ResolutionRequest, AcceptanceRequest, FaqReq,ResolutionSource
from core_functions import get_conversation_chain, db
import repo_functions
import adminQaModels
import os
from dotenv import load_dotenv
from pymongo import MongoClient
from fastapi.middleware.cors import CORSMiddleware



# Load environment variables
load_dotenv()

app = FastAPI(title="Knowledge Base Q&A API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods
    allow_headers=["*"],  # Allows all headers
)

# Initialize clients
mongo_client = MongoClient(os.getenv("MONGO_CLIENT"))
db = mongo_client[os.getenv("DB_NAME")]
userCol = db['users']

# API Routes
@app.post("/qa", response_model=QAResponse)
async def question_answer(request: QARequest):
    """Handle Q&A requests from both users and admins."""
    try:
        conversation_chain = repo_functions.initConversationChain(request)
        # Initialize conversation chain
        memory = repo_functions.initConversationChain(request)
        conversation_chain = get_conversation_chain(memory)
        resp = conversation_chain({'question': request.query })
        ans = resp.get("answer")
        id = repo_functions.addThread(request, ans)
        return QAResponse(
            qid= id,
            response=ans,
            source=ResolutionSource.AI
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/admin/qa", response_model=QAResponse)
async def question_answer(request: adminQaModels.AdminChatReq):
    """Handle Q&A requests from both users and admins."""
    try:
        conversation_chain = repo_functions.initAdminConversationChain(request)
        # Initialize conversation chain
        memory = repo_functions.initAdminConversationChain(request)
        conversation_chain = get_conversation_chain(memory)
        resp = conversation_chain({'question': request.msg })
        ans = resp.get("answer")
        id = repo_functions.adminChat(request, ans)
        return QAResponse(
            qid= id,
            response=ans
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/escalate")
async def escalate_query(request: EscalationRequest):
    """Handle query escalation requests."""
    try:
        ack = repo_functions.escalateQuery(request)
        if(not ack):
            raise HTTPException(status_code=400, detail="Escalation failed.") 
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/resolve")
async def resolve_query(request: ResolutionRequest):
    """Handle query resolution by admin."""
    try:
      ack = repo_functions.resolveThread(request)
      if(not ack):
        raise HTTPException(status_code=400, detail="Resolution failed.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/accept")
async def accept_resolution(request: AcceptanceRequest):
    """Handle user acceptance/rejection of answers."""
    try:
      ack = await repo_functions.accecptResolution(request)
      if(not ack):
        raise HTTPException(status_code=400, detail="Acceptance failed.")  
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/faq")
async def get_faq(request: FaqReq):
    try:
        faq = repo_functions.fetchQaSetBydept(request)
        print("FAQ", faq)
        if faq:
            return faq
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Error Handlers
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return {"error": str(exc)}, 500

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)