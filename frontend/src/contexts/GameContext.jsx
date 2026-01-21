import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as api from '../services/api';

const GameContext = createContext(null);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  // Campaign state
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true);
  
  // Session state
  const [activeSession, setActiveSession] = useState(null);
  const [activeCampaign, setActiveCampaign] = useState(null);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  
  // Game state
  const [narrativeHistory, setNarrativeHistory] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const [tensionScore, setTensionScore] = useState(0);
  
  // Campaign Intelligence state
  const [quests, setQuests] = useState({ active: [], completed: [], failed: [] });
  const [anchors, setAnchors] = useState({
    npcs: [],
    locations: [],
    plotThreads: [],
    items: [],
    factions: [],
    worldStates: []
  });
  
  // Player Journal state
  const [journal, setJournal] = useState([]);

  // Load campaigns on mount
  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        const campaigns = await api.getCampaigns();
        setAllCampaigns(campaigns);
      } catch (error) {
        console.error('Failed to load campaigns:', error);
      } finally {
        setIsLoadingCampaigns(false);
      }
    };
    loadCampaigns();
  }, []);

  // Start a new campaign
  const startCampaign = useCallback(async (campaignId, characterId) => {
    try {
      // Get full campaign data
      const campaign = await api.getCampaign(campaignId);
      
      // Start session with backend
      const session = await api.startSession(campaignId, characterId);
      
      setActiveSession(session);
      setActiveCampaign(campaign);
      setSelectedCharacter(session.character);
      setNarrativeHistory(session.narrativeHistory || []);
      setCurrentLocation(session.currentLocation || campaign.backgroundImage);
      setTurnCount(session.turnCount || 1);
      setTensionScore(session.tensionScore || 0);
      setQuests(session.quests || { active: [], completed: [], failed: [] });
      setAnchors(session.anchors || {
        npcs: [], locations: [], plotThreads: [], items: [], factions: [], worldStates: []
      });
      
      return session;
    } catch (error) {
      console.error('Failed to start campaign:', error);
      throw error;
    }
  }, []);

  // Submit player action
  const submitAction = useCallback(async (action) => {
    if (!activeSession) return;
    
    setIsAIThinking(true);
    
    try {
      // Add player action to history optimistically
      const playerTurn = {
        turn: turnCount + 1,
        type: 'player',
        content: action
      };
      setNarrativeHistory(prev => [...prev, playerTurn]);
      
      // Send action to backend
      const response = await api.submitAction(activeSession.id, action);
      
      // Add AI response to history
      const aiResponse = {
        turn: response.turnCount,
        type: 'dm',
        content: response.narrative,
        locationImage: currentLocation
      };
      setNarrativeHistory(prev => [...prev, aiResponse]);
      setTurnCount(response.turnCount);
      setTensionScore(response.tensionScore);
      
      // Update anchors if new ones were discovered
      if (response.analysis) {
        const newAnchors = { ...anchors };
        
        if (response.analysis.new_npcs?.length > 0) {
          newAnchors.npcs = [...newAnchors.npcs, ...response.analysis.new_npcs];
        }
        if (response.analysis.new_locations?.length > 0) {
          newAnchors.locations = [...newAnchors.locations, ...response.analysis.new_locations];
        }
        if (response.analysis.new_plot_threads?.length > 0) {
          newAnchors.plotThreads = [...newAnchors.plotThreads, ...response.analysis.new_plot_threads];
        }
        
        setAnchors(newAnchors);
      }
      
    } catch (error) {
      console.error('Failed to submit action:', error);
      // Add error message to narrative
      setNarrativeHistory(prev => [...prev, {
        turn: turnCount + 1,
        type: 'dm',
        content: 'The story pauses momentarily as the winds of fate shift... Please try your action again.',
      }]);
    } finally {
      setIsAIThinking(false);
    }
  }, [activeSession, turnCount, currentLocation, anchors]);

  // Complete a sub-objective
  const completeObjective = useCallback(async (questId, objectiveId) => {
    if (!activeSession) return;
    
    try {
      const updatedQuests = await api.completeObjective(activeSession.id, questId, objectiveId);
      setQuests(updatedQuests);
    } catch (error) {
      console.error('Failed to complete objective:', error);
      // Update locally anyway for responsive UI
      setQuests(prev => {
        const newQuests = { ...prev };
        const quest = newQuests.active.find(q => q.id === questId);
        
        if (quest) {
          const objective = quest.subObjectives.find(o => o.id === objectiveId);
          if (objective) {
            objective.completed = true;
            const completedCount = quest.subObjectives.filter(o => o.completed).length;
            quest.progress = Math.round((completedCount / quest.subObjectives.length) * 100);
          }
        }
        
        return newQuests;
      });
    }
  }, [activeSession]);

  // Equip item from inventory
  const equipItem = useCallback(async (slot, item, inventoryIndex) => {
    if (!activeSession) {
      // Local state only (for mock mode)
      setSelectedCharacter(prev => {
        if (!prev) return prev;
        
        const existingItem = prev.equipment[slot];
        let newInventory = prev.inventory.filter((_, idx) => idx !== inventoryIndex);
        
        if (existingItem) {
          newInventory = [...newInventory, { ...existingItem, quantity: 1 }];
        }
        
        return {
          ...prev,
          equipment: { ...prev.equipment, [slot]: { ...item } },
          inventory: newInventory
        };
      });
      return;
    }
    
    try {
      const updatedCharacter = await api.equipItem(activeSession.id, item.id, slot);
      setSelectedCharacter(updatedCharacter);
    } catch (error) {
      console.error('Failed to equip item:', error);
    }
  }, [activeSession]);

  // Unequip item to inventory
  const unequipItem = useCallback(async (slot) => {
    if (!activeSession) {
      // Local state only
      setSelectedCharacter(prev => {
        if (!prev) return prev;
        
        const item = prev.equipment[slot];
        if (!item) return prev;
        
        return {
          ...prev,
          equipment: { ...prev.equipment, [slot]: null },
          inventory: [...prev.inventory, { ...item, quantity: 1 }]
        };
      });
      return;
    }
    
    try {
      const updatedCharacter = await api.unequipItem(activeSession.id, slot);
      setSelectedCharacter(updatedCharacter);
    } catch (error) {
      console.error('Failed to unequip item:', error);
    }
  }, [activeSession]);

  // Journal functions
  const addJournalEntry = useCallback((entry) => {
    const newEntry = {
      id: `journal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...entry,
      createdAt: new Date().toISOString()
    };
    setJournal(prev => [newEntry, ...prev]);
    
    // Persist to backend if session exists
    if (activeSession) {
      api.addJournalEntry(activeSession.id, newEntry).catch(console.error);
    }
  }, [activeSession]);

  const updateJournalEntry = useCallback((id, updates) => {
    setJournal(prev => prev.map(entry => 
      entry.id === id ? { ...entry, ...updates, updatedAt: new Date().toISOString() } : entry
    ));
    
    if (activeSession) {
      api.updateJournalEntry(activeSession.id, id, updates).catch(console.error);
    }
  }, [activeSession]);

  const deleteJournalEntry = useCallback((id) => {
    setJournal(prev => prev.filter(entry => entry.id !== id));
    
    if (activeSession) {
      api.deleteJournalEntry(activeSession.id, id).catch(console.error);
    }
  }, [activeSession]);

  // End campaign session
  const endSession = useCallback(async () => {
    if (activeSession) {
      try {
        await api.endSession(activeSession.id);
      } catch (error) {
        console.error('Failed to end session:', error);
      }
    }
    
    setActiveSession(null);
    setActiveCampaign(null);
    setSelectedCharacter(null);
    setNarrativeHistory([]);
    setQuests({ active: [], completed: [], failed: [] });
    setAnchors({ npcs: [], locations: [], plotThreads: [], items: [], factions: [], worldStates: [] });
    setTurnCount(0);
    setTensionScore(0);
  }, [activeSession]);

  const value = {
    // State
    allCampaigns,
    isLoadingCampaigns,
    activeSession,
    activeCampaign,
    selectedCharacter,
    narrativeHistory,
    currentLocation,
    isAIThinking,
    turnCount,
    tensionScore,
    quests,
    anchors,
    
    // Actions
    startCampaign,
    submitAction,
    completeObjective,
    equipItem,
    unequipItem,
    endSession
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};
