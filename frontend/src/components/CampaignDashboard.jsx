import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Scroll, Swords, Clock, Sparkles, ArrowLeft, ChevronRight, Loader2 } from 'lucide-react';

const campaignTypes = [
  {
    id: 'Epic',
    title: 'Epic Quest',
    icon: Swords,
    tagline: 'Fame, fortune, and a predetermined goal await.',
    description: 'Quest-driven adventures with clear objectives. Perfect for those who want a focused narrative with epic stakes and satisfying conclusions.',
    color: 'amber',
    features: ['Clear main objective', 'Structured pacing', 'Epic boss battles', 'Heroic rewards']
  },
  {
    id: 'Fated',
    title: 'Fated Journey',
    icon: Clock,
    tagline: 'Live out a life. Let destiny unfold.',
    description: 'The AI determines when your story reaches its natural conclusion based on narrative tension. Embrace the unexpected and let your character\'s fate emerge organically.',
    color: 'purple',
    features: ['Organic story endings', 'Character-driven narrative', 'Emergent storytelling', 'Surprise climaxes']
  },
  {
    id: 'Final Season',
    title: 'Final Season',
    icon: Sparkles,
    tagline: 'You decide when the story ends.',
    description: 'Open-ended exploration where you control the narrative\'s conclusion. Play for as long as you want and trigger your ending when you\'re ready.',
    color: 'emerald',
    features: ['Unlimited gameplay', 'Player-controlled ending', 'Sandbox exploration', 'Maximum freedom']
  }
];

