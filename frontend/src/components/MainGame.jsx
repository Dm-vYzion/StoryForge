import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import Journal from './Journal';
import EquipmentPanel from './EquipmentPanel';
import { 
  Sword, 
  MessageCircle, 
  Search, 
  Eye, 
  Send,
  BookOpen,
  LogOut,
  Loader2
} from 'lucide-react';

const actionButtons = [
  { id: 'attack', label: 'Attack', icon: Sword, variant: 'destructive' },
  { id: 'persuade', label: 'Persuade', icon: MessageCircle, variant: 'secondary' },
  { id: 'investigate', label: 'Investigate', icon: Search, variant: 'secondary' },
  { id: 'stealth', label: 'Stealth', icon: Eye, variant: 'secondary' }
];

const MainGame = () => {
  const navigate = useNavigate();
  const { 
    activeCampaign, 
    selectedCharacter, 
    narrativeHistory, 
    isAIThinking, 
    journal,
    submitAction,
    endSession
  } = useGame();
  
  const [customAction, setCustomAction] = useState('');
  const [showJournal, setShowJournal] = useState(false);
  const [showEquipment, setShowEquipment] = useState(false);
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  const scrollRef = useRef(null);

  // Redirect if no active campaign
  useEffect(() => {
    if (!activeCampaign || !selectedCharacter) {
      navigate('/');
    }
  }, [activeCampaign, selectedCharacter, navigate]);

  // Auto-scroll to bottom when new narrative arrives
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [narrativeHistory]);

  // Preload background image
  useEffect(() => {
    if (activeCampaign?.backgroundImage) {
      const img = new Image();
      img.onload = () => setBackgroundLoaded(true);
      img.src = activeCampaign.backgroundImage;
    }
  }, [activeCampaign?.backgroundImage]);

  if (!activeCampaign || !selectedCharacter) {
    return null;
  }

  const handleQuickAction = (actionId) => {
    if (isAIThinking) return;
    const action = actionButtons.find(a => a.id === actionId);
    if (action) {
      submitAction(`I want to ${action.label.toLowerCase()}`);
    }
  };

  const handleCustomAction = () => {
    if (isAIThinking || !customAction.trim()) return;
    submitAction(customAction.trim());
    setCustomAction('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCustomAction();
    }
  };

  const handleEndSession = () => {
    endSession();
    navigate('/');
  };

  const journalEntryCount = journal.length;

  return (
    <TooltipProvider>
      <div className="fixed inset-0 bg-[#1A1A2E] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div 
            className={`absolute inset-0 bg-cover bg-center transition-all duration-800 ${backgroundLoaded ? 'opacity-40 sm:opacity-60' : 'opacity-0'}`}
            style={{ backgroundImage: `url(${activeCampaign.backgroundImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A2E] via-[#1A1A2E]/70 to-transparent" />
        </div>

        {/* Journal Button - Top Left */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-30">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowJournal(true)}
                className="relative w-11 h-11 sm:w-14 sm:h-14 bg-[#252542]/80 backdrop-blur-sm border border-white/10 hover:bg-[#252542] hover:border-[#6B46C1]/50"
              >
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-[#6B46C1]" />
                {journalEntryCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-amber-500 text-white text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center">
                    {journalEntryCount}
                  </span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="hidden sm:block">
              <p>Quest Log & Story</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Character Portrait - Top Right */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 flex items-center gap-2 sm:gap-3">
          {/* Character Portrait */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setShowEquipment(true)}
                className="relative group"
              >
                <Avatar className="w-12 h-12 sm:w-16 sm:h-16 border-2 sm:border-3 border-[#6B46C1] ring-2 ring-[#6B46C1]/30 group-hover:ring-[#6B46C1]/60 transition-all">
                  <AvatarImage src={selectedCharacter.portraitUrl} alt={selectedCharacter.name} />
                  <AvatarFallback className="bg-[#6B46C1] text-white text-lg sm:text-xl font-serif">
                    {selectedCharacter.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 sm:px-2 py-0.5 bg-[#252542] rounded-full border border-white/20">
                  <span className="text-[10px] sm:text-xs font-medium text-white">
                    {selectedCharacter.hp.current}/{selectedCharacter.hp.max}
                  </span>
                </div>
              </button>
            </TooltipTrigger>
            <TooltipContent side="left" className="hidden sm:block">
              <p>Character & Equipment</p>
            </TooltipContent>
          </Tooltip>

          {/* Exit Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleEndSession}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-[#252542]/80 backdrop-blur-sm border border-white/10 hover:bg-red-500/20 hover:border-red-500/50"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="hidden sm:block">
              <p>Save & Exit</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Narrative Panel - Center Bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-20 flex justify-center p-2 sm:p-4 md:p-6">
          <div className="w-full max-w-3xl">
            {/* Narrative Container */}
            <div className="bg-[#1A1A2E]/95 sm:bg-[#1A1A2E]/92 backdrop-blur-xl rounded-t-xl sm:rounded-t-2xl border border-white/10 border-b-0">
              {/* Narrative Text Area */}
              <div 
                ref={scrollRef}
                className="h-[45vh] sm:h-[40vh] md:h-[50vh] p-4 sm:p-6 overflow-y-auto"
              >
                <div className="space-y-4 sm:space-y-6">
                  {narrativeHistory.map((entry, index) => (
                    <div key={index} className={entry.type === 'player' ? 'pl-3 sm:pl-4 border-l-2 border-[#6B46C1]' : ''}>
                      {entry.type === 'player' && (
                        <Badge variant="outline" className="mb-1.5 sm:mb-2 bg-[#6B46C1]/20 text-[#6B46C1] border-[#6B46C1]/30 text-[10px] sm:text-xs">
                          Your Action
                        </Badge>
                      )}
                      <div className="text-sm sm:text-base text-gray-200 leading-relaxed whitespace-pre-wrap font-serif">
                        {entry.content}
                      </div>
                    </div>
                  ))}
                  
                  {/* AI Thinking Indicator */}
                  {isAIThinking && (
                    <div className="flex items-center gap-2 sm:gap-3 text-gray-400">
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      <span className="italic text-sm sm:text-base">The Dungeon Master is weaving the story...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Panel */}
              <div className="p-3 sm:p-4 border-t border-white/10">
                {/* Quick Action Buttons */}
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                  {actionButtons.map((action) => {
                    const Icon = action.icon;
                    return (
                      <Button
                        key={action.id}
                        variant={action.variant}
                        size="sm"
                        disabled={isAIThinking}
                        onClick={() => handleQuickAction(action.id)}
                        className={`flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9 ${action.variant === 'destructive' ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30' : 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10'}`}
                      >
                        <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden xs:inline sm:inline">{action.label}</span>
                      </Button>
                    );
                  })}
                </div>

                {/* Custom Action Input */}
                <div className="flex gap-2">
                  <Textarea
                    placeholder="What do you do?"
                    value={customAction}
                    onChange={(e) => setCustomAction(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isAIThinking}
                    className="min-h-[50px] sm:min-h-[60px] max-h-[100px] sm:max-h-[120px] bg-[#252542] border-white/10 focus:border-[#6B46C1]/50 resize-none text-sm sm:text-base text-white placeholder:text-gray-500"
                  />
                  <Button
                    onClick={handleCustomAction}
                    disabled={isAIThinking || !customAction.trim()}
                    className="h-auto px-3 sm:px-4 bg-[#6B46C1] hover:bg-[#5a3aa8] text-white"
                  >
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quest Log Modal */}
        <QuestLog 
          open={showQuestLog} 
          onClose={() => setShowQuestLog(false)} 
        />

        {/* Equipment Panel */}
        <EquipmentPanel 
          open={showEquipment} 
          onClose={() => setShowEquipment(false)} 
        />
      </div>
    </TooltipProvider>
  );
};

export default MainGame;
