import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="finAssist AI Chatbot Backend")

# CORS setup (adjust origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and include routers (to be implemented)
from app.routes.chat import router as chat_router
app.include_router(chat_router, prefix="/chat")
# If you have insights_router, include it similarly:
# from app.routes.insights import router as insights_router
# app.include_router(insights_router, prefix="/insights")

@app.get("/")
def root():
    return {"message": "finAssist backend is running."}