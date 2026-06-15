from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from scraper import scrape_all_channels
from hindsight_client import store_memory, query_memory
from groq_client import chat_with_agent

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session store
sessions = {}


class StartRequest(BaseModel):
    product_name: str
    product_url: str


class ChatRequest(BaseModel):
    session_id: str
    message: str


class NewDataRequest(BaseModel):
    session_id: str


@app.get("/")
async def root():
    return {"status": "Feedback Intelligence API is running"}


@app.post("/start")
async def start_session(req: StartRequest):
    session_id = f"{req.product_name.lower().replace(' ', '_')}_{int(datetime.now().timestamp())}"

    sessions[session_id] = {
        "session_id": session_id,
        "product_name": req.product_name,
        "product_url": req.product_url,
        "interaction": 0,
        "history": []
    }

    data = await scrape_all_channels(req.product_name, req.product_url, batch=1)
    memory_summary = await store_memory(session_id, data, interaction=1)

    sessions[session_id]["interaction"] = 1
    sessions[session_id]["history"].append({
        "interaction": 1,
        "date": datetime.now().isoformat(),
        "collected": data["summary"],
        "learned": memory_summary
    })

    return {
        "session_id": session_id,
        "product_name": req.product_name,
        "interaction": 1,
        "data": data,
        "memory_summary": memory_summary,
        "history": sessions[session_id]["history"]
    }


@app.post("/new-data")
async def get_new_data(req: NewDataRequest):
    session = sessions.get(req.session_id)
    if not session:
        return {"error": "Session not found"}

    next_interaction = session["interaction"] + 1
    data = await scrape_all_channels(
        session["product_name"],
        session["product_url"],
        batch=next_interaction
    )

    memory_summary = await store_memory(req.session_id, data, interaction=next_interaction)

    sessions[req.session_id]["interaction"] = next_interaction
    sessions[req.session_id]["history"].append({
        "interaction": next_interaction,
        "date": datetime.now().isoformat(),
        "collected": data["summary"],
        "learned": memory_summary
    })

    return {
        "session_id": req.session_id,
        "product_name": session["product_name"],
        "interaction": next_interaction,
        "data": data,
        "memory_summary": memory_summary,
        "history": sessions[req.session_id]["history"]
    }


@app.post("/chat")
async def chat(req: ChatRequest):
    session = sessions.get(req.session_id)
    if not session:
        return {"error": "Session not found"}

    memory_context = await query_memory(req.session_id, req.message)

    response = await chat_with_agent(
        product_name=session["product_name"],
        question=req.message,
        memory_context=memory_context,
        interaction=session["interaction"]
    )

    return {
        "response": response,
        "interaction": session["interaction"],
        "memory_used": memory_context[:300] + "..." if len(memory_context) > 300 else memory_context
    }


@app.get("/session/{session_id}")
async def get_session(session_id: str):
    session = sessions.get(session_id)
    if not session:
        return {"error": "Session not found"}
    return session