from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
from bson import ObjectId
import os, uuid, logging

logger = logging.getLogger(__name__)


def create_ai_mentor_routes(db, get_current_user):
    router = APIRouter(prefix="/ai-mentor")

    class ChatMessage(BaseModel):
        message: str
        board: Optional[str] = ""
        subject: Optional[str] = ""
        topic: Optional[str] = ""
        session_id: Optional[str] = ""

    class ClearChat(BaseModel):
        session_id: str

    SYSTEM_PROMPT = """You are EdVNova AI Mentor — a friendly, knowledgeable academic assistant for Cambridge IGCSE, AS Level, and A Level students studying Mathematics, Physics, Chemistry, and Biology.

Your role:
- Explain concepts step-by-step with clarity
- Focus on exam-oriented understanding
- Simplify difficult topics using analogies and examples
- Encourage conceptual understanding over memorization
- Use structured reasoning and clear formatting
- When relevant, mention formulas, key definitions, and examiner tips
- Admit when you're unsure — never fabricate information

Response style:
- Use markdown formatting (headings, bold, lists, code blocks for formulas)
- Keep explanations student-friendly (ages 14-18)
- Break complex topics into digestible steps
- Include worked examples where helpful
- End with a brief summary or key takeaway when appropriate

You are NOT a replacement for a teacher. You are a supportive learning companion."""

    def build_context_prompt(board, subject, topic):
        parts = []
        if board: parts.append(f"Board: {board.upper()}")
        if subject: parts.append(f"Subject: {subject.title()}")
        if topic: parts.append(f"Topic: {topic}")
        if parts:
            return f"\n\nThe student is currently studying: {', '.join(parts)}. Tailor your response to this context and curriculum level."
        return ""

    @router.post("/chat")
    async def chat(data: ChatMessage, request: Request):
        user = await get_current_user(request)
        api_key = os.environ.get("EMERGENT_LLM_KEY", "").strip()
        if not api_key:
            raise HTTPException(503, "AI Mentor is not configured. Please contact admin.")

        session_id = data.session_id or str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()

        # Save user message
        await db.ai_chats.insert_one({
            "user_id": user["id"],
            "session_id": session_id,
            "role": "user",
            "content": data.message,
            "board": data.board,
            "subject": data.subject,
            "topic": data.topic,
            "created_at": now,
        })

        # Build conversation history from DB
        history = await db.ai_chats.find(
            {"user_id": user["id"], "session_id": session_id}
        ).sort("created_at", 1).to_list(50)

        try:
            from emergentintegrations.llm.chat import LlmChat, UserMessage

            system = SYSTEM_PROMPT + build_context_prompt(data.board, data.subject, data.topic)

            # Build conversation context from history for the system message
            history_context = ""
            for msg in history[:-1]:  # exclude the message we just saved
                role_label = "Student" if msg["role"] == "user" else "Mentor"
                history_context += f"\n{role_label}: {msg['content']}"

            if history_context:
                system += f"\n\nConversation so far:{history_context}\n\nNow respond to the student's latest message."

            chat_instance = LlmChat(
                api_key=api_key,
                session_id=f"edvnova-{user['id']}-{session_id}-{len(history)}",
                system_message=system,
            ).with_model("openai", "gpt-4o-mini")

            user_msg = UserMessage(text=data.message)
            response_text = await chat_instance.send_message(user_msg)

        except Exception as e:
            logger.error(f"AI Mentor error: {e}")
            response_text = "I apologize, but I'm having trouble connecting right now. Please try again in a moment."

        # Save assistant response
        await db.ai_chats.insert_one({
            "user_id": user["id"],
            "session_id": session_id,
            "role": "assistant",
            "content": response_text,
            "board": data.board,
            "subject": data.subject,
            "topic": data.topic,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

        return {
            "response": response_text,
            "session_id": session_id,
        }

    @router.get("/sessions")
    async def get_sessions(request: Request):
        user = await get_current_user(request)
        pipeline = [
            {"$match": {"user_id": user["id"], "role": "user"}},
            {"$sort": {"created_at": -1}},
            {"$group": {
                "_id": "$session_id",
                "last_message": {"$first": "$content"},
                "last_at": {"$first": "$created_at"},
                "board": {"$first": "$board"},
                "subject": {"$first": "$subject"},
                "topic": {"$first": "$topic"},
                "count": {"$sum": 1},
            }},
            {"$sort": {"last_at": -1}},
            {"$limit": 20},
        ]
        sessions = await db.ai_chats.aggregate(pipeline).to_list(20)
        return [{
            "session_id": s["_id"],
            "preview": s["last_message"][:80] + "..." if len(s["last_message"]) > 80 else s["last_message"],
            "last_at": s["last_at"],
            "board": s.get("board", ""),
            "subject": s.get("subject", ""),
            "topic": s.get("topic", ""),
            "message_count": s["count"],
        } for s in sessions]

    @router.get("/history/{session_id}")
    async def get_history(session_id: str, request: Request):
        user = await get_current_user(request)
        messages = await db.ai_chats.find(
            {"user_id": user["id"], "session_id": session_id},
            {"_id": 0, "role": 1, "content": 1, "created_at": 1, "board": 1, "subject": 1, "topic": 1}
        ).sort("created_at", 1).to_list(200)
        return messages

    @router.delete("/session/{session_id}")
    async def delete_session(session_id: str, request: Request):
        user = await get_current_user(request)
        await db.ai_chats.delete_many({"user_id": user["id"], "session_id": session_id})
        return {"message": "Chat session deleted"}

    @router.delete("/clear-all")
    async def clear_all_chats(request: Request):
        user = await get_current_user(request)
        await db.ai_chats.delete_many({"user_id": user["id"]})
        return {"message": "All chat history cleared"}

    return router
