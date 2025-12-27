import os
import json
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

# Lazy initialization of OpenAI client
_client = None

def get_client():
    """Get OpenAI client configured for Emergent LLM key."""
    global _client
    if _client is None:
        from openai import OpenAI
        emergent_key = os.environ.get('EMERGENT_LLM_KEY')
        if not emergent_key:
            raise ValueError("EMERGENT_LLM_KEY not found in environment")
        _client = OpenAI(
            api_key=emergent_key,
            base_url="https://api.emergent.sh/v1"
        )
    return _client


class AIService:
    def __init__(self):
        # Using GPT-4o through Emergent's universal key
        self.model_id = 'gpt-4o'
    
    def build_system_prompt(self, session: Dict[str, Any]) -> str:
        """Build the system prompt with campaign context."""
        character = session.get('character', {})
        world_truths = session.get('worldTruths', [])
        anchors = session.get('anchors', {})
        quests = session.get('quests', {})
        
        # Build world truths context
        truths_text = "\n".join([f"- {t.get('statement', '')}" for t in world_truths if t.get('visibility') != 'Known'])
        
        # Build NPC context
        npcs_text = "\n".join([f"- {npc.get('name')}: {npc.get('description')} (Disposition: {npc.get('disposition', 0)})" 
                               for npc in anchors.get('npcs', [])])
        
        # Build location context
        locations_text = "\n".join([f"- {loc.get('name')}: {loc.get('description')} ({loc.get('atmosphere', 'Neutral')})" 
                                    for loc in anchors.get('locations', []) if loc.get('discovered', False)])
        
        # Build active quests context
        active_quests = quests.get('active', [])
        quests_text = "\n".join([f"- {q.get('title')}: {q.get('description')} ({q.get('progress', 0)}% complete)" 
                                  for q in active_quests])
        
        system_prompt = f"""You are an expert Dungeon Master running a solo D&D 5e adventure. Your role is to create immersive, atmospheric narrative responses that bring the world to life.

## CAMPAIGN CONTEXT
Campaign: {session.get('campaignTitle', 'Unknown')}
Type: {session.get('campaignType', 'Fated')}
Current Turn: {session.get('turnCount', 0)}

## PLAYER CHARACTER
Name: {character.get('name', 'Unknown')}
Class: {character.get('class', 'Unknown')}
Level: {character.get('level', 1)}
HP: {character.get('hp', {}).get('current', 0)}/{character.get('hp', {}).get('max', 0)}

## WORLD TRUTHS (Hidden from player - guide your narrative)
{truths_text if truths_text else 'No special world truths.'}

## KNOWN NPCS
{npcs_text if npcs_text else 'No NPCs encountered yet.'}

## DISCOVERED LOCATIONS
{locations_text if locations_text else 'No locations discovered yet.'}

## ACTIVE QUESTS
{quests_text if quests_text else 'No active quests.'}

## YOUR GUIDELINES
1. Write in second person ("You see...", "You hear...")
2. Be descriptive and atmospheric - use all senses
3. Keep responses to 2-4 paragraphs
4. End with a clear situation that invites player action
5. Maintain narrative consistency with previous events
6. Respect the campaign type:
   - Epic: Drive toward the main goal
   - Fated: Build tension organically toward a climax
   - Final Season: Allow open exploration
7. When combat occurs, describe it cinematically but acknowledge D&D mechanics
8. NPCs should have distinct voices and personalities
9. Foreshadow future events subtly based on world truths
10. Track quest progress through your narrative

## RESPONSE FORMAT
Provide your narrative response directly. Be evocative and immersive. Do not break character or mention game mechanics explicitly unless the player asks about rules."""
        
        return system_prompt

    async def generate_narrative(self, session: Dict[str, Any], player_action: str) -> str:
        """Generate AI narrative response to player action."""
        try:
            client = get_client()
            system_prompt = self.build_system_prompt(session)
            
            # Build conversation for context
            messages = [{"role": "system", "content": system_prompt}]
            
            # Add recent history
            for entry in session.get('narrativeHistory', [])[-6:]:
                role = "user" if entry.get('type') == 'player' else "assistant"
                messages.append({"role": role, "content": entry.get('content', '')})
            
            # Add current action
            messages.append({"role": "user", "content": player_action})
            
            response = client.chat.completions.create(
                model=self.model_id,
                messages=messages,
                temperature=0.8,
                max_tokens=500
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"Error generating narrative: {e}")
            # Fallback response
            return f"""You attempt to {player_action.lower()}. The shadows seem to shift around you as you act, the manor responding to your presence in ways you can't quite explain.

A cold draft whispers past, carrying with it the scent of dust and forgotten memories. The floorboards creak beneath your feet as you consider your next move.

What do you do?"""

    async def analyze_action_impact(self, session: Dict[str, Any], action: str, narrative: str) -> Dict[str, Any]:
        """Analyze the action for quest updates, new anchors, and tension changes."""
        try:
            client = get_client()
            analysis_prompt = f"""Analyze this game action and narrative for a D&D campaign intelligence system.

PLAYER ACTION: {action}
NARRATIVE RESPONSE: {narrative}

CURRENT QUESTS: {json.dumps([q.get('title') for q in session.get('quests', {}).get('active', [])])}
KNOWN NPCS: {json.dumps([n.get('name') for n in session.get('anchors', {}).get('npcs', [])])}
KNOWN LOCATIONS: {json.dumps([l.get('name') for l in session.get('anchors', {}).get('locations', [])])}

Provide a JSON response with:
{{
  "tension_change": <number from -10 to +15>,
  "new_npcs": [{{"name": "...", "description": "...", "disposition": <-100 to 100>}}],
  "new_locations": [{{"name": "...", "description": "...", "atmosphere": "..."}}],
  "new_plot_threads": [{{"name": "...", "description": "..."}}],
  "quest_progress": {{"quest_title": "objective_completed_or_null"}}
}}

Only include new elements if they were clearly introduced in the narrative. Be conservative.
Respond with ONLY the JSON, no other text."""

            response = client.chat.completions.create(
                model=self.model_id,
                messages=[{"role": "user", "content": analysis_prompt}],
                temperature=0.2,
                max_tokens=300
            )
            
            # Parse JSON response
            response_text = response.choices[0].message.content.strip()
            # Clean up potential markdown formatting
            if response_text.startswith('```'):
                response_text = response_text.split('```')[1]
                if response_text.startswith('json'):
                    response_text = response_text[4:]
            response_text = response_text.strip()
            
            return json.loads(response_text)
            
        except Exception as e:
            logger.error(f"Error analyzing action: {e}")
            return {
                "tension_change": 2,
                "new_npcs": [],
                "new_locations": [],
                "new_plot_threads": [],
                "quest_progress": {}
            }

    async def generate_opening_narrative(self, campaign: Dict[str, Any], character: Dict[str, Any]) -> str:
        """Generate the opening narrative for a new game session."""
        try:
            client = get_client()
            
            messages = [
                {
                    "role": "system",
                    "content": "You are an expert Dungeon Master creating immersive opening narratives for D&D campaigns. Write in second person, be atmospheric and evocative."
                },
                {
                    "role": "user",
                    "content": f"""Create an opening scene for this campaign:

CAMPAIGN: {campaign.get('title')}
TAGLINE: {campaign.get('tagline')}
TYPE: {campaign.get('type')}
GENRES: {', '.join(campaign.get('genres', []))}

PLAYER CHARACTER:
Name: {character.get('name')}
Class: {character.get('class')}
Description: {character.get('description')}

Write an evocative opening scene (3-4 paragraphs) that:
1. Sets the mood and atmosphere
2. Introduces the character to the setting
3. Hints at the adventure to come
4. Ends with a clear situation inviting player action"""
                }
            ]

            response = client.chat.completions.create(
                model=self.model_id,
                messages=messages,
                temperature=0.9,
                max_tokens=600
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"Error generating opening: {e}")
            # Fallback opening
            return f"""The journey has been long, but at last you've arrived. You are {character.get('name', 'a weary traveler')}, {character.get('description', 'seeking adventure and purpose')}.

The air carries a sense of anticipation as you survey your surroundings. Something important awaits here - you can feel it in your bones. The path ahead is uncertain, but that has never stopped you before.

Your instincts tell you that the choices you make from this moment forward will shape not just your fate, but perhaps the fate of many others.

What do you do?"""


# Singleton instance
ai_service = AIService()
