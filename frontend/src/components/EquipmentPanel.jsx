import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { equipmentSlots, rarityColors } from '../data/mockData';
import { 
  Heart, 
  Shield,
  Sword,
  Zap,
  Brain,
  Eye,
  Smile,
  Crown,
  Gem,
  Wind,
  Footprints,
  Circle,
  Package,
  ArrowUp,
  X
} from 'lucide-react';
import { Button } from './ui/button';

const iconMap = {
  Crown,
  Gem,
  Shield,
  Sword,
  Wind,
  Footprints,
  Circle
};

// Map item types to valid equipment slots
const itemTypeToSlots = {
  'Weapon': ['mainHand', 'offHand'],
  'Shield': ['offHand'],
  'Armor': ['body'],
  'Helmet': ['head'],
  'Amulet': ['neck'],
  'Ring': ['ring1', 'ring2'],
  'Cloak': ['cloak'],
  'Boots': ['feet'],
  'Focus': ['mainHand', 'offHand', 'neck']
};

const EquipmentPanel = ({ open, onClose }) => {
  const { selectedCharacter, unequipItem, equipItem } = useGame();
  const [selectedInventoryItem, setSelectedInventoryItem] = useState(null);
  const [selectedInventoryIndex, setSelectedInventoryIndex] = useState(null);

  if (!selectedCharacter) return null;

  const { name, class: charClass, level, portraitUrl, hp, stats, equipment, inventory } = selectedCharacter;

  const getModifier = (stat) => {
    const mod = Math.floor((stat - 10) / 2);
    return mod >= 0 ? `+${mod}` : mod.toString();
  };

  const getValidSlotsForItem = (item) => {
    if (!item) return [];
    return itemTypeToSlots[item.type] || [];
  };

  const isEquippableItem = (item) => {
    return getValidSlotsForItem(item).length > 0;
  };

  const handleSlotClick = (slotId) => {
    if (selectedInventoryItem) {
      // Try to equip selected inventory item to this slot
      const validSlots = getValidSlotsForItem(selectedInventoryItem);
      if (validSlots.includes(slotId)) {
        // Pass the item with its inventory index
        equipItem(slotId, selectedInventoryItem, selectedInventoryIndex);
        setSelectedInventoryItem(null);
        setSelectedInventoryIndex(null);
      }
    } else {
      // Unequip current item if slot has one
      const item = equipment[slotId];
      if (item) {
        unequipItem(slotId);
      }
    }
  };

  const handleInventoryItemClick = (item, index) => {
    if (!isEquippableItem(item)) return;
    
    if (selectedInventoryItem?.id === item.id && selectedInventoryIndex === index) {
      setSelectedInventoryItem(null);
      setSelectedInventoryIndex(null);
    } else {
      setSelectedInventoryItem(item);
      setSelectedInventoryIndex(index);
    }
  };

  const cancelSelection = () => {
    setSelectedInventoryItem(null);
    setSelectedInventoryIndex(null);
  };

  const renderEquipmentSlot = (slot) => {
    if (!slot) return null;
    const item = equipment[slot.id];
    const SlotIcon = iconMap[slot.icon] || Package;
    const rarityClass = item ? rarityColors[item.rarity] || 'text-gray-400 border-gray-500' : '';
    
    // Check if selected inventory item can go in this slot
    const canEquipHere = selectedInventoryItem && getValidSlotsForItem(selectedInventoryItem).includes(slot.id);

    return (
      <TooltipProvider key={slot.id}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => handleSlotClick(slot.id)}
              className={`
                w-14 h-14 sm:w-16 sm:h-16 rounded-lg border-2 flex flex-col items-center justify-center gap-0.5 transition-all
                ${item 
                  ? `${rarityClass} bg-[#252542] border-solid hover:bg-[#353560] cursor-pointer` 
                  : canEquipHere
                    ? 'border-[#6B46C1] bg-[#6B46C1]/30 text-[#6B46C1] border-solid animate-pulse cursor-pointer'
                    : 'border-white/20 bg-[#1A1A2E]/50 text-gray-500 border-dashed'}
              `}
            >
              {item ? (
                <span className="text-[10px] sm:text-xs font-medium text-center px-0.5 line-clamp-2">
                  {item.name.split(' ').slice(0, 2).join(' ')}
                </span>
              ) : canEquipHere ? (
                <>
                  <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-[9px] sm:text-[10px]">Equip</span>
                </>
              ) : (
                <>
                  <SlotIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-[9px] sm:text-[10px]">{slot.label}</span>
                </>
              )}
            </button>
          </TooltipTrigger>
          {item ? (
            <TooltipContent side="left" className="max-w-[200px] bg-[#252542] border-white/10">
              <div className="space-y-1">
                <p className={`font-medium ${rarityClass.split(' ')[0]}`}>{item.name}</p>
                <p className="text-xs text-gray-400">{item.type}</p>
                {item.damage && <p className="text-xs">Damage: {item.damage}</p>}
                {item.ac && <p className="text-xs">AC: +{item.ac}</p>}
                {item.effect && <p className="text-xs text-purple-300">{item.effect}</p>}
                <p className="text-xs text-amber-400">Tap to unequip</p>
              </div>
            </TooltipContent>
          ) : null}
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-[400px] sm:max-w-[450px] bg-[#1A1A2E] border-white/10 text-white p-0">
        <SheetHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-white/10">
          <SheetTitle className="text-white font-serif text-lg sm:text-xl">Character & Equipment</SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-70px)] sm:h-[calc(100vh-80px)]">
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Character Header */}
            <div className="flex items-center gap-3 sm:gap-4">
              <Avatar className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-[#6B46C1]">
                <AvatarImage src={portraitUrl} alt={name} />
                <AvatarFallback className="bg-[#6B46C1] text-white text-xl sm:text-2xl font-serif">
                  {name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg sm:text-xl font-serif font-bold">{name}</h2>
                <p className="text-[#6B46C1] font-medium text-sm sm:text-base">{charClass}</p>
                <Badge variant="outline" className="mt-1 bg-white/5 border-white/20 text-xs">
                  Level {level}
                </Badge>
              </div>
            </div>

            {/* HP Bar */}
            <div className="bg-[#252542] rounded-lg p-3 sm:p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                  <Heart className="w-4 h-4 text-red-400" />
                  Hit Points
                </span>
                <span className="font-medium text-sm sm:text-base">{hp.current} / {hp.max}</span>
              </div>
              <Progress 
                value={(hp.current / hp.max) * 100} 
                className="h-2 sm:h-3 bg-white/10"
              />
            </div>

            {/* Equipment Paper Doll */}
            <div className="bg-[#252542] rounded-lg p-3 sm:p-4 border border-white/10">
              <h3 className="text-xs sm:text-sm uppercase text-gray-400 font-medium mb-3 sm:mb-4">Equipment</h3>
              
              {selectedInventoryItem && (
                <div className="mb-3 sm:mb-4 p-2 sm:p-3 rounded-lg bg-[#6B46C1]/20 border border-[#6B46C1]/50">
                  <div className="flex items-center justify-between">
                    <p className="text-xs sm:text-sm text-[#6B46C1]">
                      Tap a glowing slot to equip <strong>{selectedInventoryItem.name}</strong>
                    </p>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={cancelSelection}
                      className="w-6 h-6 hover:bg-white/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-3 gap-2 sm:gap-3 place-items-center">
                {/* Row 1: Head */}
                <div />
                {renderEquipmentSlot(equipmentSlots.find(s => s.id === 'head'))}
                <div />
                
                {/* Row 2: Main Hand, Body/Neck, Off Hand */}
                {renderEquipmentSlot(equipmentSlots.find(s => s.id === 'mainHand'))}
                <div className="space-y-2">
                  {renderEquipmentSlot(equipmentSlots.find(s => s.id === 'neck'))}
                  {renderEquipmentSlot(equipmentSlots.find(s => s.id === 'body'))}
                </div>
                {renderEquipmentSlot(equipmentSlots.find(s => s.id === 'offHand'))}
                
                {/* Row 3: Cloak */}
                <div />
                {renderEquipmentSlot(equipmentSlots.find(s => s.id === 'cloak'))}
                <div />
                
                {/* Row 4: Ring 1, Feet, Ring 2 */}
                {renderEquipmentSlot(equipmentSlots.find(s => s.id === 'ring1'))}
                {renderEquipmentSlot(equipmentSlots.find(s => s.id === 'feet'))}
                {renderEquipmentSlot(equipmentSlots.find(s => s.id === 'ring2'))}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-[#252542] rounded-lg p-3 sm:p-4 border border-white/10">
              <h3 className="text-xs sm:text-sm uppercase text-gray-400 font-medium mb-3 sm:mb-4">Ability Scores</h3>
              
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <StatBlock icon={Sword} label="STR" value={stats.strength} modifier={getModifier(stats.strength)} />
                <StatBlock icon={Zap} label="DEX" value={stats.dexterity} modifier={getModifier(stats.dexterity)} />
                <StatBlock icon={Shield} label="CON" value={stats.constitution} modifier={getModifier(stats.constitution)} />
                <StatBlock icon={Brain} label="INT" value={stats.intelligence} modifier={getModifier(stats.intelligence)} />
                <StatBlock icon={Eye} label="WIS" value={stats.wisdom} modifier={getModifier(stats.wisdom)} />
                <StatBlock icon={Smile} label="CHA" value={stats.charisma} modifier={getModifier(stats.charisma)} />
              </div>
            </div>

            {/* Inventory */}
            <div className="bg-[#252542] rounded-lg p-3 sm:p-4 border border-white/10">
              <h3 className="text-xs sm:text-sm uppercase text-gray-400 font-medium mb-2">Inventory</h3>
              <p className="text-[10px] sm:text-xs text-gray-500 mb-3">Tap an equippable item, then tap a slot</p>
              
              {inventory.length === 0 ? (
                <p className="text-xs sm:text-sm text-gray-500 text-center py-4">No items in inventory</p>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {inventory.map((item, index) => {
                    const rarityClass = rarityColors[item.rarity] || 'text-gray-400 border-gray-500';
                    const isSelected = selectedInventoryItem?.id === item.id && selectedInventoryIndex === index;
                    const canEquip = isEquippableItem(item);
                    
                    return (
                      <TooltipProvider key={`${item.id}-${index}`}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button 
                              onClick={() => handleInventoryItemClick(item, index)}
                              disabled={!canEquip}
                              className={`
                                w-full aspect-square rounded-lg border flex flex-col items-center justify-center
                                transition-all
                                ${isSelected 
                                  ? 'bg-[#6B46C1]/40 border-[#6B46C1] ring-2 ring-[#6B46C1]/50' 
                                  : canEquip
                                    ? `bg-[#1A1A2E] ${rarityClass} cursor-pointer hover:bg-[#252542] active:scale-95`
                                    : `bg-[#1A1A2E]/50 ${rarityClass} opacity-50 cursor-not-allowed`}
                              `}
                            >
                              <Package className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5" />
                              {item.quantity > 1 && (
                                <span className="text-[10px] sm:text-xs font-medium">x{item.quantity}</span>
                              )}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="bg-[#252542] border-white/10">
                            <div className="space-y-1">
                              <p className={`font-medium ${rarityClass.split(' ')[0]}`}>{item.name}</p>
                              <p className="text-xs text-gray-400">{item.type}</p>
                              {item.damage && <p className="text-xs">Damage: {item.damage}</p>}
                              {item.effect && <p className="text-xs text-purple-300">{item.effect}</p>}
                              {canEquip 
                                ? <p className="text-xs text-emerald-400">Tap to select</p>
                                : <p className="text-xs text-gray-500">Cannot be equipped</p>
                              }
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

const StatBlock = ({ icon: Icon, label, value, modifier }) => (
  <div className="bg-[#1A1A2E] rounded-lg p-2 sm:p-3 text-center border border-white/10">
    <Icon className="w-3 h-3 sm:w-4 sm:h-4 mx-auto mb-0.5 sm:mb-1 text-[#6B46C1]" />
    <p className="text-[10px] sm:text-xs text-gray-400">{label}</p>
    <p className="text-base sm:text-lg font-bold">{value}</p>
    <p className="text-[10px] sm:text-xs text-[#6B46C1]">{modifier}</p>
  </div>
);

export default EquipmentPanel;
