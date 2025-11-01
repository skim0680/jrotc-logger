import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { ArrowLeft, Users, Plus, Settings, Command, Calendar, Award } from 'lucide-react';
import CadetManagement from './CadetManagement';
import ActivityConfiguration from './ActivityConfiguration';
import './CorpsManagement.css';

const SchoolYearManagement = ({ schoolYear, onBack, onOpenChainOfCommand }) => {
  const { setCurrentSchoolYear } = useData();
  const [activeTab, setActiveTab] = useState('cadets');

  useEffect(() => {
    setCurrentSchoolYear(schoolYear);
    
    // Cleanup when component unmounts
    return () => {
      setCurrentSchoolYear(null);
    };
  }, [schoolYear, setCurrentSchoolYear]);

  const handleOpenChainBuilder = () => {
    onOpenChainOfCommand(schoolYear);
  };

  return (
    <div className="corps-management">
      <header className="corps-header">
        <div className="corps-header-left">
          <button className="btn btn-secondary" onClick={onBack}>
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          <div className="corps-info">
            <div className="unit-badge">
              <Award size={24} />
            </div>
            <div>
              <h1>AFJROTC Unit CA-882</h1>
              <p className="school-year-title">School Year: {schoolYear.name}</p>
            </div>
          </div>
        </div>
        <div className="corps-header-actions">
          <button 
            className="btn btn-primary"
            onClick={handleOpenChainBuilder}
          >
            <Command size={16} />
            Chain of Command Builder
          </button>
        </div>
      </header>

      <div className="corps-content">
        <nav className="corps-nav">
          <button 
            className={`nav-btn ${activeTab === 'cadets' ? 'active' : ''}`}
            onClick={() => setActiveTab('cadets')}
          >
            <Users size={16} />
            Cadets ({schoolYear.cadets?.length || 0})
          </button>
          <button 
            className={`nav-btn ${activeTab === 'activities' ? 'active' : ''}`}
            onClick={() => setActiveTab('activities')}
          >
            <Calendar size={16} />
            Activities
          </button>
          <button 
            className={`nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={16} />
            Settings
          </button>
        </nav>

        <div className="tab-content">
          {activeTab === 'cadets' && (
            <CadetManagement schoolYear={schoolYear} />
          )}
          
          {activeTab === 'activities' && (
            <div className="activities-section">
              <ActivityConfiguration />
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div className="settings-section">
              <div className="settings-card">
                <h3>School Year Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Year:</label>
                    <span>{schoolYear.name}</span>
                  </div>
                  <div className="info-item">
                    <label>Created:</label>
                    <span>{new Date(schoolYear.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="info-item">
                    <label>Total Cadets:</label>
                    <span>{schoolYear.cadets?.length || 0}</span>
                  </div>
                  <div className="info-item">
                    <label>Status:</label>
                    <span className={schoolYear.isActive ? 'active-status' : 'inactive-status'}>
                      {schoolYear.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="settings-card">
                <h3>Quick Actions</h3>
                <div className="action-buttons">
                  <button 
                    className="btn btn-primary"
                    onClick={handleOpenChainBuilder}
                  >
                    <Command size={16} />
                    Open Chain of Command Builder
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchoolYearManagement;