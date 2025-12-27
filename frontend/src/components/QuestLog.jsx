import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Checkbox } from './ui/checkbox';
import { 
  BookOpen, 
  Target, 
  CheckCircle2, 
  XCircle, 
  Users, 
  MapPin, 
  GitBranch, 
  Package, 
  Flag, 
  Globe,
  ChevronRight,
  Star
} from 'lucide-react';

const anchorCategories = [
  { id: 'npcs', label: 'NPCs', icon: Users },
  { id: 'locations', label: 'Locations', icon: MapPin },
  { id: 'plotThreads', label: 'Plots', icon: GitBranch },
  { id: 'items', label: 'Items', icon: Package },
  { id: 'factions', label: 'Factions', icon: Flag },
  { id: 'worldStates', label: 'World', icon: Globe }
];

const QuestLog = ({ open, onClose }) => {
  const { quests, anchors, completeObjective } = useGame();
  const [selectedAnchorCategory, setSelectedAnchorCategory] = useState('npcs');
  const [expandedQuest, setExpandedQuest] = useState(null);

  const getQuestStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Target className="w-4 h-4 text-amber-400" />;
    }
  };

  const getQuestTypeBadge = (type) => {
    switch (type) {
      case 'main':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px] sm:text-xs">Main</Badge>;
      case 'side':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px] sm:text-xs">Side</Badge>;
      case 'hidden':
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-[10px] sm:text-xs">Hidden</Badge>;
      default:
        return null;
    }
  };

  const renderQuestList = (questList, status) => {
    if (questList.length === 0) {
      return (
        <div className="text-center py-6 sm:py-8 text-gray-500">
          <Target className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" />
          <p className="text-xs sm:text-sm">
            {status === 'active' 
              ? 'No active quests. Explore to discover new objectives!' 
              : `No ${status} quests yet.`}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-2 sm:space-y-3">
        {questList.map((quest) => (
          <div 
            key={quest.id}
            className="bg-[#252542] rounded-lg border border-white/10 overflow-hidden"
          >
            {/* Quest Header */}
            <button
              className="w-full p-3 sm:p-4 flex items-start gap-2 sm:gap-3 text-left hover:bg-white/5 transition-colors"
              onClick={() => setExpandedQuest(expandedQuest === quest.id ? null : quest.id)}
            >
              {getQuestStatusIcon(quest.status)}
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h4 className="font-medium text-white text-sm sm:text-base truncate">{quest.title}</h4>
                  {getQuestTypeBadge(quest.type)}
                </div>
                <p className="text-xs sm:text-sm text-gray-400 line-clamp-2">{quest.description}</p>
                {quest.progress > 0 && quest.status === 'active' && (
                  <div className="flex items-center gap-2 mt-2">
                    <Progress value={quest.progress} className="flex-grow h-1 sm:h-1.5 bg-white/10" />
                    <span className="text-[10px] sm:text-xs text-gray-400">{quest.progress}%</span>
                  </div>
                )}
              </div>
              <ChevronRight className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-500 transition-transform flex-shrink-0 ${expandedQuest === quest.id ? 'rotate-90' : ''}`} />
            </button>

            {/* Quest Objectives */}
            {expandedQuest === quest.id && quest.subObjectives && (
              <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-2 border-t border-white/10 bg-[#1A1A2E]/50">
                <h5 className="text-[10px] sm:text-xs uppercase text-gray-500 mb-2 font-medium">Objectives</h5>
                <div className="space-y-2">
                  {quest.subObjectives.map((objective) => (
                    <div 
                      key={objective.id}
                      className="flex items-center gap-2 sm:gap-3"
                    >
                      <Checkbox 
                        id={objective.id}
                        checked={objective.completed}
                        disabled={quest.status !== 'active'}
                        onCheckedChange={() => completeObjective(quest.id, objective.id)}
                        className="border-white/30 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 w-4 h-4"
                      />
                      <label 
                        htmlFor={objective.id}
                        className={`text-xs sm:text-sm ${objective.completed ? 'text-gray-500 line-through' : 'text-gray-300'}`}
                      >
                        {objective.title}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderAnchors = () => {
    const currentAnchors = anchors[selectedAnchorCategory] || [];
    const CategoryIcon = anchorCategories.find(c => c.id === selectedAnchorCategory)?.icon || Globe;

    if (currentAnchors.length === 0) {
      return (
        <div className="text-center py-6 sm:py-8 text-gray-500">
          <CategoryIcon className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" />
          <p className="text-xs sm:text-sm">No {selectedAnchorCategory} discovered yet.</p>
          <p className="text-[10px] sm:text-xs mt-1">Important elements will appear here as you explore.</p>
        </div>
      );
    }

    return (
      <div className="space-y-2 sm:space-y-3">
        {currentAnchors.map((anchor) => (
          <div 
            key={anchor.id}
            className="bg-[#252542] rounded-lg border border-white/10 p-3 sm:p-4"
          >
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#6B46C1]/20 flex items-center justify-center flex-shrink-0">
                <CategoryIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#6B46C1]" />
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="font-medium text-white text-sm sm:text-base truncate">{anchor.name}</h4>
                  {anchor.firstMentioned !== undefined && (
                    <span className="text-[10px] sm:text-xs text-gray-500 flex-shrink-0">Turn {anchor.firstMentioned || 1}</span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-400">{anchor.description}</p>
                
                {/* Additional info based on category */}
                {anchor.disposition !== undefined && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] sm:text-xs text-gray-500">Disposition:</span>
                    <div className="flex-grow h-1 sm:h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${anchor.disposition >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.abs(anchor.disposition)}%`, marginLeft: anchor.disposition < 0 ? 'auto' : 0 }}
                      />
                    </div>
                    <span className={`text-[10px] sm:text-xs ${anchor.disposition >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {anchor.disposition >= 0 ? 'Friendly' : 'Hostile'}
                    </span>
                  </div>
                )}
                
                {anchor.atmosphere && (
                  <Badge variant="outline" className="mt-2 text-[10px] sm:text-xs bg-white/5 border-white/20">
                    {anchor.atmosphere}
                  </Badge>
                )}
                
                {anchor.reputation !== undefined && (
                  <div className="flex items-center gap-2 mt-2">
                    <Star className="w-3 h-3 text-amber-400" />
                    <span className="text-[10px] sm:text-xs text-gray-400">Reputation: {anchor.reputation}</span>
                  </div>
                )}
                
                {anchor.significance && (
                  <Badge variant="outline" className="mt-2 text-[10px] sm:text-xs bg-amber-500/20 text-amber-400 border-amber-500/30">
                    {anchor.significance}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl h-[85vh] sm:h-[80vh] bg-[#1A1A2E] border-white/10 text-white p-0 gap-0">
        <DialogHeader className="p-4 sm:p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 font-serif text-lg sm:text-xl">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-[#6B46C1]" />
            Quest Log & Story
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="quests" className="flex-grow flex flex-col">
          <TabsList className="mx-4 sm:mx-6 mt-3 sm:mt-4 bg-[#252542] border border-white/10">
            <TabsTrigger 
              value="quests" 
              className="flex-1 text-xs sm:text-sm data-[state=active]:bg-[#6B46C1] data-[state=active]:text-white"
            >
              <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Quests
            </TabsTrigger>
            <TabsTrigger 
              value="anchors"
              className="flex-1 text-xs sm:text-sm data-[state=active]:bg-[#6B46C1] data-[state=active]:text-white"
            >
              <Globe className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Story
            </TabsTrigger>
          </TabsList>

          {/* Quests Tab */}
          <TabsContent value="quests" className="flex-grow p-4 sm:p-6 pt-3 sm:pt-4 m-0">
            <ScrollArea className="h-[calc(85vh-160px)] sm:h-[calc(80vh-180px)]">
              <div className="space-y-4 sm:space-y-6">
                {/* Active Quests */}
                <div>
                  <h3 className="text-xs sm:text-sm uppercase text-amber-400 font-medium mb-2 sm:mb-3 flex items-center gap-2">
                    <Target className="w-3 h-3 sm:w-4 sm:h-4" />
                    Active ({quests.active.length})
                  </h3>
                  {renderQuestList(quests.active, 'active')}
                </div>

                {/* Completed Quests */}
                {quests.completed.length > 0 && (
                  <div>
                    <h3 className="text-xs sm:text-sm uppercase text-emerald-400 font-medium mb-2 sm:mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      Completed ({quests.completed.length})
                    </h3>
                    {renderQuestList(quests.completed, 'completed')}
                  </div>
                )}

                {/* Failed Quests */}
                {quests.failed.length > 0 && (
                  <div>
                    <h3 className="text-xs sm:text-sm uppercase text-red-400 font-medium mb-2 sm:mb-3 flex items-center gap-2">
                      <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                      Failed ({quests.failed.length})
                    </h3>
                    {renderQuestList(quests.failed, 'failed')}
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Anchors Tab (Story Bible) */}
          <TabsContent value="anchors" className="flex-grow p-4 sm:p-6 pt-3 sm:pt-4 m-0">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
              {anchorCategories.map((category) => {
                const Icon = category.icon;
                const count = anchors[category.id]?.length || 0;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedAnchorCategory(category.id)}
                    className={`
                      flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-sm transition-colors
                      ${selectedAnchorCategory === category.id 
                        ? 'bg-[#6B46C1] text-white' 
                        : 'bg-[#252542] text-gray-400 hover:bg-[#252542]/80 border border-white/10'}
                    `}
                  >
                    <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline sm:inline">{category.label}</span>
                    {count > 0 && (
                      <span className="ml-0.5 sm:ml-1 px-1 sm:px-1.5 py-0.5 rounded-full bg-white/10 text-[9px] sm:text-xs">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <ScrollArea className="h-[calc(85vh-220px)] sm:h-[calc(80vh-240px)]">
              {renderAnchors()}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default QuestLog;
