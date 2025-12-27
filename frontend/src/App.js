import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider } from './contexts/GameContext';
import CampaignDashboard from './components/CampaignDashboard';
import CharacterSelect from './components/CharacterSelect';
import MainGame from './components/MainGame';
import { Toaster } from './components/ui/sonner';

function App() {
  return (
    <GameProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<CampaignDashboard />} />
            <Route path="/campaign/:campaignId/characters" element={<CharacterSelect />} />
            <Route path="/game" element={<MainGame />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" />
      </div>
    </GameProvider>
  );
}

export default App;
