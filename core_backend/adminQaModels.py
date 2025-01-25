from pydantic import BaseModel, Field, EmailStr
from enum import Enum
from typing import List, Optional
from datetime import datetime

class ChatItem(BaseModel):
    human: str
    system: str

class AdminConversation(BaseModel):
    _id : Optional[str] = None
    chat : List[ChatItem]
    email: str
    dept: str
    timestamp: datetime

class AdminChatReq (BaseModel):
    chat_id: Optional[str]
    msg: str
    email: str
    dept: str

    