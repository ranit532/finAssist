from fastapi import APIRouter, Request
from app.models.conversation import ConversationRequest, ConversationResponse
from azure.cosmos import CosmosClient
import os
from dotenv import load_dotenv
load_dotenv()
COSMOS_ENDPOINT = os.getenv("COSMOS_ENDPOINT")
COSMOS_KEY = os.getenv("COSMOS_KEY")
COSMOS_DB_NAME = os.getenv("COSMOS_DB_NAME")
COSMOS_CONTAINER_NAME = os.getenv("COSMOS_CONTAINER_NAME")
client = CosmosClient(COSMOS_ENDPOINT, COSMOS_KEY)
database = client.get_database_client(COSMOS_DB_NAME)
container = database.get_container_client(COSMOS_CONTAINER_NAME)

import requests
import base64
import logging
import re
logging.basicConfig(level=logging.DEBUG)

AZURE_TTS_KEY = os.getenv("AZURE_TTS_KEY")
AZURE_TTS_REGION = os.getenv("AZURE_TTS_REGION")
AZURE_TTS_ENDPOINT = f"https://{AZURE_TTS_REGION}.tts.speech.microsoft.com/cognitiveservices/v1"

def synthesize_speech(text: str, voice: str = "en-US-JennyNeural") -> bytes:
    headers = {
        "Ocp-Apim-Subscription-Key": AZURE_TTS_KEY,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-16khz-32kbitrate-mono-mp3"
    }
    ssml = f"""
    <speak version='1.0' xml:lang='en-US'>
      <voice name='{voice}'>{text}</voice>
    </speak>
    """
    response = requests.post(AZURE_TTS_ENDPOINT, headers=headers, data=ssml.encode('utf-8'))
    if response.status_code == 200:
        return response.content
    return b''

router = APIRouter()

session_state = {}

@router.post("/", response_model=ConversationResponse)
async def chat_endpoint(request: ConversationRequest):
    text = request.text
    session_id = request.session_id or "default"
    # First message: greet and ask for name/userId
    if session_id not in session_state:
        session_state[session_id] = {"userId": None, "user": None}
    if not session_state[session_id]["userId"]:
        if not session_id or session_id == "new":
            tts_audio = synthesize_speech("Hello, may I know your name or user ID please?")
            audio_b64 = base64.b64encode(tts_audio).decode('utf-8') if tts_audio else None
            return ConversationResponse(
                text="Hello, may I know your name or user ID please?",
                intent="greeting",
                entities=None,
                action_result=None,
                sentiment="Neutral",
                audio_data=audio_b64,
                stage="understanding"
            )
        # Extract user ID from input text
        match = re.search(r"C\d{5}", text)
        user_id = match.group(0) if match else text.strip()
        logging.debug(f"Extracted userId for search: {user_id}")
        query = f"SELECT * FROM c WHERE c.userId = @userId"
        params = [{"name": "@userId", "value": user_id}]
        logging.debug(f"Cosmos DB query: {query}, params: {params}")
        items = list(container.query_items(query=query, parameters=params, enable_cross_partition_query=True))
        logging.debug(f"Cosmos DB returned items: {items}")
        if items:
            user = items[0]
            session_state[session_id]["userId"] = user_id
            session_state[session_id]["user"] = user
            tts_audio = synthesize_speech(f"Welcome {user['name']}! How can I assist you today?")
            audio_b64 = base64.b64encode(tts_audio).decode('utf-8') if tts_audio else None
            return ConversationResponse(
                text=f"Welcome {user['name']}! How can I assist you today?",
                intent="user_identified",
                entities={"userId": user_id},
                action_result=None,
                sentiment="Positive",
                audio_data=audio_b64,
                stage="searching"
            )
        else:
            logging.debug("No user found in Cosmos DB.")
            tts_audio = synthesize_speech("Sorry, I could not find your user ID. Please try again.")
            audio_b64 = base64.b64encode(tts_audio).decode('utf-8') if tts_audio else None
            return ConversationResponse(
                text="Sorry, I could not find your user ID. Please try again.",
                intent="user_not_found",
                entities=None,
                action_result=None,
                sentiment="Negative",
                audio_data=audio_b64,
                stage="searching"
            )
    # User is identified, handle follow-up questions
    user = session_state[session_id]["user"]
    response_text = None
    if text and "address" in text.lower():
        response_text = f"Your address is: {user['address']}"
    elif text and "balance" in text.lower():
        response_text = f"Your account balance is ${user['accountBalance']}"
    elif text and "email" in text.lower():
        response_text = f"Your email is: {user['email']}"
    elif text and "phone" in text.lower():
        response_text = f"Your phone number is: {user['phone']}"
    elif text and ("dob" in text.lower() or "date of birth" in text.lower()):
        response_text = f"Your date of birth is: {user['dob']}"
    elif text and ("credit card" in text.lower() or "creditcard" in text.lower()):
        response_text = f"Your credit card number is: {user['creditCardNumber']}"
    elif text and ("created" in text.lower() or "created at" in text.lower()):
        response_text = f"Your account was created at: {user['createdAt']}"
    elif text and ("etag" in text.lower() or "_etag" in text.lower()):
        response_text = f"Your eTag is: {user['_etag']}"
    elif text and ("attachments" in text.lower() or "_attachments" in text.lower()):
        response_text = f"Your attachments field is: {user['_attachments']}"
    elif text and ("ts" in text.lower() or "_ts" in text.lower()):
        response_text = f"Your timestamp is: {user['_ts']}"
    elif text and ("id" in text.lower()):
        response_text = f"Your id is: {user['id']}"
    if response_text:
        tts_audio = synthesize_speech(response_text)
        audio_b64 = base64.b64encode(tts_audio).decode('utf-8') if tts_audio else None
        return ConversationResponse(
            text=response_text,
            intent="info_response",
            entities={"userId": user["userId"]},
            action_result=None,
            sentiment="Positive",
            audio_data=audio_b64,
            stage="responding"
        )
    # Otherwise, fallback to LLM/knowledge agent (placeholder)
    tts_audio = synthesize_speech("Could you please clarify your request?")
    audio_b64 = base64.b64encode(tts_audio).decode('utf-8') if tts_audio else None
    return ConversationResponse(
        text="Could you please clarify your request?",
        intent="clarification",
        entities=None,
        action_result=None,
        sentiment="Neutral",
        audio_data=audio_b64,
        stage="responding"
    )