import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';
import './ActivitySelector.css';

const ActivitySelector = ({ 
  selectedActivities = [], 
  availableActivities = [], 
  onChange, 
  placeholder = "Select activities...",
  label = "Activities"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredActivities = availableActivities.filter(activity =>
    activity.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleActivity = (activity) => {
    const isSelected = selectedActivities.includes(activity);
    let newSelection;
    
    if (isSelected) {
      newSelection = selectedActivities.filter(a => a !== activity);
    } else {
      newSelection = [...selectedActivities, activity];
    }
    
    onChange(newSelection);
  };

  const handleRemoveActivity = (activity) => {
    const newSelection = selectedActivities.filter(a => a !== activity);
    onChange(newSelection);
  };

  return (
    <div className="activity-selector" ref={dropdownRef}>
      <label className="activity-label">{label}</label>
      
      <div className="selector-container">
        <div 
          className={`selector-trigger ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="selected-activities">
            {selectedActivities.length === 0 ? (
              <span className="placeholder">{placeholder}</span>
            ) : (
              <div className="activity-chips">
                {selectedActivities.map(activity => (
                  <span key={activity} className="activity-chip">
                    {activity}
                    <button
                      type="button"
                      className="remove-chip"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveActivity(activity);
                      }}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <ChevronDown 
            size={16} 
            className={`chevron ${isOpen ? 'rotated' : ''}`} 
          />
        </div>

        {isOpen && (
          <div className="selector-dropdown">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
            
            <div className="activity-list">
              {filteredActivities.length === 0 ? (
                <div className="no-results">
                  {searchTerm ? 'No activities match your search' : 'No activities available'}
                </div>
              ) : (
                filteredActivities.map(activity => {
                  const isSelected = selectedActivities.includes(activity);
                  return (
                    <div
                      key={activity}
                      className={`activity-option ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleToggleActivity(activity)}
                    >
                      <div className="activity-text">{activity}</div>
                      {isSelected && <Check size={14} className="check-icon" />}
                    </div>
                  );
                })
              )}
            </div>
            
            <div className="dropdown-footer">
              <span className="selection-count">
                {selectedActivities.length} of {availableActivities.length} selected
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivitySelector;