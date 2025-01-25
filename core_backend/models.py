from pydantic import BaseModel, Field, EmailStr
from enum import Enum
from typing import List, Optional
from datetime import datetime


class ThreadItem(BaseModel):
    question: str
    answer: str
    answerBy: str
    email: Optional[str]

class QARequest(BaseModel):
    thread_id: str = ""
    query: str
    userEmail: EmailStr
    uname : str
    dept: str

class Conversation(BaseModel):
    _id: Optional[str] = None 
    thread: List[ThreadItem]
    details: QARequest
    adminInt: str
    escalated_query: Optional[str]
    escalated_qidx : Optional[List[int]]
    escalate_time: Optional[datetime]
    isResolved: bool
    isEscalated: bool
    resolvedBy: Optional[str]
    resolvedAt: Optional[datetime]
    timestamp: datetime


class User(BaseModel):
    uname: str
    email: EmailStr
    threadsInDepts: List[str] = []

class Admin(BaseModel):
    adminName : str
    email: EmailStr
    dept: str

class AdminInteractionStatus(str, Enum):
    PENDING = "pending"
    RESOLVED = "resolved"
    UNSEEN = "unseen"

class AcceptanceStatus(str, Enum):
    ACCEPTED = "accepted"
    REJECTED = "rejected"

class ResolutionSource(str, Enum):
    AI = "ai"
    HUMAN = "human"


class QAResponse(BaseModel):
    qid: str
    response: str
    source: ResolutionSource = ResolutionSource.AI

class EscalationRequest(BaseModel):
    thread_id: str
    dept: str
    query_to_escalate: str

class ResolutionRequest(BaseModel):
    thread_id: str
    response: str
    admin_details: Admin

class AcceptanceRequest(BaseModel):
    thread_id: str
    dept: str

class QaModel(BaseModel):
    question : str
    answer: str

class QaSetModel(BaseModel):
    thread_id : str
    dept: str
    qaSet: List[QaModel]

class FaqReq(BaseModel):
    name: str
    email: str
    dept: str