from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

# Helper function to generate UUIDs
def generate_id():
    return str(uuid.uuid4())

# Stats model
class Stats(BaseModel):
    strength: int = 10
    dexterity: int = 10
    constitution: int = 10
    intelligence: int = 10
    wisdom: int = 10
    charisma: int = 10

# HP model
class HP(BaseModel):
    current: int
    max: int

# Item model
class Item(BaseModel):
    id: str = Field(default_factory=generate_id)
    name: str
    type: str  # Weapon, Armor, Shield, Consumable, Tool, etc.
    rarity: str = "Common"  # Common, Uncommon, Rare, Very Rare, Legendary, Artifact
    damage: Optional[str] = None
    ac: Optional[int] = None
    effect: Optional[str] = None
    quantity: int = 1

# Equipment slots
class Equipment(BaseModel):
    head: Optional[Item] = None
    neck: Optional[Item] = None
    body: Optional[Item] = None
    mainHand: Optional[Item] = None
    offHand: Optional[Item] = None
    cloak: Optional[Item] = None
    feet: Optional[Item] = None
    ring1: Optional[Item] = None
    ring2: Optional[Item] = None

# Character model
class Character(BaseModel):
    id: str = Field(default_factory=generate_id)
    name: str
    class_name: str = Field(alias="class")
    level: int = 1
    description: str = ""
    portraitUrl: str = ""
    stats: Stats = Field(default_factory=Stats)
    hp: HP
    equipment: Equipment = Field(default_factory=Equipment)
    inventory: List[Item] = []

    class Config:
        populate_by_name = True

# World Truth model
class WorldTruth(BaseModel):
    id: str = Field(default_factory=generate_id)
    statement: str
    category: str  # Historical Fact, Geographic Feature, Political Structure, etc.
    visibility: str = "Hidden"  # Known, Hidden, Secret

# Quest Objective model
class QuestObjective(BaseModel):
    id: str = Field(default_factory=generate_id)
    title: str
    completed: bool = False

# Quest model
class Quest(BaseModel):
    id: str = Field(default_factory=generate_id)
    title: str
    description: str
    type: str = "side"  # main, side, hidden
    status: str = "active"  # active, completed, failed
    progress: int = 0
    subObjectives: List[QuestObjective] = []

# Anchor models (NPCs, Locations, etc.)
class NPC(BaseModel):
    id: str = Field(default_factory=generate_id)
    name: str
    description: str
    firstMentioned: int = 0
    disposition: int = 0  # -100 to 100

class Location(BaseModel):
    id: str = Field(default_factory=generate_id)
    name: str
    description: str
    atmosphere: str = "Neutral"
    discovered: bool = False
    firstMentioned: int = 0

class PlotThread(BaseModel):
    id: str = Field(default_factory=generate_id)
    name: str
    description: str
    firstMentioned: int = 0

class AnchorItem(BaseModel):
    id: str = Field(default_factory=generate_id)
    name: str
    description: str
    significance: str = "Mundane"

class Faction(BaseModel):
    id: str = Field(default_factory=generate_id)
    name: str
    description: str
    reputation: int = 0

class WorldState(BaseModel):
    id: str = Field(default_factory=generate_id)
    name: str
    description: str
    timestamp: int = 0

# Anchors container
class Anchors(BaseModel):
    npcs: List[NPC] = []
    locations: List[Location] = []
    plotThreads: List[PlotThread] = []
    items: List[AnchorItem] = []
    factions: List[Faction] = []
    worldStates: List[WorldState] = []

# Quests container
class QuestState(BaseModel):
    active: List[Quest] = []
    completed: List[Quest] = []
    failed: List[Quest] = []

# Campaign model (stored in DB)
class Campaign(BaseModel):
    id: str = Field(default_factory=generate_id)
    title: str
    tagline: str = ""
    type: str = "Fated"  # Epic, Fated, Final Season
    genres: List[str] = []
    difficulty: str = "Intermediate"
    estimatedLength: str = "Medium"
    backgroundImage: str = ""
    epicGoal: Optional[str] = None
    worldTruths: List[WorldTruth] = []
    characters: List[Character] = []
    initialQuests: QuestState = Field(default_factory=QuestState)
    initialAnchors: Anchors = Field(default_factory=Anchors)

# Game Session model (active game state)
class NarrativeEntry(BaseModel):
    turn: int
    type: str  # "dm" or "player"
    content: str
    locationImage: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class GameSession(BaseModel):
    id: str = Field(default_factory=generate_id)
    campaignId: str
    campaignTitle: str
    campaignType: str
    characterId: str
    character: Character
    narrativeHistory: List[NarrativeEntry] = []
    currentLocation: str = ""
    turnCount: int = 0
    tensionScore: int = 0
    quests: QuestState = Field(default_factory=QuestState)
    anchors: Anchors = Field(default_factory=Anchors)
    worldTruths: List[WorldTruth] = []
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

# API Request/Response models
class StartSessionRequest(BaseModel):
    characterId: str

class ActionRequest(BaseModel):
    action: str
    actionType: str = "custom"  # attack, persuade, investigate, stealth, custom

class EquipRequest(BaseModel):
    itemId: str
    slot: str

class UnequipRequest(BaseModel):
    slot: str
