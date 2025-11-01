import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Plus, Edit, Trash2, Settings, Save, X } from 'lucide-react';
import './ActivityConfiguration.css';

const ActivityConfiguration = () => {
  const { availableActivities, updateAvailableActivities } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [activities, setActivities] = useState([...availableActivities]);
  const [newActivity, setNewActivity] = useState('');

  const handleSave = () => {
    updateAvailableActivities(activities.filter(activity => activity.trim()));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setActivities([...availableActivities]);
    setNewActivity('');
    setIsEditing(false);
  };

  const handleAddActivity = () => {
    if (newActivity.trim()) {
      setActivities([...activities, newActivity.trim()]);
      setNewActivity('');
    }
  };

  const handleRemoveActivity = (index) => {
    setActivities(activities.filter((_, i) => i !== index));
  };

  const handleEditActivity = (index, value) => {
    const updated = [...activities];
    updated[index] = value;
    setActivities(updated);
  };

  const categorizedActivities = {
    'Leadership & Drill': activities.filter(a => 
      a.includes('Drill') || a.includes('Honor Guard') || a.includes('Color Guard') || 
      a.includes('Leadership') || a.includes('Commander')
    ),
    'Academic & Competition': activities.filter(a => 
      a.includes('Academic') || a.includes('CyberPatriot') || a.includes('Competition') || 
      a.includes('StellarXplorers') || a.includes('Orienteering')
    ),
    'Community Service & Events': activities.filter(a => 
      a.includes('Community') || a.includes('Veterans') || a.includes('Memorial') || 
      a.includes('Ceremony') || a.includes('Flag Detail') || a.includes('Funeral')
    ),
    'Physical Fitness & Recreation': activities.filter(a => 
      a.includes('Physical') || a.includes('Fitness') || a.includes('Sports') || 
      a.includes('Hiking') || a.includes('Recreation')
    ),
    'Career & Education': activities.filter(a => 
      a.includes('Career') || a.includes('College') || a.includes('Job') || 
      a.includes('STEM') || a.includes('Aerospace')
    ),
    'Special Programs': activities.filter(a => 
      a.includes('Summer') || a.includes('Encampment') || a.includes('Model') || 
      a.includes('Ground School') || a.includes('Emergency')
    )
  };

  // Get activities that don't fit into categories
  const categorizedActivityList = Object.values(categorizedActivities).flat();
  const otherActivities = activities.filter(a => !categorizedActivityList.includes(a));

  return (
    <div className="activity-configuration">
      <div className="config-header">
        <div>
          <h3>Activity Configuration</h3>
          <p>Manage the list of activities that can be assigned to cadets</p>
        </div>
        <div className="config-actions">
          {isEditing ? (
            <>
              <button className="btn btn-secondary btn-small" onClick={handleCancel}>
                <X size={14} />
                Cancel
              </button>
              <button className="btn btn-primary btn-small" onClick={handleSave}>
                <Save size={14} />
                Save Changes
              </button>
            </>
          ) : (
            <button 
              className="btn btn-primary btn-small" 
              onClick={() => setIsEditing(true)}
            >
              <Edit size={14} />
              Edit Activities
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="editing-mode">
          <div className="add-activity">
            <div className="add-activity-form">
              <input
                type="text"
                value={newActivity}
                onChange={(e) => setNewActivity(e.target.value)}
                placeholder="Enter new activity name"
                onKeyPress={(e) => e.key === 'Enter' && handleAddActivity()}
              />
              <button 
                className="btn btn-primary btn-small"
                onClick={handleAddActivity}
                disabled={!newActivity.trim()}
              >
                <Plus size={14} />
                Add
              </button>
            </div>
          </div>

          <div className="activity-list-edit">
            <h4>All Activities ({activities.length})</h4>
            <div className="activities-grid">
              {activities.map((activity, index) => (
                <div key={index} className="activity-item-edit">
                  <input
                    type="text"
                    value={activity}
                    onChange={(e) => handleEditActivity(index, e.target.value)}
                    className="activity-input"
                  />
                  <button
                    className="btn btn-danger btn-small"
                    onClick={() => handleRemoveActivity(index)}
                    title="Remove Activity"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="viewing-mode">
          <div className="activity-stats">
            <div className="stat-item">
              <span className="stat-number">{availableActivities.length}</span>
              <span className="stat-label">Total Activities</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{Object.keys(categorizedActivities).length}</span>
              <span className="stat-label">Categories</span>
            </div>
          </div>

          <div className="activity-categories">
            {Object.entries(categorizedActivities).map(([category, categoryActivities]) => (
              categoryActivities.length > 0 && (
                <div key={category} className="activity-category">
                  <h4>{category} ({categoryActivities.length})</h4>
                  <div className="activity-tags">
                    {categoryActivities.map((activity, index) => (
                      <span key={index} className="activity-tag">
                        {activity}
                      </span>
                    ))}
                  </div>
                </div>
              )
            ))}
            
            {otherActivities.length > 0 && (
              <div className="activity-category">
                <h4>Other Activities ({otherActivities.length})</h4>
                <div className="activity-tags">
                  {otherActivities.map((activity, index) => (
                    <span key={index} className="activity-tag">
                      {activity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityConfiguration;