import re
from fastapi import APIRouter, Request
import json
from app.models.conversation import ConversationRequest, ConversationResponse
from azure.cosmos import CosmosClient
import os
from dotenv import load_dotenv
load_dotenv()
COSMOS_ENDPOINT = os.getenv("COSMOS_ENDPOINT")
COSMOS_KEY = os.getenv("COSMOS_KEY")
COSMOS_DB_NAME = os.getenv("COSMOS_DB_NAME")
COSMOS_CONTAINER_NAME = os.getenv("COSMOS_CONTAINER_NAME")
container = None
try:
    if COSMOS_ENDPOINT and COSMOS_KEY and COSMOS_DB_NAME and COSMOS_CONTAINER_NAME:
        client = CosmosClient(COSMOS_ENDPOINT, COSMOS_KEY)
        database = client.get_database_client(COSMOS_DB_NAME)
        container = database.get_container_client(COSMOS_CONTAINER_NAME)
except Exception as e:
    import logging
    logging.warning(f"Cosmos DB connection failed, using stub data. Error: {e}")

import requests
import base64
import logging
import re
logging.basicConfig(level=logging.DEBUG)

# Azure Text Analytics setup
AZURE_TEXT_KEY = os.getenv("AZURE_TEXT_KEY")
AZURE_TEXT_ENDPOINT = os.getenv("AZURE_TEXT_ENDPOINT")
def analyze_sentiment(text):
    if not AZURE_TEXT_KEY or not AZURE_TEXT_ENDPOINT:
        return {"sentiment": "neutral", "score": 0.5}
    headers = {
        "Ocp-Apim-Subscription-Key": AZURE_TEXT_KEY,
        "Content-Type": "application/json"
    }
    data = {"documents": [{"id": "1", "language": "en", "text": text}]}
    resp = requests.post(f"{AZURE_TEXT_ENDPOINT}/text/analytics/v3.1/sentiment", headers=headers, json=data)
    if resp.status_code == 200:
        result = resp.json()
        doc = result["documents"][0]
        score = doc["confidenceScores"][doc["sentiment"]]
        return {"sentiment": doc["sentiment"], "score": score}
    return {"sentiment": "neutral", "score": 0.5}

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


# Load stub data
def load_stub_users():
    with open('database/stub_users.json', 'r') as f:
        return json.load(f)

stub_users = load_stub_users()

session_state = {}

router = APIRouter()

