import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Plus, Users, FileText, Settings, Download, Upload, Calendar, Award } from 'lucide-react';
import './Dashboard.css';

const Dashboard = ({ onSelectSchoolYear }) => {
  const { schoolYears, addSchoolYear, deleteSchoolYear, exportData, importData } = useData();
  const [showNewYearModal, setShowNewYearModal] = useState(false);
  const [newYearName, setNewYearName] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');

  const handleCreateSchoolYear = (e) => {
    e.preventDefault();
    if (newYearName.trim()) {
      const newYear = addSchoolYear(newYearName.trim());
      setNewYearName('');
      setShowNewYearModal(false);
      onSelectSchoolYear(newYear);
    }
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jrotc-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (importData(importText)) {
      setImportText('');
      setShowImportModal(false);
      alert('Data imported successfully!');
    } else {
      alert('Error importing data. Please check the format.');
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="unit-info">
          <Award size={32} className="unit-badge" />
          <div>
            <h1>AFJROTC Unit CA-882</h1>
            <p className="unit-subtitle">Cadet Management System</p>
          </div>
        </div>
        <div className="dashboard-actions">
          <button 
            className="btn btn-secondary"
            onClick={handleExport}
            title="Export Data"
          >
            <Download size={16} />
            Export
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => setShowImportModal(true)}
            title="Import Data"
          >
            <Upload size={16} />
            Import
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        {schoolYears.length === 0 ? (
          <div className="empty-state">
            <Calendar size={64} className="empty-icon" />
            <h2>Welcome to AFJROTC CA-882</h2>
            <p>Get started by creating your first school year. You can then add cadets and manage your chain of command.</p>
            <button 
              className="btn btn-primary btn-large"
              onClick={() => setShowNewYearModal(true)}
            >
              <Plus size={20} />
              Create School Year
            </button>
          </div>
        ) : (
          <>
            <div className="dashboard-toolbar">
              <h2>School Years</h2>
              <button 
                className="btn btn-primary"
                onClick={() => setShowNewYearModal(true)}
              >
                <Plus size={16} />
                Create School Year
              </button>
            </div>
            
            <div className="corps-grid">
              {schoolYears.map(year => (
                <div key={year.id} className="corps-card">
                  <div className="corps-card-header">
                    <h3>{year.name}</h3>
                    <button 
                      className="btn btn-danger btn-small"
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete "${year.name}"?`)) {
                          deleteSchoolYear(year.id);
                        }
                      }}
                      title="Delete School Year"
                    >
                      ×
                    </button>
                  </div>
                  <p className="corps-description">Academic Year {year.name}</p>
                  <div className="corps-stats">
                    <span className="stat">
                      <Users size={14} />
                      {year.cadets?.length || 0} Cadets
                    </span>
                    <span className="stat">
                      <Calendar size={14} />
                      {year.semesters?.length || 2} Semesters
                    </span>
                  </div>
                  <div className="corps-actions">
                    <button 
                      className="btn btn-primary btn-small"
                      onClick={() => onSelectSchoolYear(year)}
                    >
                      Manage Year
                    </button>
                  </div>
                  <div className="corps-created">
                    Created: {new Date(year.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* New School Year Modal */}
      {showNewYearModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create New School Year</h3>
              <button 
                className="btn btn-ghost"
                onClick={() => setShowNewYearModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateSchoolYear} className="modal-content">
              <div className="form-group">
                <label htmlFor="year-name">School Year *</label>
                <input
                  id="year-name"
                  type="text"
                  value={newYearName}
                  onChange={(e) => setNewYearName(e.target.value)}
                  placeholder="e.g. 2024-2025"
                  required
                  autoFocus
                />
              </div>
              <p className="help-text">
                This will create a new academic year for AFJROTC Unit CA-882. 
                You can add cadets, manage activities, and build your chain of command.
              </p>
              <div className="modal-actions">
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowNewYearModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                  disabled={!newYearName.trim()}
                >
                  Create School Year
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Import Data</h3>
              <button 
                className="btn btn-ghost"
                onClick={() => setShowImportModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label htmlFor="import-text">Paste JSON Data</label>
                <textarea
                  id="import-text"
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Paste your exported JSON data here..."
                  rows="10"
                />
              </div>
              <div className="modal-actions">
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowImportModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  className="btn btn-primary"
                  onClick={handleImport}
                  disabled={!importText.trim()}
                >
                  Import Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;