const CampaignDashboard = () => {
  const navigate = useNavigate();
  const { allCampaigns, isLoadingCampaigns } = useGame();
  const [selectedType, setSelectedType] = useState(null);

  const getColorClasses = (color) => {
    const colors = {
      amber: {
        bg: 'bg-amber-500/20',
        border: 'border-amber-500/30',
        text: 'text-amber-400',
        hover: 'hover:border-amber-500/50',
        ring: 'ring-amber-500/30'
      },
      purple: {
        bg: 'bg-purple-500/20',
        border: 'border-purple-500/30',
        text: 'text-purple-400',
        hover: 'hover:border-purple-500/50',
        ring: 'ring-purple-500/30'
      },
      emerald: {
        bg: 'bg-emerald-500/20',
        border: 'border-emerald-500/30',
        text: 'text-emerald-400',
        hover: 'hover:border-emerald-500/50',
        ring: 'ring-emerald-500/30'
      }
    };
    return colors[color] || colors.purple;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never played';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredCampaigns = selectedType 
    ? allCampaigns.filter(c => c.type === selectedType)
    : [];

  // Type Selection View
  if (!selectedType) {
    return (
      <div className="min-h-screen bg-[#1A1A2E] text-white">
        {/* Header */}
        <header className="border-b border-white/10 bg-[#1A1A2E]/95 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <Scroll className="w-6 h-6 sm:w-8 sm:h-8 text-[#6B46C1]" />
              <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-wide">StoryForge</h1>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          {/* Hero Section */}
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-3 sm:mb-4">
              Choose Your Path
            </h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto px-4">
              How do you want your story to unfold? Each path offers a unique way to experience your adventure.
            </p>
          </div>

          {/* Campaign Type Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {campaignTypes.map((type) => {
              const Icon = type.icon;
              const colors = getColorClasses(type.color);
              
              return (
                <Card 
                  key={type.id}
                  className={`group relative overflow-hidden bg-[#252542] border-white/10 ${colors.hover} transition-all duration-300 cursor-pointer active:scale-[0.98] md:hover:scale-[1.02]`}
                  onClick={() => setSelectedType(type.id)}
                >
                  <CardContent className="p-4 sm:p-6 flex flex-col h-full min-h-[300px] sm:min-h-[380px]">
                    {/* Icon */}
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl ${colors.bg} flex items-center justify-center mb-3 sm:mb-4`}>
                      <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${colors.text}`} />
                    </div>

                    {/* Title & Tagline */}
                    <h3 className="text-xl sm:text-2xl font-serif font-bold mb-1 sm:mb-2">{type.title}</h3>
                    <p className={`${colors.text} font-medium text-sm sm:text-base mb-3 sm:mb-4`}>{type.tagline}</p>
                    
                    {/* Description */}
                    <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed">
                      {type.description}
                    </p>

                    {/* Features */}
                    <div className="flex-grow">
                      <ul className="space-y-1.5 sm:space-y-2">
                        {type.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-2 text-xs sm:text-sm text-gray-300">
                            <ChevronRight className={`w-3 h-3 sm:w-4 sm:h-4 ${colors.text} flex-shrink-0`} />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* CTA */}
                    <Button 
                      className={`w-full mt-4 sm:mt-6 ${colors.bg} ${colors.text} border ${colors.border} hover:bg-opacity-30 text-sm sm:text-base`}
                    >
                      Browse Campaigns
                      <ChevronRight className="w-4 h-4 ml-1 sm:ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  // Campaign List View (filtered by type)
  const currentType = campaignTypes.find(t => t.id === selectedType);
  const colors = getColorClasses(currentType?.color || 'purple');
  const TypeIcon = currentType?.icon || Scroll;

  return (
    <div className="min-h-screen bg-[#1A1A2E] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#1A1A2E]/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3 sm:gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSelectedType(null)}
            className="hover:bg-white/10 w-9 h-9 sm:w-10 sm:h-10"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          <div className="flex items-center gap-2 sm:gap-3">
            <Scroll className="w-6 h-6 sm:w-8 sm:h-8 text-[#6B46C1]" />
            <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-wide">StoryForge</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Type Header */}
        <div className="mb-6 sm:mb-10">
          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl ${colors.bg} flex items-center justify-center`}>
              <TypeIcon className={`w-5 h-5 sm:w-7 sm:h-7 ${colors.text}`} />
            </div>
            <div>
              <h2 className="text-xl sm:text-3xl font-serif font-bold">{currentType?.title} Campaigns</h2>
              <p className={`${colors.text} text-sm sm:text-base`}>{currentType?.tagline}</p>
            </div>
          </div>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl">{currentType?.description}</p>
        </div>

        {/* Campaign Grid */}
        {filteredCampaigns.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <TypeIcon className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 ${colors.text} opacity-50`} />
            <h3 className="text-lg sm:text-xl font-medium text-gray-400 mb-2">No campaigns yet</h3>
            <p className="text-gray-500 text-sm sm:text-base">New {currentType?.title.toLowerCase()} campaigns coming soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredCampaigns.map((campaign) => (
              <Card 
                key={campaign.id}
                className={`group relative overflow-hidden bg-[#252542] border-white/10 hover:border-[#6B46C1]/50 transition-all duration-300 cursor-pointer active:scale-[0.98]`}
                onClick={() => navigate(`/campaign/${campaign.id}/characters`)}
              >
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                  <img 
                    src={campaign.backgroundImage} 
                    alt={campaign.title}
                    className="w-full h-full object-cover opacity-30 group-hover:opacity-40 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#252542] via-[#252542]/80 to-transparent" />
                </div>

                <CardContent className="relative z-10 p-4 sm:p-6 flex flex-col h-full min-h-[240px] sm:min-h-[280px]">
                  {/* Badges */}
                  <div className="flex items-center gap-2 mb-3 sm:mb-4 flex-wrap">
                    <Badge variant="outline" className={`${colors.bg} ${colors.text} ${colors.border} flex items-center gap-1 text-xs`}>
                      <TypeIcon className="w-3 h-3" />
                      {campaign.type}
                    </Badge>
                    <Badge variant="outline" className="bg-white/5 text-gray-300 border-white/20 text-xs">
                      {campaign.difficulty}
                    </Badge>
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="text-lg sm:text-xl font-serif font-bold mb-2 group-hover:text-[#6B46C1] transition-colors">
                    {campaign.title}
                  </h3>
                  <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                    {campaign.tagline}
                  </p>

                  {/* Genre Tags */}
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                    {campaign.genres.map((genre) => (
                      <span 
                        key={genre}
                        className="text-[10px] sm:text-xs px-2 py-0.5 sm:py-1 rounded-full bg-white/5 text-gray-300"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>

                  {/* Spacer */}
                  <div className="flex-grow" />

                  {/* Stats & Progress */}
                  <div className="space-y-2 sm:space-y-3">
                    {campaign.turnCount > 0 && (
                      <Progress value={campaign.progress} className="h-1 sm:h-1.5 bg-white/10" />
                    )}

                    <div className="flex items-center justify-between text-xs sm:text-sm text-gray-400">
                      <span>{campaign.estimatedLength}</span>
                      <span>{formatDate(campaign.lastPlayed)}</span>
                    </div>
                  </div>

                  {/* Hover Action - Hidden on mobile, tap works */}
                  <div className="mt-3 sm:mt-4 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                    <Button className="w-full bg-[#6B46C1] hover:bg-[#5a3aa8] text-white font-medium text-sm sm:text-base">
                      {campaign.turnCount > 0 ? 'Continue' : 'Begin Adventure'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default CampaignDashboard;