@router.post("/", response_model=ConversationResponse)
async def chat_endpoint(request: ConversationRequest):
    text = request.text
    # Inject dummy sentiment scores for every message
    import random
    lower_text = (text or "").strip().lower()
    if any(kw in lower_text for kw in ["good", "great", "awesome", "yes", "thank you", "thanks"]):
        sentiment_result = {"sentiment": "positive", "score": round(random.uniform(0.7, 1.0), 2)}
    elif any(kw in lower_text for kw in ["bad", "no", "not", "problem", "issue", "sorry"]):
        sentiment_result = {"sentiment": "negative", "score": round(random.uniform(0.0, 0.3), 2)}
    else:
        sentiment_result = {"sentiment": "neutral", "score": round(random.uniform(0.4, 0.6), 2)}
    sentiment_label = sentiment_result["sentiment"].capitalize()
    sentiment_score = float(sentiment_result.get("score", 0.5))
    session_id = request.session_id or "default"
    # First message: greet and ask for name
    if session_id not in session_state:
        session_state[session_id] = {"userId": None, "user": None, "transactions": None, "txn_index": 0, "dob_validated": False, "ticket": None}
    # Dummy sentiment distribution for pie chart
    import random
    dummy_distribution = {
        "Positive": random.randint(40, 70),
        "Neutral": random.randint(10, 30),
        "Negative": random.randint(10, 30)
    }
    if not session_state[session_id]["userId"]:
        # Always prompt for name until a valid user is found
        greeting_keywords = ["hi", "hello", "how are you", "hey", "good morning", "good afternoon", "good evening", "greetings", "what's up", "howdy", "yo"]
        # Extract name if user says 'my name is ...'
        extracted_name = None
        if text:
            match = re.search(r"my name is ([a-zA-Z .'-]+)", text, re.IGNORECASE)
            if match:
                extracted_name = match.group(1).strip()
        if not text or not text.strip() or any(kw in text.lower() for kw in greeting_keywords):
            welcome_text = "Hello there! I hope you are doing fine. May I please know your name?"
            tts_audio = synthesize_speech(welcome_text)
            audio_b64 = base64.b64encode(tts_audio).decode('utf-8') if tts_audio else None
            return ConversationResponse(
                text=welcome_text,
                intent="greeting",
                entities=None,
                action_result=None,
                sentiment=sentiment_label,
                sentiment_score=sentiment_score,
                audio_data=audio_b64,
                stage="understanding",
                sentiment_distribution=dummy_distribution
            )
        # Try to find user by name in Cosmos DB
        import unicodedata
        def normalize_name(name):
            # Strip, collapse spaces, and normalize unicode
            name = name.strip()
            name = ' '.join(name.split())
            name = unicodedata.normalize('NFKC', name)
            return name.lower()

        user_name = normalize_name(extracted_name if extracted_name else text)
        # Cosmos DB fuzzy search
        all_users = list(container.query_items(query="SELECT * FROM c", enable_cross_partition_query=True))
        from rapidfuzz import fuzz
        best_match = None
        best_score = 0
        for user in all_users:
            score = fuzz.ratio(user_name, normalize_name(user["name"]))
            if score > best_score:
                best_score = score
                best_match = user
        if best_match and best_score >= 85:
            user = best_match
            session_state[session_id]["userId"] = user.get("userId", user.get("id"))
            session_state[session_id]["user"] = user
            session_state[session_id]["transactions"] = user.get("transactions", [])
            tts_audio = synthesize_speech(f"Hello {user['name']}, how may I assist you today?")
            audio_b64 = base64.b64encode(tts_audio).decode('utf-8') if tts_audio else None
            return ConversationResponse(
                text=f"Hello {user['name']}, how may I assist you today?",
                intent="user_identified",
                entities={"userId": user.get("userId", user.get("id"))},
                action_result=None,
                sentiment="Positive",
                sentiment_score=sentiment_score,
                audio_data=audio_b64,
                stage="searching",
                user=user,
                transactions=user.get("transactions", []),
                sentiment_distribution=dummy_distribution
            )
        else:
            # Fuzzy match stub data
            best_stub = None
            best_stub_score = 0
            for u in stub_users:
                score = fuzz.ratio(user_name, normalize_name(u["name"]))
                if score > best_stub_score:
                    best_stub_score = score
                    best_stub = u
            if best_stub and best_stub_score >= 85:
                stub_user = best_stub
                session_state[session_id]["userId"] = stub_user.get("id")
                session_state[session_id]["user"] = stub_user
                session_state[session_id]["transactions"] = stub_user.get("transactions", [])
                tts_audio = synthesize_speech(f"Hello {stub_user['name']}, how may I assist you today?")
                audio_b64 = base64.b64encode(tts_audio).decode('utf-8') if tts_audio else None
                return ConversationResponse(
                    text=f"Hello {stub_user['name']}, how may I assist you today?",
                    intent="user_identified",
                    entities={"userId": stub_user.get("id")},
                    action_result=None,
                    sentiment="Positive",
                    sentiment_score=sentiment_score,
                    audio_data=audio_b64,
                    stage="searching",
                    user=stub_user,
                    transactions=stub_user.get("transactions", []),
                    sentiment_distribution=dummy_distribution
                )
            tts_audio = synthesize_speech("Sorry, I could not find your name. Please try again.")
            audio_b64 = base64.b64encode(tts_audio).decode('utf-8') if tts_audio else None
            return ConversationResponse(
                text="Sorry, I could not find your name. Please try again.",
                intent="user_not_found",
                entities=None,
                action_result=None,
                sentiment="Negative",
                sentiment_score=sentiment_score,
                audio_data=audio_b64,
                stage="searching",
                sentiment_distribution=dummy_distribution
            )
    # User is identified, handle follow-up questions
    user = session_state[session_id]["user"]
    transactions = session_state[session_id]["transactions"] or []
    txn_index = session_state[session_id]["txn_index"]
    dob_validated = session_state[session_id]["dob_validated"]
    ticket = session_state[session_id]["ticket"]
    response_text = None

    # Transaction flow
    if text and "last transactions" in text.lower():
        session_state[session_id]["txn_index"] = 0
        txn = transactions[0] if transactions else None
        if txn:
            response_text = f"Are you asking about this transaction: {txn['merchant']} {txn['info']} on {txn['timestamp']} for ${txn['amount']}?"
            tts_audio = synthesize_speech(response_text)
            audio_b64 = base64.b64encode(tts_audio).decode('utf-8') if tts_audio else None
            return ConversationResponse(
                text=response_text,
                intent="transaction_confirm",
                entities={"userId": user.get("userId", user.get("id"))},
                action_result=None,
                sentiment="Neutral",
                sentiment_score=sentiment_score,
                audio_data=audio_b64,
                stage="transaction_confirm",
                transactions=transactions,
                sentiment_distribution=dummy_distribution
            )
    elif text and text.lower() in ["no", "not this", "not this transaction"] and txn_index < len(transactions) - 1:
        session_state[session_id]["txn_index"] += 1
        txn = transactions[session_state[session_id]["txn_index"]]
        response_text = f"Are you asking about this transaction: {txn['merchant']} {txn['info']} on {txn['timestamp']} for ${txn['amount']}?"
        tts_audio = synthesize_speech(response_text)
        audio_b64 = base64.b64encode(tts_audio).decode('utf-8') if tts_audio else None
        return ConversationResponse(
            text=response_text,
            intent="transaction_confirm",
            entities={"userId": user.get("userId", user.get("id"))},
            action_result=None,
            sentiment="Neutral",
            sentiment_score=sentiment_score,
            audio_data=audio_b64,
            stage="transaction_confirm",
            transactions=transactions,
            sentiment_distribution=dummy_distribution
        )
    elif text and text.lower() == "yes" and txn_index < len(transactions):
        # If previous stage was transaction_confirm, ask if user wants to report
        prev_intent = session_state[session_id].get("last_intent")
        if prev_intent == "transaction_confirm":
            response_text = "Is there any issue with this transaction?"
            session_state[session_id]["last_intent"] = "transaction_issue"
            tts_audio = synthesize_speech(response_text)
            audio_b64 = base64.b64encode(tts_audio).decode('utf-8') if tts_audio else None
            return ConversationResponse(
                text=response_text,
                intent="transaction_issue",
                entities={"userId": user.get("userId", user.get("id")), "transactionId": transactions[txn_index]["id"]},
                action_result=None,
                sentiment="Neutral",
                sentiment_score=sentiment_score,
                audio_data=audio_b64,
                stage="transaction_issue",
                transactions=transactions,
                sentiment_distribution=dummy_distribution
            )
        elif prev_intent == "transaction_issue":
            response_text = "Do you want to report this transaction?"
            session_state[session_id]["last_intent"] = "transaction_report_confirm"
            tts_audio = synthesize_speech(response_text)
            audio_b64 = base64.b64encode(tts_audio).decode('utf-8') if tts_audio else None
            return ConversationResponse(
                text=response_text,
                intent="transaction_report_confirm",
                entities={"userId": user.get("userId", user.get("id")), "transactionId": transactions[txn_index]["id"]},
                action_result=None,
                sentiment="Neutral",
                sentiment_score=sentiment_score,
                audio_data=audio_b64,
                stage="transaction_report_confirm",
                transactions=transactions,
                sentiment_distribution=dummy_distribution
            )
        elif prev_intent == "transaction_report_confirm":
            # User confirmed they want to report, proceed to DOB
            response_text = "Gotcha! Let me ask you a few details before we trace out this transaction and fix it. Could you please confirm your date of birth please?"
            session_state[session_id]["last_intent"] = "dob_request"
            tts_audio = synthesize_speech(response_text)
            audio_b64 = base64.b64encode(tts_audio).decode('utf-8') if tts_audio else None
            return ConversationResponse(
                text=response_text,
                intent="dob_request",
                entities={"userId": user.get("userId", user.get("id")), "transactionId": transactions[txn_index]["id"]},
                action_result=None,
                sentiment="Neutral",
                audio_data=audio_b64,
                stage="dob_request",
                transactions=transactions
            )
        else:
            # Default fallback for yes
            response_text = "Is there any issue with this transaction?"
            session_state[session_id]["last_intent"] = "transaction_issue"
            tts_audio = synthesize_speech(response_text)
            audio_b64 = base64.b64encode(tts_audio).decode('utf-8') if tts_audio else None
            return ConversationResponse(
                text=response_text,
                intent="transaction_issue",
                entities={"userId": user.get("userId", user.get("id")), "transactionId": transactions[txn_index]["id"]},
                action_result=None,
                sentiment="Neutral",
                audio_data=audio_b64,
                stage="transaction_issue",
                transactions=transactions
            )
        # Track last intent for flow control
        session_state[session_id]["last_intent"] = request.text.lower()
    elif text and "report" in text.lower():
        response_text = "Gotcha! Let me ask you a few details before we trace out this transaction and fix it. Could you please confirm your date of birth please?"
        tts_audio = synthesize_speech(response_text)
        audio_b64 = base64.b64encode(tts_audio).decode('utf-8') if tts_audio else None
        return ConversationResponse(
            text=response_text,
            intent="dob_request",
            entities={"userId": user.get("userId", user.get("id")), "transactionId": transactions[txn_index]["id"]},
            action_result=None,
            sentiment="Neutral",
            sentiment_score=sentiment_score,
            audio_data=audio_b64,
            stage="dob_request",
            transactions=transactions,
            sentiment_distribution=dummy_distribution
        )
    elif text and (re.match(r"\d{4}-\d{2}-\d{2}", text.strip()) or re.match(r"\d{2}/\d{2}/\d{4}", text.strip())):
        # Normalize DOB input
        dob_input = text.strip()
        if re.match(r"\d{2}/\d{2}/\d{4}", dob_input):
            # Convert DD/MM/YYYY to YYYY-MM-DD
            day, month, year = dob_input.split("/")
            dob_input = f"{year}-{month}-{day}"
        # Validate DOB
        if dob_input == user.get("dob"):
            session_state[session_id]["dob_validated"] = True
            ticket_num = f"TCKT{session_id[-4:]}{txn_index}"
            session_state[session_id]["ticket"] = ticket_num
            response_text = f"Thanks for the confirmation! I will report this asap and here is your ticket number {ticket_num} which you may track for your reference."
            tts_audio = synthesize_speech(response_text)
            audio_b64 = base64.b64encode(tts_audio).decode('utf-8') if tts_audio else None
            return ConversationResponse(
                text=response_text,
                intent="ticket_created",
                entities={"userId": user.get("userId", user.get("id")), "transactionId": transactions[txn_index]["id"], "ticket": ticket_num},
                action_result=None,
                sentiment="Positive",
                sentiment_score=sentiment_score,
                audio_data=audio_b64,
                stage="ticket_created",
                transactions=transactions,
                sentiment_distribution=dummy_distribution
            )
        else:
            response_text = "Sorry! I am not able to validate your credentials and I am transferring this call to my senior agent."
            tts_audio = synthesize_speech(response_text)
            audio_b64 = base64.b64encode(tts_audio).decode('utf-8') if tts_audio else None
            return ConversationResponse(
                text=response_text,
                intent="human_agent",
                entities={"userId": user.get("userId", user.get("id")), "transactionId": transactions[txn_index]["id"]},
                action_result=None,
                sentiment="Negative",
                sentiment_score=sentiment_score,
                audio_data=audio_b64,
                stage="human_agent",
                transactions=transactions,
                sentiment_distribution=dummy_distribution
            )
    # ...existing info response logic...
    # Otherwise, fallback to LLM/knowledge agent (placeholder)
    tts_audio = synthesize_speech("Could you please clarify your request?")
    audio_b64 = base64.b64encode(tts_audio).decode('utf-8') if tts_audio else None
    return ConversationResponse(
        text="Could you please clarify your request?",
        intent="clarification",
        entities=None,
        action_result=None,
        sentiment="Neutral",
        sentiment_score=sentiment_score,
        audio_data=audio_b64,
        stage="responding",
        sentiment_distribution=dummy_distribution
    )