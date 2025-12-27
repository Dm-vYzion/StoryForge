from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Optional
from datetime import datetime
import json

from models import (
    Campaign, GameSession, Character, Quest, QuestState, Anchors,
    NarrativeEntry, StartSessionRequest, ActionRequest, EquipRequest, UnequipRequest
)
from seed_data import CAMPAIGNS
from services.ai_service import ai_service

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'storyforge')]

# Create the main app
app = FastAPI(title="StoryForge API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============== Startup Events ==============

@app.on_event("startup")
async def startup_event():
    """Seed the database with campaign data on startup."""
    try:
        # Check if campaigns already exist
        count = await db.campaigns.count_documents({})
        if count == 0:
            logger.info("Seeding database with campaign data...")
            await db.campaigns.insert_many(CAMPAIGNS)
            logger.info(f"Seeded {len(CAMPAIGNS)} campaigns")
        else:
            logger.info(f"Database already has {count} campaigns")
    except Exception as e:
        logger.error(f"Error seeding database: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

# ============== Campaign Routes ==============

@api_router.get("/")
async def root():
    return {"message": "StoryForge API", "version": "1.0.0"}

@api_router.get("/campaigns")
async def get_campaigns():
    """Get all available campaigns."""
    try:
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

@api_router.get("/campaigns/{campaign_id}")
async def get_campaign(campaign_id: str):
    """Get a specific campaign by ID."""
    try:
        campaign = await db.campaigns.find_one({"id": campaign_id}, {'_id': 0})
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
        return campaign
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching campaign {campaign_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch campaign")

@api_router.get("/campaigns/{campaign_id}/characters")
async def get_campaign_characters(campaign_id: str):
    """Get characters for a specific campaign."""
    try:
        campaign = await db.campaigns.find_one({"id": campaign_id}, {'_id': 0, 'characters': 1})
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
        return campaign.get('characters', [])
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching characters for {campaign_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch characters")

# ============== Game Session Routes ==============

@api_router.post("/campaigns/{campaign_id}/start")
async def start_game_session(campaign_id: str, request: StartSessionRequest):
    """Start a new game session for a campaign."""
    try:
        # Get campaign
        campaign = await db.campaigns.find_one({"id": campaign_id}, {'_id': 0})
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        # Find character
        character = None
        for char in campaign.get('characters', []):
            if char.get('id') == request.characterId:
                character = char
                break
        
        if not character:
            raise HTTPException(status_code=404, detail="Character not found")
        
        # Generate opening narrative
        opening_narrative = await ai_service.generate_opening_narrative(campaign, character)
        
        # Create session
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
            "quests": campaign.get('initialQuests', {"active": [], "completed": [], "failed": []}),
            "anchors": campaign.get('initialAnchors', {"npcs": [], "locations": [], "plotThreads": [], "items": [], "factions": [], "worldStates": []}),
            "worldTruths": campaign.get('worldTruths', []),
            "createdAt": datetime.utcnow().isoformat(),
            "updatedAt": datetime.utcnow().isoformat()
        }
        
        # Save session to database
        await db.sessions.insert_one(session)
        
        # Remove _id before returning
        session.pop('_id', None)
        
        return session
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting session: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to start session: {str(e)}")

@api_router.get("/sessions/{session_id}")
async def get_session(session_id: str):
    """Get a game session by ID."""
    try:
        session = await db.sessions.find_one({"id": session_id}, {'_id': 0})
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        return session
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching session {session_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch session")

@api_router.post("/sessions/{session_id}/action")
async def submit_action(session_id: str, request: ActionRequest):
    """Submit a player action and get AI response."""
    try:
        # Get session
        session = await db.sessions.find_one({"id": session_id}, {'_id': 0})
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Add player action to history
        new_turn = session.get('turnCount', 0) + 1
        player_entry = {
            "turn": new_turn,
            "type": "player",
            "content": request.action,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Generate AI response
        narrative_response = await ai_service.generate_narrative(session, request.action)
        
        # Analyze action for updates
        analysis = await ai_service.analyze_action_impact(session, request.action, narrative_response)
        
        # Create DM response entry
        dm_entry = {
            "turn": new_turn,
            "type": "dm",
            "content": narrative_response,
            "locationImage": session.get('currentLocation', ''),
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Update session data
        new_tension = min(100, max(0, session.get('tensionScore', 0) + analysis.get('tension_change', 0)))
        
        # Update anchors with new discoveries
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
        
        # Update database
        update_result = await db.sessions.update_one(
            {"id": session_id},
            {
                "$push": {
                    "narrativeHistory": {"$each": [player_entry, dm_entry]}
                },
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

@api_router.delete("/sessions/{session_id}")
async def end_session(session_id: str):
    """End and delete a game session."""
    try:
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

@api_router.get("/sessions/{session_id}/quests")
async def get_quests(session_id: str):
    """Get quests for a session."""
    try:
        session = await db.sessions.find_one({"id": session_id}, {'_id': 0, 'quests': 1})
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        return session.get('quests', {"active": [], "completed": [], "failed": []})
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching quests: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch quests")

@api_router.post("/sessions/{session_id}/quests/{quest_id}/objectives/{objective_id}/complete")
async def complete_objective(session_id: str, quest_id: str, objective_id: str):
    """Mark a quest objective as completed."""
    try:
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
                
                # Recalculate progress
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
        logger.error(f"Error completing objective: {e}")
        raise HTTPException(status_code=500, detail="Failed to complete objective")

# ============== Anchors Routes ==============

@api_router.get("/sessions/{session_id}/anchors")
async def get_anchors(session_id: str):
    """Get story anchors for a session."""
    try:
        session = await db.sessions.find_one({"id": session_id}, {'_id': 0, 'anchors': 1})
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        return session.get('anchors', {})
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching anchors: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch anchors")

# ============== Equipment Routes ==============

@api_router.post("/sessions/{session_id}/character/equip")
async def equip_item(session_id: str, request: EquipRequest):
    """Equip an item from inventory to a slot."""
    try:
        session = await db.sessions.find_one({"id": session_id}, {'_id': 0})
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        character = session.get('character', {})
        inventory = character.get('inventory', [])
        equipment = character.get('equipment', {})
        
        # Find item in inventory
        item_to_equip = None
        item_index = None
        for i, item in enumerate(inventory):
            if item.get('id') == request.itemId:
                item_to_equip = item
                item_index = i
                break
        
        if item_to_equip is None:
            raise HTTPException(status_code=404, detail="Item not found in inventory")
        
        # Get existing item in slot (if any)
        existing_item = equipment.get(request.slot)
        
        # Remove item from inventory
        inventory.pop(item_index)
        
        # Add existing item back to inventory
        if existing_item:
            existing_item['quantity'] = 1
            inventory.append(existing_item)
        
        # Equip new item
        equipment[request.slot] = item_to_equip
        
        # Update character
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
        logger.error(f"Error equipping item: {e}")
        raise HTTPException(status_code=500, detail="Failed to equip item")

@api_router.post("/sessions/{session_id}/character/unequip")
async def unequip_item(session_id: str, request: UnequipRequest):
    """Unequip an item from a slot to inventory."""
    try:
        session = await db.sessions.find_one({"id": session_id}, {'_id': 0})
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        character = session.get('character', {})
        inventory = character.get('inventory', [])
        equipment = character.get('equipment', {})
        
        # Get item from slot
        item = equipment.get(request.slot)
        if not item:
            raise HTTPException(status_code=404, detail="No item in that slot")
        
        # Move to inventory
        item['quantity'] = 1
        inventory.append(item)
        
        # Clear slot
        equipment[request.slot] = None
        
        # Update character
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
        logger.error(f"Error unequipping item: {e}")
        raise HTTPException(status_code=500, detail="Failed to unequip item")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
