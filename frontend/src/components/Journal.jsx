import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { 
  BookOpen, 
  Target, 
  CheckCircle2, 
  Users, 
  MapPin, 
  Scroll,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  Clock,
  Feather
} from 'lucide-react';

const Journal = ({ open, onClose }) => {
  const { journal, addJournalEntry, updateJournalEntry, deleteJournalEntry, turnCount } = useGame();
  const [activeTab, setActiveTab] = useState('quests');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newEntry, setNewEntry] = useState({ title: '', description: '', category: 'notes' });

  // Journal categories
  const categories = {
    quests: { label: 'Quests', icon: Target, color: 'amber' },
    people: { label: 'People Met', icon: Users, color: 'blue' },
    places: { label: 'Places Visited', icon: MapPin, color: 'emerald' },
    notes: { label: 'Notes', icon: Feather, color: 'purple' }
  };

  const handleAddEntry = () => {
    if (newEntry.title.trim()) {
      addJournalEntry({
        ...newEntry,
        category: activeTab,
        turn: turnCount,
        timestamp: new Date().toISOString()
      });
      setNewEntry({ title: '', description: '', category: 'notes' });
      setIsAdding(false);
    }
  };

  const handleUpdateEntry = (id) => {
    const entry = journal.find(e => e.id === id);
    if (entry) {
      updateJournalEntry(id, { title: newEntry.title, description: newEntry.description });
      setEditingId(null);
      setNewEntry({ title: '', description: '', category: 'notes' });
    }
  };

  const startEditing = (entry) => {
    setEditingId(entry.id);
    setNewEntry({ title: entry.title, description: entry.description, category: entry.category });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setNewEntry({ title: '', description: '', category: 'notes' });
  };

  const getEntriesForCategory = (category) => {
    return journal.filter(entry => entry.category === category);
  };

  const renderEntryForm = (onSubmit, onCancel, submitLabel = 'Add') => (
    <div className="bg-[#252542] rounded-lg border border-white/10 p-4 space-y-3">
      <Input
        placeholder="Title..."
        value={newEntry.title}
        onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
        className="bg-[#1A1A2E] border-white/10 text-white placeholder:text-gray-500"
        autoFocus
      />
      <Textarea
        placeholder="Write your notes here..."
        value={newEntry.description}
        onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
        className="bg-[#1A1A2E] border-white/10 text-white placeholder:text-gray-500 min-h-[80px] resize-none"
      />
      <div className="flex gap-2 justify-end">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onCancel}
          className="text-gray-400 hover:text-white hover:bg-white/10"
        >
          <X className="w-4 h-4 mr-1" />
          Cancel
        </Button>
        <Button 
          size="sm" 
          onClick={onSubmit}
          disabled={!newEntry.title.trim()}
          className="bg-[#6B46C1] hover:bg-[#5B3BA1] text-white"
        >
          <Save className="w-4 h-4 mr-1" />
          {submitLabel}
        </Button>
      </div>
    </div>
  );

  const renderEntry = (entry) => {
    const isEditing = editingId === entry.id;
    const CategoryIcon = categories[entry.category]?.icon || Scroll;

    if (isEditing) {
      return (
        <div key={entry.id}>
          {renderEntryForm(
            () => handleUpdateEntry(entry.id),
            cancelEditing,
            'Update'
          )}
        </div>
      );
    }

    return (
      <div 
        key={entry.id}
        className="bg-[#252542] rounded-lg border border-white/10 p-4 group hover:border-white/20 transition-colors"
      >
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-lg bg-${categories[entry.category]?.color || 'purple'}-500/20 flex items-center justify-center flex-shrink-0`}>
            <CategoryIcon className={`w-4 h-4 text-${categories[entry.category]?.color || 'purple'}-400`} />
          </div>
          <div className="flex-grow min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-medium text-white text-sm">{entry.title}</h4>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => startEditing(entry)}
                  className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteJournalEntry(entry.id)}
                  className="p-1 rounded hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {entry.description && (
              <p className="text-xs text-gray-400 mt-1 whitespace-pre-wrap">{entry.description}</p>
            )}
            <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-500">
              <Clock className="w-3 h-3" />
              <span>Turn {entry.turn || 1}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCategoryContent = (category) => {
    const entries = getEntriesForCategory(category);
    const CategoryIcon = categories[category].icon;
    const colorClass = categories[category].color;

    return (
      <div className="space-y-4">
        {/* Add New Entry Button */}
        {!isAdding ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="w-full border-dashed border-white/20 text-gray-400 hover:text-white hover:border-white/40 hover:bg-white/5"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add {categories[category].label.slice(0, -1) || 'Entry'}
          </Button>
        ) : (
          renderEntryForm(handleAddEntry, () => setIsAdding(false))
        )}

        {/* Entries List */}
        {entries.length === 0 && !isAdding ? (
          <div className="text-center py-8 text-gray-500">
            <CategoryIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No {categories[category].label.toLowerCase()} recorded yet.</p>
            <p className="text-xs mt-1">
              {category === 'quests' && "Record quests as you discover or receive them."}
              {category === 'people' && "Note down the people you meet on your journey."}
              {category === 'places' && "Keep track of the towns and locations you visit."}
              {category === 'notes' && "Jot down anything important you want to remember."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map(renderEntry)}
          </div>
        )}
      </div>
    );
  };

  const getQuestStats = () => {
    const quests = getEntriesForCategory('quests');
    const completed = quests.filter(q => q.completed).length;
    return { total: quests.length, completed };
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl h-[85vh] sm:h-[80vh] bg-[#1A1A2E] border-white/10 text-white p-0 gap-0">
        <DialogHeader className="p-4 sm:p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 font-serif text-lg sm:text-xl">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-[#6B46C1]" />
            Adventure Journal
          </DialogTitle>
          <p className="text-xs text-gray-500 mt-1">Chronicle your journey as you explore</p>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setIsAdding(false); cancelEditing(); }} className="flex-grow flex flex-col">
          <TabsList className="mx-4 sm:mx-6 mt-3 sm:mt-4 bg-[#252542] border border-white/10 grid grid-cols-4">
            {Object.entries(categories).map(([key, { label, icon: Icon, color }]) => {
              const count = getEntriesForCategory(key).length;
              return (
                <TabsTrigger 
                  key={key}
                  value={key}
                  className={`text-xs data-[state=active]:bg-[#6B46C1] data-[state=active]:text-white relative`}
                >
                  <Icon className="w-3.5 h-3.5 mr-1" />
                  <span className="hidden sm:inline">{label}</span>
                  {count > 0 && (
                    <Badge 
                      variant="secondary" 
                      className="ml-1 h-4 px-1 text-[10px] bg-white/10"
                    >
                      {count}
                    </Badge>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {Object.keys(categories).map((category) => (
            <TabsContent 
              key={category} 
              value={category} 
              className="flex-grow p-4 sm:p-6 pt-3 sm:pt-4 m-0"
            >
              <ScrollArea className="h-[calc(85vh-180px)] sm:h-[calc(80vh-200px)]">
                {renderCategoryContent(category)}
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default Journal;
