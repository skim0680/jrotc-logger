import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Plus, Users, FileText, Settings, Download, Upload, Calendar } from 'lucide-react';
import './Dashboard.css';

const Dashboard = ({ onSelectCorps }) => {
  const { corps, addCorps, deleteCorps, exportData, importData } = useData();
  const [showNewCorpsModal, setShowNewCorpsModal] = useState(false);
  const [newCorpsName, setNewCorpsName] = useState('');
  const [newCorpsDescription, setNewCorpsDescription] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');

  const handleCreateCorps = (e) => {
    e.preventDefault();
    if (newCorpsName.trim()) {
      const newCorps = addCorps(newCorpsName.trim(), newCorpsDescription.trim());
      setNewCorpsName('');
      setNewCorpsDescription('');
      setShowNewCorpsModal(false);
      onSelectCorps(newCorps);
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
        <h1>JROTC Corps Management System</h1>
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
        {corps.length === 0 ? (
          <div className="empty-state">
            <Users size={64} className="empty-icon" />
            <h2>Welcome to JROTC Corps Management</h2>
            <p>Get started by creating your first corps. You can then add cadets and manage your chain of command.</p>
            <button 
              className="btn btn-primary btn-large"
              onClick={() => setShowNewCorpsModal(true)}
            >
              <Plus size={20} />
              Make New Corps
            </button>
          </div>
        ) : (
          <>
            <div className="dashboard-toolbar">
              <h2>Your Corps</h2>
              <button 
                className="btn btn-primary"
                onClick={() => setShowNewCorpsModal(true)}
              >
                <Plus size={16} />
                Make New Corps
              </button>
            </div>
            
            <div className="corps-grid">
              {corps.map(corp => (
                <div key={corp.id} className="corps-card">
                  <div className="corps-card-header">
                    <h3>{corp.name}</h3>
                    <button 
                      className="btn btn-danger btn-small"
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete "${corp.name}"?`)) {
                          deleteCorps(corp.id);
                        }
                      }}
                      title="Delete Corps"
                    >
                      ×
                    </button>
                  </div>
                  <p className="corps-description">{corp.description || 'No description'}</p>
                  <div className="corps-stats">
                    <span className="stat">
                      <Users size={14} />
                      {corp.schoolYears?.reduce((total, year) => total + (year.cadets?.length || 0), 0) || 0} Total Cadets
                    </span>
                    <span className="stat">
                      <Calendar size={14} />
                      {corp.schoolYears?.length || 0} School Years
                    </span>
                  </div>
                  <div className="corps-actions">
                    <button 
                      className="btn btn-primary btn-small"
                      onClick={() => onSelectCorps(corp)}
                    >
                      Open Corps
                    </button>
                  </div>
                  <div className="corps-created">
                    Created: {new Date(corp.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* New Corps Modal */}
      {showNewCorpsModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create New Corps</h3>
              <button 
                className="btn btn-ghost"
                onClick={() => setShowNewCorpsModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateCorps} className="modal-content">
              <div className="form-group">
                <label htmlFor="corps-name">Corps Name *</label>
                <input
                  id="corps-name"
                  type="text"
                  value={newCorpsName}
                  onChange={(e) => setNewCorpsName(e.target.value)}
                  placeholder="Enter corps name"
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label htmlFor="corps-description">Description (Optional)</label>
                <textarea
                  id="corps-description"
                  value={newCorpsDescription}
                  onChange={(e) => setNewCorpsDescription(e.target.value)}
                  placeholder="Enter corps description"
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowNewCorpsModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                  disabled={!newCorpsName.trim()}
                >
                  Create Corps
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