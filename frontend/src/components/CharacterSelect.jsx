import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import { getCampaign } from '../services/api';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Progress } from './ui/progress';
import { 
  ArrowLeft, 
  Sword, 
  Shield, 
  Heart, 
  Sparkles,
  Zap,
  Brain,
  Eye,
  Smile,
  ChevronRight,
  Loader2
} from 'lucide-react';

const StatBar = ({ label, value, maxValue = 20, icon: Icon }) => {
  const percentage = (value / maxValue) * 100;
  
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
      <span className="text-[10px] sm:text-xs text-gray-400 w-8 sm:w-12">{label}</span>
      <div className="flex-grow h-1.5 sm:h-2 bg-white/10 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[#6B46C1] to-purple-400 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-[10px] sm:text-xs font-medium w-5 sm:w-6 text-right">{value}</span>
    </div>
  );
};

const CharacterSelect = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { startCampaign } = useGame();
  const [campaign, setCampaign] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    const loadCampaign = async () => {
      try {
        const data = await getCampaign(campaignId);
        setCampaign(data);
      } catch (error) {
        console.error('Failed to load campaign:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadCampaign();
  }, [campaignId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1A1A2E] flex items-center justify-center text-white">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#6B46C1]" />
          <p className="text-gray-400">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-[#1A1A2E] flex items-center justify-center text-white p-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-serif mb-4">Campaign Not Found</h2>
          <Button onClick={() => navigate('/')} variant="outline">
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  const handleStartCampaign = async () => {
    if (!selectedCharacter) return;
    
    setIsStarting(true);
    try {
      await startCampaign(campaignId, selectedCharacter.id);
      navigate('/game');
    } catch (error) {
      console.error('Failed to start campaign:', error);
      setIsStarting(false);
    }
  };

  const getClassIcon = (className) => {
    switch (className.toLowerCase()) {
      case 'fighter':
      case 'barbarian':
      case 'paladin':
        return Sword;
      case 'rogue':
      case 'ranger':
        return Eye;
      case 'cleric':
        return Heart;
      case 'wizard':
      case 'sorcerer':
        return Sparkles;
      case 'bard':
        return Smile;
      default:
        return Shield;
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A2E] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#1A1A2E]/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3 sm:gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/')}
            className="hover:bg-white/10 w-9 h-9 sm:w-10 sm:h-10"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          <div>
            <h1 className="text-base sm:text-xl font-serif font-bold line-clamp-1">{campaign.title}</h1>
            <p className="text-xs sm:text-sm text-gray-400">Choose Your Hero</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-10">
        {/* Campaign Info - Hidden on mobile for space */}
        <div className="hidden sm:block mb-8 p-4 sm:p-6 rounded-xl bg-[#252542]/50 border border-white/10">
          <div className="flex items-start gap-4">
            <img 
              src={campaign.backgroundImage} 
              alt={campaign.title}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover"
            />
            <div className="flex-grow">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                  {campaign.type}
                </Badge>
                <Badge variant="outline" className="bg-white/5 text-gray-300 border-white/20 text-xs">
                  {campaign.difficulty}
                </Badge>
              </div>
              <p className="text-gray-300 text-sm">{campaign.tagline}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {campaign.genres.map((genre) => (
                  <span key={genre} className="text-xs px-2 py-1 rounded-full bg-white/5 text-gray-400">
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Character Grid */}
        <h2 className="text-xl sm:text-2xl font-serif font-bold mb-4 sm:mb-6 text-center">
          Select Your Character
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-8">
          {campaign.characters.map((character) => {
            const ClassIcon = getClassIcon(character.class);
            const isSelected = selectedCharacter?.id === character.id;
            
            return (
              <Card 
                key={character.id}
                className={`
                  group relative overflow-hidden cursor-pointer transition-all duration-300 active:scale-[0.98]
                  ${isSelected 
                    ? 'bg-[#6B46C1]/20 border-[#6B46C1] ring-2 ring-[#6B46C1]/50' 
                    : 'bg-[#252542] border-white/10 hover:border-white/30'}
                `}
                onClick={() => setSelectedCharacter(character)}
              >
                <CardContent className="p-3 sm:p-6">
                  <div className="flex gap-3 sm:gap-4">
                    {/* Character Portrait */}
                    <div className="relative flex-shrink-0">
                      <Avatar className="w-14 h-14 sm:w-20 sm:h-20 border-2 border-white/20">
                        <AvatarImage src={character.portraitUrl} alt={character.name} />
                        <AvatarFallback className="bg-[#6B46C1] text-white text-lg sm:text-xl font-serif">
                          {character.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#252542] border border-white/20 flex items-center justify-center">
                        <ClassIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#6B46C1]" />
                      </div>
                    </div>

                    {/* Character Info */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5 sm:mb-1">
                        <h3 className="text-base sm:text-lg font-serif font-bold truncate">{character.name}</h3>
                        <Badge variant="outline" className="bg-white/5 text-gray-300 border-white/20 text-[10px] sm:text-xs flex-shrink-0">
                          Lv {character.level}
                        </Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-[#6B46C1] font-medium mb-1 sm:mb-2">{character.class}</p>
                      <p className="text-xs sm:text-sm text-gray-400 line-clamp-2 hidden sm:block">{character.description}</p>
                    </div>
                  </div>

                  {/* Stats Preview */}
                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/10 grid grid-cols-2 gap-1.5 sm:gap-2">
                    <StatBar label="STR" value={character.stats.strength} icon={Sword} />
                    <StatBar label="DEX" value={character.stats.dexterity} icon={Zap} />
                    <StatBar label="CON" value={character.stats.constitution} icon={Shield} />
                    <StatBar label="INT" value={character.stats.intelligence} icon={Brain} />
                    <StatBar label="WIS" value={character.stats.wisdom} icon={Eye} />
                    <StatBar label="CHA" value={character.stats.charisma} icon={Smile} />
                  </div>

                  {/* HP Bar */}
                  <div className="mt-3 sm:mt-4 flex items-center gap-2">
                    <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                    <span className="text-[10px] sm:text-xs text-gray-400">HP</span>
                    <Progress 
                      value={100} 
                      className="flex-grow h-1.5 sm:h-2 bg-white/10" 
                    />
                    <span className="text-[10px] sm:text-xs font-medium">{character.hp.max}</span>
                  </div>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#6B46C1] flex items-center justify-center">
                        <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Start Campaign Button - Fixed on mobile */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#1A1A2E]/95 backdrop-blur-sm border-t border-white/10 sm:relative sm:bottom-auto sm:left-auto sm:right-auto sm:p-0 sm:bg-transparent sm:border-0 sm:flex sm:justify-center">
          <Button
            size="lg"
            disabled={!selectedCharacter || isStarting}
            onClick={handleStartCampaign}
            className={`
              w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg font-medium transition-all duration-300
              ${selectedCharacter 
                ? 'bg-[#6B46C1] hover:bg-[#5a3aa8] text-white shadow-lg shadow-[#6B46C1]/25' 
                : 'bg-gray-600 text-gray-300 cursor-not-allowed'}
            `}
          >
            {isStarting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Entering...
              </span>
            ) : selectedCharacter ? (
              <span className="flex items-center gap-2">
                Begin as {selectedCharacter.name}
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </span>
            ) : (
              'Select a Character'
            )}
          </Button>
        </div>
        
        {/* Spacer for fixed button on mobile */}
        <div className="h-20 sm:hidden" />
      </main>
    </div>
  );
};

export default CharacterSelect;
