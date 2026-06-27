from pydantic import BaseModel, EmailStr

class RegisterRequest(BaseModel):
    email: str
    username: str
    password: str
    domain: str

class LoginRequest(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    user_id: str
    username: str
    email: str
    access_token: str

class LoginResponse(BaseModel):
    access_token: str
    user_id: str
    username: str
