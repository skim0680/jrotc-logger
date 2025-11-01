import React, { useState } from 'react';
import { DataProvider } from './context/DataContext';
import Dashboard from './components/Dashboard';
import CorpsManagement from './components/CorpsManagement';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedCorps, setSelectedCorps] = useState(null);

  const handleSelectCorps = (corps) => {
    setSelectedCorps(corps);
    setCurrentView('corps');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedCorps(null);
  };

  return (
    <DataProvider>
      <div className="app">
        {currentView === 'dashboard' ? (
          <Dashboard onSelectCorps={handleSelectCorps} />
        ) : (
          <CorpsManagement 
            corps={selectedCorps} 
            onBack={handleBackToDashboard} 
          />
        )}
      </div>
    </DataProvider>
  );
}

export default App;
