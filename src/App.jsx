import React, { useState } from 'react';
import { DataProvider } from './context/DataContext';
import AuthComponent from './components/AuthComponent';
import Dashboard from './components/Dashboard';
import SchoolYearManagement from './components/SchoolYearManagement2';
import ChainOfCommandBuilder from './components/ChainOfCommandBuilder';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedSchoolYear, setSelectedSchoolYear] = useState(null);

  const handleSelectSchoolYear = (schoolYear) => {
    setSelectedSchoolYear(schoolYear);
    setCurrentView('manage');
  };

  const handleOpenChainOfCommand = (schoolYear) => {
    setSelectedSchoolYear(schoolYear);
    setCurrentView('coc-builder');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedSchoolYear(null);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onSelectSchoolYear={handleSelectSchoolYear} />;
      case 'manage':
        return (
          <SchoolYearManagement 
            schoolYear={selectedSchoolYear} 
            onBack={handleBackToDashboard}
            onOpenChainOfCommand={() => handleOpenChainOfCommand(selectedSchoolYear)}
          />
        );
      case 'coc-builder':
        return (
          <ChainOfCommandBuilder 
            schoolYear={selectedSchoolYear} 
            onBack={handleBackToDashboard}
          />
        );
      default:
        return <Dashboard onSelectSchoolYear={handleSelectSchoolYear} />;
    }
  };

  return (
    <AuthComponent>
      <DataProvider>
        <div className="app">
          {renderCurrentView()}
        </div>
      </DataProvider>
    </AuthComponent>
  );
}

export default App;
