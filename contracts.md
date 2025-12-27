# StoryForge - API Contracts & Integration Guide

## Overview
This document captures the API contracts between frontend and backend for the StoryForge interactive fiction platform.

## Current Mock Data (to be replaced with API calls)

### 1. Campaigns Endpoint
**Mock Location:** `/src/data/mockData.js` - `campaigns` array

**GET /api/campaigns**
```json
Response: [{
  "id": "string",
  "title": "string",
  "tagline": "string",
  "type": "Fated | Epic | Final Season",
  "genres": ["string"],
  "difficulty": "Beginner | Intermediate | Advanced",
  "estimatedLength": "Short | Medium | Long | Epic",
  "backgroundImage": "string (URL)",
  "turnCount": "number",
  "lastPlayed": "ISO date string | null",
  "progress": "number (0-100)",
  "tensionScore": "number (0-100)",
  "characters": [Character]
}]
```

### 2. Characters Endpoint
**Mock Location:** `campaigns[].characters` array

**GET /api/campaigns/{campaignId}/characters**
```json
Response: [{
  "id": "string",
  "name": "string",
  "class": "string",
  "level": "number",
  "description": "string",
  "portraitUrl": "string (URL)",
  "stats": {
    "strength": "number",
    "dexterity": "number",
    "constitution": "number",
    "intelligence": "number",
    "wisdom": "number",
    "charisma": "number"
  },
  "hp": { "current": "number", "max": "number" },
  "equipment": {
    "head": "Item | null",
    "neck": "Item | null",
    "body": "Item | null",
    "mainHand": "Item | null",
    "offHand": "Item | null",
    "cloak": "Item | null",
    "feet": "Item | null",
    "ring1": "Item | null",
    "ring2": "Item | null"
  },
  "inventory": [Item]
}]
```

### 3. Game Session Endpoints

**POST /api/campaigns/{campaignId}/start**
```json
Request: { "characterId": "string" }
Response: {
  "sessionId": "string",
  "initialNarrative": "string",
  "locationImage": "string (URL)",
  "quests": QuestState,
  "anchors": AnchorState
}
```

**POST /api/campaigns/{campaignId}/action** (AI Integration - Gemini)
```json
Request: {
  "sessionId": "string",
  "action": "string",
  "actionType": "attack | persuade | investigate | stealth | custom"
}
Response (Streaming): {
  "narrative": "string",
  "locationImage": "string (URL) | null",
  "questUpdates": [QuestUpdate],
  "anchorUpdates": [AnchorUpdate],
  "tensionChange": "number"
}
```

### 4. Quest Log Endpoints
**Mock Location:** `/src/data/mockData.js` - `initialQuests`

**GET /api/campaigns/{campaignId}/quests**
```json
Response: {
  "active": [Quest],
  "completed": [Quest],
  "failed": [Quest]
}
```

**Quest Object:**
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "type": "main | side | hidden",
  "status": "active | completed | failed",
  "progress": "number (0-100)",
  "subObjectives": [{
    "id": "string",
    "title": "string",
    "completed": "boolean"
  }]
}
```

### 5. Anchors (Story Bible) Endpoints
**Mock Location:** `/src/data/mockData.js` - `initialAnchors`

**GET /api/campaigns/{campaignId}/anchors**
```json
Response: {
  "npcs": [{ "id", "name", "description", "firstMentioned", "disposition" }],
  "locations": [{ "id", "name", "description", "atmosphere", "discovered" }],
  "plotThreads": [{ "id", "name", "description", "firstMentioned" }],
  "items": [{ "id", "name", "description", "significance" }],
  "factions": [{ "id", "name", "description", "reputation" }],
  "worldStates": [{ "id", "name", "description", "timestamp" }]
}
```

### 6. Equipment Endpoints

**POST /api/characters/{characterId}/equip**
```json
Request: { "itemId": "string", "slot": "string" }
Response: { "success": true, "updatedStats": Stats }
```

**POST /api/characters/{characterId}/unequip**
```json
Request: { "slot": "string" }
Response: { "success": true, "updatedStats": Stats }
```

---

## Backend Implementation Plan

### Phase 1: Core Models & Data
1. **MongoDB Collections:**
   - `campaigns` - Pre-built campaign blueprints
   - `game_sessions` - Active player sessions
   - `characters` - Character templates & instances
   - `quests` - Quest definitions & states
   - `anchors` - Story anchor definitions & states

### Phase 2: API Endpoints
1. Campaigns CRUD
2. Character selection & session initialization
3. Quest & Anchor state management

### Phase 3: AI Integration (Gemini)
1. **Narrative Generation:**
   - Process player actions
   - Generate immersive DM responses
   - Maintain narrative coherence

2. **Campaign Intelligence:**
   - Auto-detect quest progress
   - Create/update story anchors
   - Manage tension scoring

### Environment Variables Required
```
MONGO_URL=<already configured>
GEMINI_API_KEY=AIzaSyCh8w5dpw6KN_MAq-JMQW3U9E6xKrjsRm8
```

---

## Frontend Integration Points

### Files to Update:
1. **`/src/contexts/GameContext.jsx`**
   - Replace mock data with API calls
   - Add session management
   - Implement streaming narrative

2. **`/src/components/MainGame.jsx`**
   - Connect to WebSocket for streaming
   - Handle AI response updates

3. **`/src/data/mockData.js`**
   - Seed data will be moved to MongoDB
   - File can be removed after migration
