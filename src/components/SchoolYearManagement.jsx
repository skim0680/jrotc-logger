import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Plus, Calendar, Users, ChevronRight, Settings } from 'lucide-react';
import './SchoolYearManagement.css';

const SchoolYearManagement = ({ corps, onSelectYear, currentYear }) => {
  const { addSchoolYear, setCurrentSchoolYear } = useData();
  const [showAddYearModal, setShowAddYearModal] = useState(false);
  const [newStartYear, setNewStartYear] = useState(new Date().getFullYear());

  const schoolYears = corps.schoolYears || [];
  const sortedYears = [...schoolYears].sort((a, b) => b.startYear - a.startYear);

  const handleCreateYear = (e) => {
    e.preventDefault();
    const endYear = newStartYear + 1;
    addSchoolYear(corps.id, newStartYear, endYear);
    setShowAddYearModal(false);
  };

  const handleSelectYear = (year) => {
    setCurrentSchoolYear(year);
    onSelectYear(year);
  };

  const getYearStats = (year) => {
    const cadets = year.cadets || [];
    const gradeDistribution = cadets.reduce((acc, cadet) => {
      const grade = cadet.grade || 9;
      acc[grade] = (acc[grade] || 0) + 1;
      return acc;
    }, {});

    return {
      totalCadets: cadets.length,
      gradeDistribution,
      chainOfCommands: year.chainOfCommands?.length || 0,
    };
  };

  return (
    <div className="school-year-management">
      <div className="year-header">
        <h3>School Years</h3>
        <button 
          className="btn btn-primary btn-small"
          onClick={() => setShowAddYearModal(true)}
        >
          <Plus size={14} />
          New Year
        </button>
      </div>

      <div className="year-list">
        {sortedYears.map(year => {
          const stats = getYearStats(year);
          const isActive = year.isActive;
          const isCurrent = currentYear?.id === year.id;
          
          return (
            <div 
              key={year.id} 
              className={`year-item ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}
              onClick={() => handleSelectYear(year)}
            >
              <div className="year-info">
                <div className="year-name">
                  <Calendar size={16} />
                  <span>{year.name}</span>
                  {isActive && <span className="active-badge">Current</span>}
                </div>
                <div className="year-stats">
                  <span className="stat">
                    <Users size={12} />
                    {stats.totalCadets} cadets
                  </span>
                  <span className="grade-breakdown">
                    {Object.entries(stats.gradeDistribution).map(([grade, count]) => (
                      <span key={grade} className="grade-stat">
                        {grade}th: {count}
                      </span>
                    )).slice(0, 2)}
                  </span>
                </div>
              </div>
              {isCurrent && <ChevronRight size={16} className="current-indicator" />}
            </div>
          );
        })}
      </div>

      {schoolYears.length === 0 && (
        <div className="no-years">
          <Calendar size={32} className="empty-icon" />
          <p>No school years found</p>
          <button 
            className="btn btn-primary btn-small"
            onClick={() => setShowAddYearModal(true)}
          >
            Create First Year
          </button>
        </div>
      )}

      {/* Add Year Modal */}
      {showAddYearModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create New School Year</h3>
              <button 
                className="btn btn-ghost"
                onClick={() => setShowAddYearModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateYear} className="modal-content">
              <div className="form-group">
                <label htmlFor="start-year">Starting Year</label>
                <input
                  id="start-year"
                  type="number"
                  value={newStartYear}
                  onChange={(e) => setNewStartYear(parseInt(e.target.value))}
                  min="2020"
                  max="2040"
                  required
                />
                <small>School year will be {newStartYear}-{newStartYear + 1}</small>
              </div>
              
              <div className="promotion-info">
                <h4>What happens when you create a new year:</h4>
                <ul>
                  <li>• Current seniors (12th grade) will graduate and be removed</li>
                  <li>• All other cadets will be promoted to the next grade</li>
                  <li>• AS levels will advance automatically</li>
                  <li>• Previous year's activities will be saved to cadet history</li>
                  <li>• You can add new cadets (typically freshmen) to the new year</li>
                </ul>
              </div>

              <div className="modal-actions">
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddYearModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                >
                  Create New Year
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolYearManagement;