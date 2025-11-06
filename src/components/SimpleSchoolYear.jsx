import React, { useState } from 'react';
import { useData } from '../context/SimpleDataContext';
import { Plus, Calendar, Users, Target, Settings, ChevronRight, Trash2 } from 'lucide-react';
import CadetManagement from './SimpleCadetManagement';
import ChainOfCommandBuilder from './SimpleChainOfCommand';

function SchoolYearManagement() {
  const {
    schoolYears,
    currentSchoolYear,
    setCurrentSchoolYear,
    createSchoolYear,
    deleteSchoolYear,
    cadetCount
  } = useData();

  const [activeTab, setActiveTab] = useState('cadets');
  const [showNewYearForm, setShowNewYearForm] = useState(false);
  const [newYearName, setNewYearName] = useState('');

  const handleCreateYear = (e) => {
    e.preventDefault();
    if (newYearName.trim()) {
      const newYear = createSchoolYear(newYearName);
      setCurrentSchoolYear(newYear);
      setNewYearName('');
      setShowNewYearForm(false);
    }
  };

  const handleDeleteYear = (year) => {
    if (window.confirm(`Delete ${year.name}? This cannot be undone.`)) {
      deleteSchoolYear(year.id);
    }
  };

  // Show school year selection if no current year
  if (!currentSchoolYear) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="page-header rounded-xl mb-8">
          <div className="text-center py-12">
            <Calendar size={64} className="mx-auto mb-4 opacity-90" />
            <h1 className="page-title">AFJROTC Unit CA-882</h1>
            <p className="page-subtitle">Select or create a school year to get started</p>
          </div>
        </div>

        {/* Existing School Years */}
        {schoolYears.length > 0 && (
          <div className="card mb-8">
            <div className="card-header">
              <h2 className="text-xl font-semibold">Existing School Years</h2>
            </div>
            <div className="card-body p-0">
              {schoolYears.map((year) => (
                <div key={year.id} className="flex items-center justify-between p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                  <button
                    onClick={() => setCurrentSchoolYear(year)}
                    className="flex items-center gap-4 flex-1 text-left"
                  >
                    <Calendar size={24} className="text-primary-500" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{year.name}</h3>
                      <p className="text-sm text-gray-500">
                        {year.cadets?.length || 0} cadets • Created {new Date(year.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <ChevronRight size={20} className="text-gray-400" />
                  </button>
                  <button
                    onClick={() => handleDeleteYear(year)}
                    className="btn btn-error btn-sm ml-4"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create New Year */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold">Create New School Year</h2>
          </div>
          <div className="card-body">
            {showNewYearForm ? (
              <form onSubmit={handleCreateYear} className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={newYearName}
                    onChange={(e) => setNewYearName(e.target.value)}
                    placeholder="e.g., 2024-2025 School Year"
                    className="form-input"
                    autoFocus
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewYearForm(false);
                    setNewYearName('');
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <button
                onClick={() => setShowNewYearForm(true)}
                className="btn btn-primary"
              >
                <Plus size={20} />
                Create School Year
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main management interface
  const tabs = [
    { id: 'cadets', label: 'Cadets', icon: Users, count: cadetCount },
    { id: 'chain', label: 'Chain of Command', icon: Target },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{currentSchoolYear.name}</h1>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <Users size={16} />
                  {cadetCount} cadets
                </span>
                <span className="flex items-center gap-2">
                  <Calendar size={16} />
                  Created {new Date(currentSchoolYear.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <button
              onClick={() => setCurrentSchoolYear(null)}
              className="btn btn-secondary"
            >
              Switch Year
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-primary-500 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
            {tab.count !== undefined && (
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                activeTab === tab.id ? 'bg-white text-primary-500' : 'bg-gray-200 text-gray-600'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="card">
        <div className="card-body p-0">
          {activeTab === 'cadets' && <CadetManagement />}
          {activeTab === 'chain' && <ChainOfCommandBuilder />}
          {activeTab === 'settings' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">School Year Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Delete School Year</h4>
                    <p className="text-sm text-gray-600">Permanently delete this school year and all its data</p>
                  </div>
                  <button
                    onClick={() => handleDeleteYear(currentSchoolYear)}
                    className="btn btn-error"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SchoolYearManagement;