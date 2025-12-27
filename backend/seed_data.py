"""
Seed data for StoryForge campaigns.
This data will be loaded into MongoDB on startup.
"""

CAMPAIGNS = [
    {
        "id": "curse-of-ravencrest",
        "title": "The Curse of Ravencrest Manor",
        "tagline": "Uncover the dark secrets lurking within an ancient estate where the dead refuse to rest.",
        "type": "Fated",
        "genres": ["Horror", "Mystery"],
        "difficulty": "Intermediate",
        "estimatedLength": "Medium",
        "backgroundImage": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1920&q=80",
        "worldTruths": [
            {
                "id": "truth_1",
                "statement": "The Ravencrest family made a pact with an entity from beyond the veil 300 years ago.",
                "category": "Historical Fact",
                "visibility": "Hidden"
            },
            {
                "id": "truth_2",
                "statement": "The manor exists partially in our world and partially in the Shadowfell.",
                "category": "Cosmic Rule",
                "visibility": "Secret"
            },
            {
                "id": "truth_3",
                "statement": "Only those of Ravencrest blood can truly die within the manor's walls.",
                "category": "Magical Law",
                "visibility": "Hidden"
            }
        ],
        "characters": [
            {
                "id": "char_1",
                "name": "Viktor Ashford",
                "class": "Fighter",
                "level": 3,
                "description": "A veteran ghost hunter seeking answers about his missing sister.",
                "portraitUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
                "stats": {"strength": 16, "dexterity": 12, "constitution": 14, "intelligence": 10, "wisdom": 13, "charisma": 11},
                "hp": {"current": 28, "max": 28},
                "equipment": {
                    "mainHand": {"id": "item_1", "name": "Silver Longsword", "type": "Weapon", "damage": "1d8+3 slashing", "rarity": "Uncommon"},
                    "offHand": {"id": "item_2", "name": "Lantern Shield", "type": "Shield", "ac": 2, "rarity": "Common"},
                    "body": {"id": "item_3", "name": "Chainmail", "type": "Armor", "ac": 16, "rarity": "Common"},
                    "neck": {"id": "item_4", "name": "Amulet of Protection", "type": "Amulet", "effect": "+1 to saving throws", "rarity": "Rare"},
                    "head": None, "cloak": None, "feet": None, "ring1": None, "ring2": None
                },
                "inventory": [
                    {"id": "item_5", "name": "Health Potion", "type": "Consumable", "effect": "Restore 2d4+2 HP", "quantity": 2, "rarity": "Common"},
                    {"id": "item_6", "name": "Holy Water", "type": "Consumable", "effect": "2d6 radiant damage to undead", "quantity": 3, "rarity": "Common"},
                    {"id": "item_7", "name": "Rope (50ft)", "type": "Tool", "quantity": 1, "rarity": "Common"}
                ]
            },
            {
                "id": "char_2",
                "name": "Elara Nightwhisper",
                "class": "Rogue",
                "level": 3,
                "description": "A cunning thief drawn by rumors of the Ravencrest treasure.",
                "portraitUrl": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
                "stats": {"strength": 10, "dexterity": 17, "constitution": 12, "intelligence": 14, "wisdom": 11, "charisma": 14},
                "hp": {"current": 21, "max": 21},
                "equipment": {
                    "mainHand": {"id": "item_10", "name": "Shadow Dagger", "type": "Weapon", "damage": "1d4+3 piercing", "rarity": "Uncommon", "effect": "+1d6 in dim light"},
                    "offHand": {"id": "item_11", "name": "Parrying Dagger", "type": "Weapon", "damage": "1d4 piercing", "rarity": "Common"},
                    "body": {"id": "item_12", "name": "Leather Armor", "type": "Armor", "ac": 11, "rarity": "Common"},
                    "cloak": {"id": "item_13", "name": "Cloak of Elvenkind", "type": "Cloak", "effect": "Advantage on Stealth checks", "rarity": "Rare"},
                    "feet": {"id": "item_14", "name": "Boots of Silence", "type": "Boots", "effect": "No sound when walking", "rarity": "Uncommon"},
                    "head": None, "neck": None, "ring1": None, "ring2": None
                },
                "inventory": [
                    {"id": "item_15", "name": "Thieves' Tools", "type": "Tool", "quantity": 1, "rarity": "Common"},
                    {"id": "item_16", "name": "Smoke Bomb", "type": "Consumable", "effect": "Creates 10ft smoke cloud", "quantity": 3, "rarity": "Uncommon"}
                ]
            },
            {
                "id": "char_3",
                "name": "Brother Aldric",
                "class": "Cleric",
                "level": 3,
                "description": "A holy man sent by the church to purify the cursed grounds.",
                "portraitUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80",
                "stats": {"strength": 12, "dexterity": 10, "constitution": 14, "intelligence": 12, "wisdom": 17, "charisma": 13},
                "hp": {"current": 24, "max": 24},
                "equipment": {
                    "mainHand": {"id": "item_20", "name": "Holy Mace", "type": "Weapon", "damage": "1d6+1 bludgeoning", "rarity": "Uncommon", "effect": "+1d4 radiant vs undead"},
                    "offHand": {"id": "item_21", "name": "Sacred Shield", "type": "Shield", "ac": 2, "rarity": "Uncommon", "effect": "Resistance to necrotic"},
                    "body": {"id": "item_22", "name": "Scale Mail", "type": "Armor", "ac": 14, "rarity": "Common"},
                    "neck": {"id": "item_23", "name": "Holy Symbol of Pelor", "type": "Focus", "effect": "Required for spellcasting", "rarity": "Common"},
                    "head": None, "cloak": None, "feet": None, "ring1": None, "ring2": None
                },
                "inventory": [
                    {"id": "item_24", "name": "Scroll of Turn Undead", "type": "Consumable", "quantity": 2, "rarity": "Uncommon"},
                    {"id": "item_25", "name": "Vial of Sacred Oil", "type": "Consumable", "quantity": 5, "rarity": "Common"}
                ]
            },
            {
                "id": "char_4",
                "name": "Lyra Stormwind",
                "class": "Wizard",
                "level": 3,
                "description": "An arcane scholar researching the planar anomalies of the manor.",
                "portraitUrl": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
                "stats": {"strength": 8, "dexterity": 14, "constitution": 12, "intelligence": 18, "wisdom": 12, "charisma": 10},
                "hp": {"current": 17, "max": 17},
                "equipment": {
                    "mainHand": {"id": "item_30", "name": "Staff of the Void", "type": "Weapon", "damage": "1d6 bludgeoning", "rarity": "Rare", "effect": "+1 to spell attack rolls"},
                    "body": {"id": "item_31", "name": "Robes of Protection", "type": "Armor", "ac": 11, "rarity": "Uncommon", "effect": "+1 AC"},
                    "ring1": {"id": "item_32", "name": "Ring of Mind Shielding", "type": "Ring", "effect": "Immune to thought detection", "rarity": "Rare"},
                    "head": None, "neck": None, "offHand": None, "cloak": None, "feet": None, "ring2": None
                },
                "inventory": [
                    {"id": "item_33", "name": "Spellbook", "type": "Tool", "quantity": 1, "rarity": "Common"},
                    {"id": "item_34", "name": "Scroll of Detect Magic", "type": "Consumable", "quantity": 3, "rarity": "Common"},
                    {"id": "item_35", "name": "Component Pouch", "type": "Tool", "quantity": 1, "rarity": "Common"}
                ]
            }
        ],
        "initialQuests": {
            "active": [
                {
                    "id": "quest_1",
                    "title": "The Haunted Halls",
                    "description": "Explore the main hall of Ravencrest Manor and discover what happened to its inhabitants.",
                    "type": "main",
                    "status": "active",
                    "progress": 0,
                    "subObjectives": [
                        {"id": "obj_1", "title": "Enter the manor through the main entrance", "completed": False},
                        {"id": "obj_2", "title": "Find clues about the Ravencrest family", "completed": False},
                        {"id": "obj_3", "title": "Survive until dawn", "completed": False}
                    ]
                },
                {
                    "id": "quest_2",
                    "title": "Whispers in the Dark",
                    "description": "Strange voices echo through the halls. Find their source.",
                    "type": "side",
                    "status": "active",
                    "progress": 0,
                    "subObjectives": [
                        {"id": "obj_4", "title": "Follow the whispers to their origin", "completed": False}
                    ]
                }
            ],
            "completed": [],
            "failed": []
        },
        "initialAnchors": {
            "npcs": [
                {"id": "npc_1", "name": "The Weeping Woman", "description": "A ghostly figure seen wandering the east wing, crying for her lost children.", "firstMentioned": 0, "disposition": -20},
                {"id": "npc_2", "name": "Grimshaw the Caretaker", "description": "An ancient groundskeeper who claims to remember the manor in better days.", "firstMentioned": 0, "disposition": 30}
            ],
            "locations": [
                {"id": "loc_1", "name": "The Grand Foyer", "description": "A once-magnificent entrance hall, now draped in cobwebs and shadows.", "atmosphere": "Eerie", "discovered": True},
                {"id": "loc_2", "name": "The East Wing", "description": "Sealed for decades. Strange sounds emanate from within.", "atmosphere": "Dangerous", "discovered": False},
                {"id": "loc_3", "name": "The Family Crypt", "description": "Beneath the chapel, the Ravencrest dead rest... uneasily.", "atmosphere": "Sacred", "discovered": False}
            ],
            "plotThreads": [
                {"id": "plot_1", "name": "The Ravencrest Pact", "description": "What dark bargain did Lord Ravencrest make 300 years ago?", "firstMentioned": 0},
                {"id": "plot_2", "name": "The Missing Heirs", "description": "Three Ravencrest children vanished on the same night. What happened to them?", "firstMentioned": 0}
            ],
            "items": [
                {"id": "anchor_item_1", "name": "The Ravencrest Signet Ring", "description": "A heavy gold ring bearing the family crest. It feels unnaturally cold.", "significance": "Plot-Critical"}
            ],
            "factions": [
                {"id": "faction_1", "name": "The Veiled Court", "description": "A secret society that once served the Ravencrest family.", "reputation": 0}
            ],
            "worldStates": [
                {"id": "state_1", "name": "Manor Awakening", "description": "The manor seems to respond to your presence. Doors creak open. Candles light themselves.", "timestamp": 0}
            ]
        }
    },
    {
        "id": "shadows-of-aldoria",
        "title": "Shadows of Aldoria",
        "tagline": "A kingdom on the brink of war needs unlikely heroes to prevent an ancient evil's return.",
        "type": "Epic",
        "genres": ["Fantasy", "Political Intrigue"],
        "difficulty": "Advanced",
        "estimatedLength": "Long",
        "backgroundImage": "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80",
        "epicGoal": "Prevent the awakening of the Void Dragon and unite the fractured kingdoms.",
        "worldTruths": [
            {"id": "truth_a1", "statement": "The Kingdom of Aldoria has been at war with the Shadowlands for 100 years.", "category": "Historical Fact", "visibility": "Known"},
            {"id": "truth_a2", "statement": "The Void Dragon sleeps beneath the capital, bound by five ancient seals.", "category": "Cosmic Rule", "visibility": "Hidden"}
        ],
        "characters": [
            {
                "id": "char_a1",
                "name": "Ser Roland",
                "class": "Paladin",
                "level": 5,
                "description": "A disgraced knight seeking to restore his family's honor.",
                "portraitUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
                "stats": {"strength": 16, "dexterity": 10, "constitution": 14, "intelligence": 10, "wisdom": 14, "charisma": 16},
                "hp": {"current": 42, "max": 42},
                "equipment": {
                    "mainHand": {"id": "item_a1", "name": "Oathkeeper", "type": "Weapon", "damage": "1d10+3 slashing", "rarity": "Rare"},
                    "body": {"id": "item_a2", "name": "Plate Armor", "type": "Armor", "ac": 18, "rarity": "Uncommon"},
                    "head": None, "neck": None, "offHand": None, "cloak": None, "feet": None, "ring1": None, "ring2": None
                },
                "inventory": []
            },
            {
                "id": "char_a2",
                "name": "Zara the Shadow",
                "class": "Ranger",
                "level": 5,
                "description": "A former assassin now hunting those who created her.",
                "portraitUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
                "stats": {"strength": 12, "dexterity": 18, "constitution": 12, "intelligence": 12, "wisdom": 16, "charisma": 10},
                "hp": {"current": 38, "max": 38},
                "equipment": {
                    "mainHand": {"id": "item_a10", "name": "Whisper Bow", "type": "Weapon", "damage": "1d8+4 piercing", "rarity": "Rare"},
                    "body": {"id": "item_a11", "name": "Studded Leather", "type": "Armor", "ac": 12, "rarity": "Common"},
                    "head": None, "neck": None, "offHand": None, "cloak": None, "feet": None, "ring1": None, "ring2": None
                },
                "inventory": []
            },
            {
                "id": "char_a3",
                "name": "Magnus Ironforge",
                "class": "Barbarian",
                "level": 5,
                "description": "The last of his mountain clan, seeking vengeance against the Shadow Army.",
                "portraitUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80",
                "stats": {"strength": 18, "dexterity": 14, "constitution": 16, "intelligence": 8, "wisdom": 10, "charisma": 12},
                "hp": {"current": 55, "max": 55},
                "equipment": {
                    "mainHand": {"id": "item_a20", "name": "Ancestral Greataxe", "type": "Weapon", "damage": "1d12+4 slashing", "rarity": "Rare"},
                    "head": None, "neck": None, "body": None, "offHand": None, "cloak": None, "feet": None, "ring1": None, "ring2": None
                },
                "inventory": []
            },
            {
                "id": "char_a4",
                "name": "Celeste Moonweaver",
                "class": "Sorcerer",
                "level": 5,
                "description": "A noble with wild magic running through her veins.",
                "portraitUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80",
                "stats": {"strength": 8, "dexterity": 14, "constitution": 14, "intelligence": 12, "wisdom": 10, "charisma": 18},
                "hp": {"current": 32, "max": 32},
                "equipment": {
                    "mainHand": {"id": "item_a30", "name": "Moonstone Wand", "type": "Weapon", "damage": "1d4 force", "rarity": "Rare"},
                    "body": {"id": "item_a31", "name": "Noble Robes", "type": "Armor", "ac": 10, "rarity": "Uncommon"},
                    "head": None, "neck": None, "offHand": None, "cloak": None, "feet": None, "ring1": None, "ring2": None
                },
                "inventory": []
            }
        ],
        "initialQuests": {
            "active": [
                {
                    "id": "quest_a1",
                    "title": "The Broken Seal",
                    "description": "The first seal protecting the realm has been broken. Investigate the Temple of Dawn.",
                    "type": "main",
                    "status": "active",
                    "progress": 0,
                    "subObjectives": [
                        {"id": "obj_a1", "title": "Travel to the Temple of Dawn", "completed": False},
                        {"id": "obj_a2", "title": "Speak with the High Priestess", "completed": False},
                        {"id": "obj_a3", "title": "Discover who broke the seal", "completed": False}
                    ]
                }
            ],
            "completed": [],
            "failed": []
        },
        "initialAnchors": {
            "npcs": [
                {"id": "npc_a1", "name": "Queen Elara the Wise", "description": "The aging monarch of Aldoria, desperate to protect her people.", "firstMentioned": 0, "disposition": 50},
                {"id": "npc_a2", "name": "Lord Vex", "description": "The king's advisor, whose ambitions may threaten the realm.", "firstMentioned": 0, "disposition": -10}
            ],
            "locations": [
                {"id": "loc_a1", "name": "The Capital City of Aldoria", "description": "A grand city of white stone towers, now shadowed by war.", "atmosphere": "Tense", "discovered": True},
                {"id": "loc_a2", "name": "The Shadowlands Border", "description": "Where darkness meets light, soldiers stand eternal vigil.", "atmosphere": "Dangerous", "discovered": False}
            ],
            "plotThreads": [
                {"id": "plot_a1", "name": "The Five Seals", "description": "Ancient bindings keeping the Void Dragon imprisoned. Who is breaking them?", "firstMentioned": 0}
            ],
            "items": [],
            "factions": [
                {"id": "faction_a1", "name": "The Silver Dawn", "description": "An order of knights sworn to protect the seals.", "reputation": 40},
                {"id": "faction_a2", "name": "The Shadow Cult", "description": "Fanatics who worship the Void Dragon and seek its return.", "reputation": -100}
            ],
            "worldStates": []
        }
    },
    {
        "id": "tavern-mystery",
        "title": "Murder at the Rusty Flagon",
        "tagline": "When the innkeeper falls dead, everyone's a suspect in this classic whodunit.",
        "type": "Final Season",
        "genres": ["Mystery", "Comedy"],
        "difficulty": "Beginner",
        "estimatedLength": "Short",
        "backgroundImage": "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1920&q=80",
        "worldTruths": [
            {"id": "truth_m1", "statement": "The innkeeper was poisoned, not stabbed as it appears.", "category": "Historical Fact", "visibility": "Secret"}
        ],
        "characters": [
            {
                "id": "char_m1",
                "name": "Detective Finch",
                "class": "Rogue",
                "level": 2,
                "description": "A retired city guard with a nose for trouble.",
                "portraitUrl": "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=200&q=80",
                "stats": {"strength": 10, "dexterity": 14, "constitution": 12, "intelligence": 16, "wisdom": 14, "charisma": 12},
                "hp": {"current": 15, "max": 15},
                "equipment": {
                    "mainHand": {"id": "item_m1", "name": "Magnifying Glass", "type": "Tool", "rarity": "Common"},
                    "head": None, "neck": None, "body": None, "offHand": None, "cloak": None, "feet": None, "ring1": None, "ring2": None
                },
                "inventory": []
            },
            {
                "id": "char_m2",
                "name": "Pip Lightfoot",
                "class": "Bard",
                "level": 2,
                "description": "A traveling performer who sees and hears everything.",
                "portraitUrl": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&q=80",
                "stats": {"strength": 8, "dexterity": 14, "constitution": 10, "intelligence": 12, "wisdom": 10, "charisma": 18},
                "hp": {"current": 12, "max": 12},
                "equipment": {
                    "mainHand": {"id": "item_m10", "name": "Lute", "type": "Tool", "rarity": "Common"},
                    "head": None, "neck": None, "body": None, "offHand": None, "cloak": None, "feet": None, "ring1": None, "ring2": None
                },
                "inventory": []
            }
        ],
        "initialQuests": {
            "active": [
                {
                    "id": "quest_m1",
                    "title": "Who Killed Barkeep Bram?",
                    "description": "The innkeeper lies dead. Question the suspects and find the murderer before they escape.",
                    "type": "main",
                    "status": "active",
                    "progress": 0,
                    "subObjectives": [
                        {"id": "obj_m1", "title": "Examine the body", "completed": False},
                        {"id": "obj_m2", "title": "Question all witnesses", "completed": False},
                        {"id": "obj_m3", "title": "Find the murder weapon", "completed": False},
                        {"id": "obj_m4", "title": "Identify and confront the killer", "completed": False}
                    ]
                }
            ],
            "completed": [],
            "failed": []
        },
        "initialAnchors": {
            "npcs": [
                {"id": "npc_m1", "name": "Martha the Cook", "description": "Bram's longtime cook, nervous and evasive.", "firstMentioned": 0, "disposition": 20},
                {"id": "npc_m2", "name": "Lord Percival", "description": "A pompous noble who argues loudly about his unpaid tab.", "firstMentioned": 0, "disposition": -30},
                {"id": "npc_m3", "name": "Sylvia the Barmaid", "description": "Pretty and charming, she seems to know everyone's secrets.", "firstMentioned": 0, "disposition": 40}
            ],
            "locations": [
                {"id": "loc_m1", "name": "The Common Room", "description": "The main tavern area where the murder occurred.", "atmosphere": "Tense", "discovered": True},
                {"id": "loc_m2", "name": "The Kitchen", "description": "Where the meals—and possibly the poison—were prepared.", "atmosphere": "Suspicious", "discovered": False},
                {"id": "loc_m3", "name": "The Cellar", "description": "Dark and full of barrels. What else lurks below?", "atmosphere": "Mysterious", "discovered": False}
            ],
            "plotThreads": [
                {"id": "plot_m1", "name": "The Gambling Debt", "description": "Bram owed money to dangerous people.", "firstMentioned": 0},
                {"id": "plot_m2", "name": "The Secret Affair", "description": "Someone in this tavern had a very personal motive.", "firstMentioned": 0}
            ],
            "items": [
                {"id": "anchor_item_m1", "name": "Empty Vial", "description": "A small glass vial found near the body. It smells faintly of almonds.", "significance": "Plot-Critical"}
            ],
            "factions": [],
            "worldStates": []
        }
    }
]
