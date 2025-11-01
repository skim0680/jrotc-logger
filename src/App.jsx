import React, { useState } from 'react';
import { DataProvider } from './context/DataContext';
import Dashboard from './components/Dashboard';
import CorpsManagement from './components/CorpsManagement';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedSchoolYear, setSelectedSchoolYear] = useState(null);

  const handleSelectSchoolYear = (schoolYear) => {
    setSelectedSchoolYear(schoolYear);
    setCurrentView('manage');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedSchoolYear(null);
  };

  return (
    <DataProvider>
      <div className="app">
        {currentView === 'dashboard' ? (
          <Dashboard onSelectSchoolYear={handleSelectSchoolYear} />
        ) : (
          <CorpsManagement 
            schoolYear={selectedSchoolYear} 
            onBack={handleBackToDashboard} 
          />
        )}
      </div>
    </DataProvider>
  );
}

export default App;
