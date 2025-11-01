import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { ArrowLeft, Users, Plus, FileText, Edit, Trash2, Search, Calendar, Settings } from 'lucide-react';
import CadetManagement from './CadetManagement';
import ChainOfCommandChart from './ChainOfCommandChart';
import SchoolYearManagement from './SchoolYearManagement';
import ActivityConfiguration from './ActivityConfiguration';
import './CorpsManagement.css';

const CorpsManagement = ({ corps, onBack }) => {
  const { 
    updateCorps, 
    addChainOfCommand, 
    deleteChainOfCommand, 
    setCurrentChainOfCommand,
    currentChainOfCommand,
    currentSchoolYear,
    setCurrentSchoolYear
  } = useData();
  
  const [activeTab, setActiveTab] = useState('cadets');
  const [showNewCoCModal, setShowNewCoCModal] = useState(false);
  const [newCoCName, setNewCoCName] = useState('');
  const [newCoCDescription, setNewCoCDescription] = useState('');
  const [editingCorps, setEditingCorps] = useState(false);
  const [editCorpsName, setEditCorpsName] = useState(corps.name);
  const [editCorpsDescription, setEditCorpsDescription] = useState(corps.description || '');

  useEffect(() => {
    // Set the active school year when corps is loaded
    const activeYear = corps.schoolYears?.find(year => year.isActive) || 
                      corps.schoolYears?.[corps.schoolYears.length - 1];
    if (activeYear) {
      setCurrentSchoolYear(activeYear);
    }

    // Clear current chain of command when leaving
    return () => {
      setCurrentChainOfCommand(null);
    };
  }, [corps, setCurrentChainOfCommand, setCurrentSchoolYear]);

  const handleCreateChainOfCommand = (e) => {
    e.preventDefault();
    if (newCoCName.trim() && currentSchoolYear) {
      const newCoC = addChainOfCommand(corps.id, currentSchoolYear.id, newCoCName.trim(), newCoCDescription.trim());
      setNewCoCName('');
      setNewCoCDescription('');
      setShowNewCoCModal(false);
      setCurrentChainOfCommand(newCoC);
      setActiveTab('chain-of-command');
    }
  };  const handleUpdateCorps = () => {
    const updatedCorps = {
      ...corps,
      name: editCorpsName.trim(),
      description: editCorpsDescription.trim()
    };
    updateCorps(updatedCorps);
    setEditingCorps(false);
  };

  const handleOpenChainOfCommand = (chainOfCommand) => {
    setCurrentChainOfCommand(chainOfCommand);
    setActiveTab('chain-of-command');
  };

  const chainOfCommands = currentSchoolYear?.chainOfCommands || [];
  const cadets = currentSchoolYear?.cadets || [];
  const allSchoolYears = corps.schoolYears || [];

  return (
    <div className="corps-management">
      <header className="corps-header">
        <div className="corps-header-left">
          <button className="btn btn-ghost" onClick={onBack}>
            <ArrowLeft size={20} />
          </button>
          <div className="corps-info">
            {editingCorps ? (
              <div className="corps-edit-form">
                <input
                  type="text"
                  value={editCorpsName}
                  onChange={(e) => setEditCorpsName(e.target.value)}
                  className="corps-name-input"
                />
                <input
                  type="text"
                  value={editCorpsDescription}
                  onChange={(e) => setEditCorpsDescription(e.target.value)}
                  placeholder="Description"
                  className="corps-description-input"
                />
                <div className="edit-actions">
                  <button className="btn btn-primary btn-small" onClick={handleUpdateCorps}>
                    Save
                  </button>
                  <button 
                    className="btn btn-secondary btn-small" 
                    onClick={() => setEditingCorps(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="corps-display">
                <h1>{corps.name}</h1>
                <p className="corps-description">{corps.description || 'No description'}</p>
                <button 
                  className="btn btn-ghost btn-small"
                  onClick={() => setEditingCorps(true)}
                  title="Edit Corps Info"
                >
                  <Edit size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="corps-stats">
          <div className="stat-item">
            <Users size={16} />
            <span>{cadets.length} Cadets</span>
          </div>
          <div className="stat-item">
            <Calendar size={16} />
            <span>{allSchoolYears.length} School Years</span>
          </div>
          <div className="stat-item">
            <FileText size={16} />
            <span>{chainOfCommands.length} Chain of Commands</span>
          </div>
          {currentSchoolYear && (
            <div className="stat-item current-year">
              <span>Current: {currentSchoolYear.name}</span>
            </div>
          )}
        </div>
      </header>

      <div className="corps-content">
        <nav className="corps-nav">
          <button 
            className={`nav-btn ${activeTab === 'school-years' ? 'active' : ''}`}
            onClick={() => setActiveTab('school-years')}
          >
            <Calendar size={16} />
            School Years ({allSchoolYears.length})
          </button>
          <button 
            className={`nav-btn ${activeTab === 'cadets' ? 'active' : ''}`}
            onClick={() => setActiveTab('cadets')}
          >
            <Users size={16} />
            Cadets ({cadets.length})
          </button>
          <button 
            className={`nav-btn ${activeTab === 'chain-of-commands' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('chain-of-commands');
              setCurrentChainOfCommand(null);
            }}
          >
            <FileText size={16} />
            Chain of Commands ({chainOfCommands.length})
          </button>
          <button 
            className={`nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={16} />
            Settings
          </button>
          {currentChainOfCommand && (
            <button 
              className={`nav-btn ${activeTab === 'chain-of-command' ? 'active' : ''}`}
              onClick={() => setActiveTab('chain-of-command')}
            >
              Chart: {currentChainOfCommand.name}
            </button>
          )}
        </nav>

        <div className="corps-main">
          {activeTab === 'school-years' && (
            <SchoolYearManagement 
              corps={corps}
              currentYear={currentSchoolYear}
              onSelectYear={(year) => {
                setCurrentSchoolYear(year);
                setActiveTab('cadets');
              }}
            />
          )}

          {activeTab === 'cadets' && (
            <CadetManagement 
              corps={corps} 
              currentSchoolYear={currentSchoolYear}
            />
          )}

          {activeTab === 'settings' && (
            <ActivityConfiguration />
          )}

          {activeTab === 'chain-of-commands' && (
            <div className="chain-of-commands-list">
              <div className="section-header">
                <h2>Chain of Commands</h2>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowNewCoCModal(true)}
                >
                  <Plus size={16} />
                  New Chain of Command
                </button>
              </div>

              {chainOfCommands.length === 0 ? (
                <div className="empty-state">
                  <FileText size={48} className="empty-icon" />
                  <h3>No Chain of Commands Yet</h3>
                  <p>Create your first chain of command to start organizing your corps structure.</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowNewCoCModal(true)}
                  >
                    <Plus size={16} />
                    Create Chain of Command
                  </button>
                </div>
              ) : (
                <div className="coc-grid">
                  {chainOfCommands.map(coc => (
                    <div key={coc.id} className="coc-card">
                      <div className="coc-card-header">
                        <h3>{coc.name}</h3>
                        <button 
                          className="btn btn-danger btn-small"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete "${coc.name}"?`)) {
                              deleteChainOfCommand(corps.id, currentSchoolYear.id, coc.id);
                            }
                          }}
                          title="Delete Chain of Command"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <p className="coc-description">{coc.description || 'No description'}</p>
                      <div className="coc-stats">
                        <span>{coc.positions?.length || 0} positions</span>
                        <span>Created: {new Date(coc.createdAt).toLocaleDateString()}</span>
                      </div>
                      <button 
                        className="btn btn-primary btn-small"
                        onClick={() => handleOpenChainOfCommand(coc)}
                      >
                        Open Chart
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'chain-of-command' && currentChainOfCommand && (
            <ChainOfCommandChart 
              chainOfCommand={currentChainOfCommand}
              corps={corps}
            />
          )}
        </div>
      </div>

      {/* New Chain of Command Modal */}
      {showNewCoCModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create New Chain of Command</h3>
              <button 
                className="btn btn-ghost"
                onClick={() => setShowNewCoCModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateChainOfCommand} className="modal-content">
              <div className="form-group">
                <label htmlFor="coc-name">Chain of Command Name *</label>
                <input
                  id="coc-name"
                  type="text"
                  value={newCoCName}
                  onChange={(e) => setNewCoCName(e.target.value)}
                  placeholder="e.g., Fall 2024 Structure"
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label htmlFor="coc-description">Description (Optional)</label>
                <textarea
                  id="coc-description"
                  value={newCoCDescription}
                  onChange={(e) => setNewCoCDescription(e.target.value)}
                  placeholder="Enter description"
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowNewCoCModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                  disabled={!newCoCName.trim()}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CorpsManagement;