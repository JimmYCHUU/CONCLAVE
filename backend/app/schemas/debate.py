from pydantic import BaseModel

class InjectScenarioRequest(BaseModel):
    scenario: str

class ResolvePredictionRequest(BaseModel):
    outcome: str
