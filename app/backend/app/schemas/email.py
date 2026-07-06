from pydantic import BaseModel, EmailStr


class EmailSendRequest(BaseModel):
    to_email: EmailStr
    subject: str
    body: str
    sender_type: str = "admin"


class EmailTemplateUpdate(BaseModel):
    subject: str
    body: str
