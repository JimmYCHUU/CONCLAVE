from pydantic import BaseModel

class MessageAgentRequest(BaseModel):
    message: str

class AgentMessageResponse(BaseModel):
    agent_name: str
    response: str
    timestamp: str
