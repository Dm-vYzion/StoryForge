"""
Vercel Serverless Function Entry Point for StoryForge API
"""
import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from mangum import Mangum
import logging
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

# Import from backend
from models import (
    Campaign, GameSession, Character, Quest, QuestState, Anchors,
    NarrativeEntry, StartSessionRequest, ActionRequest, EquipRequest, UnequipRequest
)
from seed_data import CAMPAIGNS
from services.ai_service import ai_service

# MongoDB connection - use environment variable
mongo_url = os.environ.get('MONGO_URL', '')
db_name = os.environ.get('DB_NAME', 'storyforge')

# Lazy connection
_client = None
_db = None

def get_db():
    global _client, _db
    if _client is None:
        _client = AsyncIOMotorClient(mongo_url)
        _db = _client[db_name]
    return _db

# Create FastAPI app
app = FastAPI(title="StoryForge API", version="1.0.0")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for Journal
class JournalEntry(BaseModel):
    id: str
    title: str
    description: Optional[str] = ""
    category: str
    turn: Optional[int] = 1
    timestamp: Optional[str] = None
    completed: Optional[bool] = False

class JournalEntryUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None

# ============== Health Check ==============

@app.get("/api")
async def root():
    return {"message": "StoryForge API", "version": "1.0.0"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

# ============== Database Seeding ==============

@app.post("/api/seed")
async def seed_database():
    """Manually seed the database with campaign data."""
    try:
        db = get_db()
        count = await db.campaigns.count_documents({})
        if count == 0:
            await db.campaigns.insert_many(CAMPAIGNS)
            return {"message": f"Seeded {len(CAMPAIGNS)} campaigns"}
        return {"message": f"Database already has {count} campaigns"}
    except Exception as e:
        logger.error(f"Error seeding database: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============== Campaign Routes ==============

@app.get("/api/campaigns")
async def get_campaigns():
    """Get all available campaigns."""
    try:
        db = get_db()
        # First ensure we have campaigns
        count = await db.campaigns.count_documents({})
        if count == 0:
            await db.campaigns.insert_many(CAMPAIGNS)
            logger.info(f"Auto-seeded {len(CAMPAIGNS)} campaigns")
        
        campaigns = await db.campaigns.find({}, {
            '_id': 0,
            'id': 1,
            'title': 1,
            'tagline': 1,
            'type': 1,
            'genres': 1,
            'difficulty': 1,
            'estimatedLength': 1,
            'backgroundImage': 1,
            'epicGoal': 1
        }).to_list(100)
        return campaigns
    except Exception as e:
        logger.error(f"Error fetching campaigns: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch campaigns")

@app.get("/api/campaigns/{campaign_id}")
async def get_campaign(campaign_id: str):
    """Get a specific campaign by ID."""
    try:
        db = get_db()
        campaign = await db.campaigns.find_one({"id": campaign_id}, {'_id': 0})
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
        return campaign
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching campaign: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch campaign")

@app.get("/api/campaigns/{campaign_id}/characters")
async def get_campaign_characters(campaign_id: str):
    """Get characters for a specific campaign."""
    try:
        db = get_db()
        campaign = await db.campaigns.find_one({"id": campaign_id}, {'_id': 0, 'characters': 1})
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
        return campaign.get('characters', [])
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching characters: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch characters")

# ============== Game Session Routes ==============

@app.post("/api/campaigns/{campaign_id}/start")
async def start_game_session(campaign_id: str, request: StartSessionRequest):
    """Start a new game session for a campaign."""
    try:
        db = get_db()
        campaign = await db.campaigns.find_one({"id": campaign_id}, {'_id': 0})
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        character = None
        for char in campaign.get('characters', []):
            if char.get('id') == request.characterId:
                character = char
                break
        
        if not character:
            raise HTTPException(status_code=404, detail="Character not found")
        
        opening_narrative = await ai_service.generate_opening_narrative(campaign, character)
        
        session = {
            "id": f"session_{datetime.utcnow().timestamp()}",
            "campaignId": campaign_id,
            "campaignTitle": campaign.get('title', ''),
            "campaignType": campaign.get('type', 'Fated'),
            "characterId": request.characterId,
            "character": character,
            "narrativeHistory": [{
                "turn": 1,
                "type": "dm",
                "content": opening_narrative,
                "locationImage": campaign.get('backgroundImage', ''),
                "timestamp": datetime.utcnow().isoformat()
            }],
            "currentLocation": campaign.get('backgroundImage', ''),
            "turnCount": 1,
            "tensionScore": 0,
            "quests": {"active": [], "completed": [], "failed": []},
            "anchors": {"npcs": [], "locations": [], "plotThreads": [], "items": [], "factions": [], "worldStates": []},
            "journal": [],
            "worldTruths": campaign.get('worldTruths', []),
            "createdAt": datetime.utcnow().isoformat(),
            "updatedAt": datetime.utcnow().isoformat()
        }
        
        await db.sessions.insert_one(session)
        session.pop('_id', None)
        
        return session
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting session: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to start session: {str(e)}")

@app.get("/api/sessions/{session_id}")
async def get_session(session_id: str):
    """Get a game session by ID."""
    try:
        db = get_db()
        session = await db.sessions.find_one({"id": session_id}, {'_id': 0})
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        return session
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching session: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch session")

@app.post("/api/sessions/{session_id}/action")
async def submit_action(session_id: str, request: ActionRequest):
    """Submit a player action and get AI response."""
    try:
        db = get_db()
        session = await db.sessions.find_one({"id": session_id}, {'_id': 0})
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        new_turn = session.get('turnCount', 0) + 1
        player_entry = {
            "turn": new_turn,
            "type": "player",
            "content": request.action,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        narrative_response = await ai_service.generate_narrative(session, request.action)
        analysis = await ai_service.analyze_action_impact(session, request.action, narrative_response)
        
        dm_entry = {
            "turn": new_turn,
            "type": "dm",
            "content": narrative_response,
            "locationImage": session.get('currentLocation', ''),
            "timestamp": datetime.utcnow().isoformat()
        }
        
        new_tension = min(100, max(0, session.get('tensionScore', 0) + analysis.get('tension_change', 0)))
        
        anchors = session.get('anchors', {})
        for npc in analysis.get('new_npcs', []):
            npc['firstMentioned'] = new_turn
            anchors.setdefault('npcs', []).append(npc)
        for loc in analysis.get('new_locations', []):
            loc['firstMentioned'] = new_turn
            loc['discovered'] = True
            anchors.setdefault('locations', []).append(loc)
        for thread in analysis.get('new_plot_threads', []):
            thread['firstMentioned'] = new_turn
            anchors.setdefault('plotThreads', []).append(thread)
        
        await db.sessions.update_one(
            {"id": session_id},
            {
                "$push": {"narrativeHistory": {"$each": [player_entry, dm_entry]}},
                "$set": {
                    "turnCount": new_turn,
                    "tensionScore": new_tension,
                    "anchors": anchors,
                    "updatedAt": datetime.utcnow().isoformat()
                }
            }
        )
        
        return {
            "narrative": narrative_response,
            "turnCount": new_turn,
            "tensionScore": new_tension,
            "analysis": analysis
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing action: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process action: {str(e)}")

@app.delete("/api/sessions/{session_id}")
async def end_session(session_id: str):
    """End and delete a game session."""
    try:
        db = get_db()
        result = await db.sessions.delete_one({"id": session_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Session not found")
        return {"message": "Session ended successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error ending session: {e}")
        raise HTTPException(status_code=500, detail="Failed to end session")

# ============== Quest Routes ==============

@app.get("/api/sessions/{session_id}/quests")
async def get_quests(session_id: str):
    """Get quests for a session."""
    try:
        db = get_db()
        session = await db.sessions.find_one({"id": session_id}, {'_id': 0, 'quests': 1})
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        return session.get('quests', {"active": [], "completed": [], "failed": []})
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch quests")

@app.post("/api/sessions/{session_id}/quests/{quest_id}/objectives/{objective_id}/complete")
async def complete_objective(session_id: str, quest_id: str, objective_id: str):
    """Mark a quest objective as completed."""
    try:
        db = get_db()
        session = await db.sessions.find_one({"id": session_id}, {'_id': 0})
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        quests = session.get('quests', {})
        active_quests = quests.get('active', [])
        
        for quest in active_quests:
            if quest.get('id') == quest_id:
                for obj in quest.get('subObjectives', []):
                    if obj.get('id') == objective_id:
                        obj['completed'] = True
                        break
                total = len(quest.get('subObjectives', []))
                completed = sum(1 for o in quest.get('subObjectives', []) if o.get('completed'))
                quest['progress'] = int((completed / total) * 100) if total > 0 else 0
                break
        
        await db.sessions.update_one(
            {"id": session_id},
            {"$set": {"quests": quests, "updatedAt": datetime.utcnow().isoformat()}}
        )
        
        return quests
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to complete objective")

# ============== Anchors Routes ==============

@app.get("/api/sessions/{session_id}/anchors")
async def get_anchors(session_id: str):
    """Get story anchors for a session."""
    try:
        db = get_db()
        session = await db.sessions.find_one({"id": session_id}, {'_id': 0, 'anchors': 1})
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        return session.get('anchors', {})
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch anchors")

# ============== Equipment Routes ==============

@app.post("/api/sessions/{session_id}/character/equip")
async def equip_item(session_id: str, request: EquipRequest):
    """Equip an item from inventory to a slot."""
    try:
        db = get_db()
        session = await db.sessions.find_one({"id": session_id}, {'_id': 0})
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        character = session.get('character', {})
        inventory = character.get('inventory', [])
        equipment = character.get('equipment', {})
        
        item_to_equip = None
        item_index = None
        for i, item in enumerate(inventory):
            if item.get('id') == request.itemId:
                item_to_equip = item
                item_index = i
                break
        
        if item_to_equip is None:
            raise HTTPException(status_code=404, detail="Item not found in inventory")
        
        existing_item = equipment.get(request.slot)
        inventory.pop(item_index)
        
        if existing_item:
            existing_item['quantity'] = 1
            inventory.append(existing_item)
        
        equipment[request.slot] = item_to_equip
        character['inventory'] = inventory
        character['equipment'] = equipment
        
        await db.sessions.update_one(
            {"id": session_id},
            {"$set": {"character": character, "updatedAt": datetime.utcnow().isoformat()}}
        )
        
        return character
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to equip item")

@app.post("/api/sessions/{session_id}/character/unequip")
async def unequip_item(session_id: str, request: UnequipRequest):
    """Unequip an item from a slot to inventory."""
    try:
        db = get_db()
        session = await db.sessions.find_one({"id": session_id}, {'_id': 0})
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        character = session.get('character', {})
        inventory = character.get('inventory', [])
        equipment = character.get('equipment', {})
        
        item = equipment.get(request.slot)
        if not item:
            raise HTTPException(status_code=404, detail="No item in that slot")
        
        item['quantity'] = 1
        inventory.append(item)
        equipment[request.slot] = None
        
        character['inventory'] = inventory
        character['equipment'] = equipment
        
        await db.sessions.update_one(
            {"id": session_id},
            {"$set": {"character": character, "updatedAt": datetime.utcnow().isoformat()}}
        )
        
        return character
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to unequip item")

# ============== Journal Routes ==============

@app.post("/api/sessions/{session_id}/journal")
async def add_journal_entry(session_id: str, entry: JournalEntry):
    """Add a new journal entry to the session."""
    try:
        db = get_db()
        session = await db.sessions.find_one({"id": session_id}, {'_id': 0})
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        entry_dict = entry.dict()
        entry_dict['createdAt'] = datetime.utcnow().isoformat()
        
        await db.sessions.update_one(
            {"id": session_id},
            {
                "$push": {"journal": entry_dict},
                "$set": {"updatedAt": datetime.utcnow().isoformat()}
            }
        )
        
        return entry_dict
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to add journal entry")

@app.put("/api/sessions/{session_id}/journal/{entry_id}")
async def update_journal_entry(session_id: str, entry_id: str, updates: JournalEntryUpdate):
    """Update a journal entry."""
    try:
        db = get_db()
        session = await db.sessions.find_one({"id": session_id}, {'_id': 0})
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        journal = session.get('journal', [])
        entry_found = False
        
        for entry in journal:
            if entry.get('id') == entry_id:
                if updates.title is not None:
                    entry['title'] = updates.title
                if updates.description is not None:
                    entry['description'] = updates.description
                if updates.completed is not None:
                    entry['completed'] = updates.completed
                entry['updatedAt'] = datetime.utcnow().isoformat()
                entry_found = True
                break
        
        if not entry_found:
            raise HTTPException(status_code=404, detail="Journal entry not found")
        
        await db.sessions.update_one(
            {"id": session_id},
            {"$set": {"journal": journal, "updatedAt": datetime.utcnow().isoformat()}}
        )
        
        return {"message": "Journal entry updated"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to update journal entry")

@app.delete("/api/sessions/{session_id}/journal/{entry_id}")
async def delete_journal_entry(session_id: str, entry_id: str):
    """Delete a journal entry."""
    try:
        db = get_db()
        result = await db.sessions.update_one(
            {"id": session_id},
            {
                "$pull": {"journal": {"id": entry_id}},
                "$set": {"updatedAt": datetime.utcnow().isoformat()}
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Session or entry not found")
        
        return {"message": "Journal entry deleted"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to delete journal entry")

# Mangum handler for AWS Lambda / Vercel
handler = Mangum(app, lifespan="off")
