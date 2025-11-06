import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Plus, Edit, Trash2, Search, User, Mail, ChevronDown, ChevronUp, Award } from 'lucide-react';
import ActivitySelector from './ActivitySelector';
import './CadetManagement.css';

const CadetManagement = ({ corps, currentSchoolYear }) => {
  const { addCadet, updateCadet, deleteCadet, availableActivities } = useData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCadet, setEditingCadet] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cadetForm, setCadetForm] = useState({
    firstName: '',
    lastName: '',
    rank: '',
    grade: 9,
    asLevel: 1,
    flight: '',
    email: '',
    notes: '',
    semester1Activities: [],
    semester2Activities: []
  });
  const [expandedCadet, setExpandedCadet] = useState(null);

  const ranks = [
    'Cadet Private',
    'Cadet Private First Class', 
    'Cadet Corporal',
    'Cadet Sergeant',
    'Cadet Staff Sergeant',
    'Cadet Sergeant First Class',
    'Cadet Master Sergeant',
    'Cadet First Sergeant',
    'Cadet Sergeant Major',
    'Cadet Second Lieutenant',
    'Cadet First Lieutenant',
    'Cadet Captain',
    'Cadet Major',
    'Cadet Lieutenant Colonel',
    'Cadet Colonel'
  ];

  const resetForm = () => {
    setCadetForm({
      firstName: '',
      lastName: '',
      rank: '',
      grade: 9,
      asLevel: 1,
      flight: '',
      email: '',
      notes: '',
      semester1Activities: [],
      semester2Activities: []
    });
  };

  const handleAdd = () => {
    setEditingCadet(null);
    resetForm();
    setShowAddModal(true);
  };

  const handleEdit = (cadet) => {
    setEditingCadet(cadet);
    setCadetForm({
      firstName: cadet.firstName || '',
      lastName: cadet.lastName || '',
      rank: cadet.rank || '',
      grade: cadet.grade || 9,
      asLevel: cadet.asLevel || 1,
      flight: cadet.flight || '',
      email: cadet.email || '',
      notes: cadet.notes || '',
      semester1Activities: cadet.semester1Activities || [],
      semester2Activities: cadet.semester2Activities || []
    });
    setShowAddModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cadetForm.firstName.trim() && cadetForm.lastName.trim() && currentSchoolYear) {
      if (editingCadet) {
        updateCadet(currentSchoolYear.id, {
          ...editingCadet,
          ...cadetForm,
          firstName: cadetForm.firstName.trim(),
          lastName: cadetForm.lastName.trim()
        });
      } else {
        addCadet(currentSchoolYear.id, {
          ...cadetForm,
          firstName: cadetForm.firstName.trim(),
          lastName: cadetForm.lastName.trim()
        });
      }
      resetForm();
      setShowAddModal(false);
      setEditingCadet(null);
    }
  };

  const handleDelete = (cadet) => {
    if (window.confirm(`Are you sure you want to delete ${cadet.firstName} ${cadet.lastName}?`)) {
      deleteCadet(currentSchoolYear.id, cadet.id);
    }
  };

  const currentCadets = currentSchoolYear?.cadets || [];
  const filteredCadets = currentCadets.filter(cadet => {
    const fullName = `${cadet.firstName} ${cadet.lastName}`.toLowerCase();
    const rank = (cadet.rank || '').toLowerCase();
    const grade = (cadet.grade || '').toString();
    const flight = (cadet.flight || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || rank.includes(search) || 
           grade.includes(search) || flight.includes(search);
  });

  return (
    <div className="cadet-management">
      <div className="section-header">
        <h2>Cadet Roster</h2>
        <button className="btn btn-primary" onClick={handleAdd}>
          <Plus size={16} />
          Add Cadet
        </button>
      </div>

      <div className="cadet-controls">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search cadets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="cadet-count">
          {filteredCadets.length} of {currentCadets.length} cadets
          {currentSchoolYear && <span className="year-indicator">({currentSchoolYear.name})</span>}
        </div>
      </div>

      {!currentSchoolYear ? (
        <div className="no-school-year">
          <Calendar size={48} className="empty-icon" />
          <h3>No Active School Year</h3>
          <p>Select or create a school year to manage cadets.</p>
        </div>
      ) : filteredCadets.length === 0 ? (
        currentCadets.length === 0 ? (
          <div className="empty-state">
            <User size={48} className="empty-icon" />
            <h3>No Cadets Yet</h3>
            <p>Start building your corps by adding your first cadet.</p>
            <button className="btn btn-primary" onClick={handleAdd}>
              <Plus size={16} />
              Add First Cadet
            </button>
          </div>
        ) : (
          <div className="no-results">
            <p>No cadets match your search.</p>
          </div>
        )
      ) : (
        <div className="cadet-grid">
          {filteredCadets.map(cadet => (
            <div key={cadet.id} className="cadet-card">
              <div className="cadet-header">
                <div className="cadet-name">
                  <h3>{cadet.firstName} {cadet.lastName}</h3>
                  <div className="cadet-badges">
                    {cadet.rank && <span className="cadet-rank">{cadet.rank}</span>}
                    <span className="grade-badge">Grade {cadet.grade || 9}</span>
                    <span className="as-badge">AS-{cadet.asLevel || 1}</span>
                    {cadet.flight && <span className="flight-badge">{cadet.flight}</span>}
                  </div>
                </div>
                <div className="cadet-actions">
                  <button 
                    className="btn btn-ghost btn-small"
                    onClick={() => setExpandedCadet(expandedCadet === cadet.id ? null : cadet.id)}
                    title="View Details"
                  >
                    {expandedCadet === cadet.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  <button 
                    className="btn btn-ghost btn-small"
                    onClick={() => handleEdit(cadet)}
                    title="Edit Cadet"
                  >
                    <Edit size={14} />
                  </button>
                  <button 
                    className="btn btn-danger btn-small"
                    onClick={() => handleDelete(cadet)}
                    title="Delete Cadet"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              
              <div className="cadet-info">
                {cadet.email && (
                  <div className="info-item">
                    <Mail size={14} />
                    <span>{cadet.email}</span>
                  </div>
                )}
              </div>

              {/* Current Year Activities */}
              <div className="current-activities">
                <div className="semester-activities">
                  <div className="semester">
                    <strong>Semester 1:</strong> 
                    {cadet.semester1Activities?.length > 0 ? (
                      <span className="activity-count">{cadet.semester1Activities.length} activities</span>
                    ) : (
                      <span className="no-activities">No activities</span>
                    )}
                  </div>
                  <div className="semester">
                    <strong>Semester 2:</strong>
                    {cadet.semester2Activities?.length > 0 ? (
                      <span className="activity-count">{cadet.semester2Activities.length} activities</span>
                    ) : (
                      <span className="no-activities">No activities</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedCadet === cadet.id && (
                <div className="cadet-expanded">
                  {/* Current Year Activities Detail */}
                  <div className="activities-detail">
                    <h4>Current Year Activities ({currentSchoolYear?.name})</h4>
                    <div className="semester-detail">
                      <div className="semester-section">
                        <h5>Semester 1</h5>
                        {cadet.semester1Activities?.length > 0 ? (
                          <div className="activity-list">
                            {cadet.semester1Activities.map((activity, index) => (
                              <span key={index} className="activity-tag">{activity}</span>
                            ))}
                          </div>
                        ) : (
                          <p className="no-activities-text">No activities recorded</p>
                        )}
                      </div>
                      <div className="semester-section">
                        <h5>Semester 2</h5>
                        {cadet.semester2Activities?.length > 0 ? (
                          <div className="activity-list">
                            {cadet.semester2Activities.map((activity, index) => (
                              <span key={index} className="activity-tag">{activity}</span>
                            ))}
                          </div>
                        ) : (
                          <p className="no-activities-text">No activities recorded</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Yearly History */}
                  {cadet.yearlyHistory && cadet.yearlyHistory.length > 0 && (
                    <div className="yearly-history">
                      <h4>Previous Years</h4>
                      {cadet.yearlyHistory.map((yearRecord, index) => (
                        <div key={index} className="year-record">
                          <div className="year-header">
                            <span className="year-name">{yearRecord.schoolYearName}</span>
                            <div className="year-badges">
                              <span className="grade-badge-small">Grade {yearRecord.grade}</span>
                              <span className="as-badge-small">AS-{yearRecord.asLevel}</span>
                              {yearRecord.flight && <span className="flight-badge-small">{yearRecord.flight}</span>}
                            </div>
                          </div>
                          <div className="year-activities">
                            <div className="semester-history">
                              <div>
                                <strong>Sem 1:</strong>
                                {yearRecord.semester1Activities?.length > 0 ? (
                                  <div className="activity-list-small">
                                    {yearRecord.semester1Activities.map((activity, i) => (
                                      <span key={i} className="activity-tag-small">{activity}</span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="no-activities-small">None</span>
                                )}
                              </div>
                              <div>
                                <strong>Sem 2:</strong>
                                {yearRecord.semester2Activities?.length > 0 ? (
                                  <div className="activity-list-small">
                                    {yearRecord.semester2Activities.map((activity, i) => (
                                      <span key={i} className="activity-tag-small">{activity}</span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="no-activities-small">None</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {cadet.notes && (
                    <div className="cadet-notes">
                      <strong>Notes:</strong> {cadet.notes}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Cadet Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            <div className="modal-header">
              <h3>{editingCadet ? 'Edit Cadet' : 'Add New Cadet'}</h3>
              <button 
                className="btn btn-ghost"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingCadet(null);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-content">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    id="firstName"
                    type="text"
                    value={cadetForm.firstName}
                    onChange={(e) => setCadetForm({...cadetForm, firstName: e.target.value})}
                    required
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    id="lastName"
                    type="text"
                    value={cadetForm.lastName}
                    onChange={(e) => setCadetForm({...cadetForm, lastName: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="rank">Rank</label>
                  <select
                    id="rank"
                    value={cadetForm.rank}
                    onChange={(e) => setCadetForm({...cadetForm, rank: e.target.value})}
                  >
                    <option value="">Select Rank</option>
                    {ranks.map(rank => (
                      <option key={rank} value={rank}>{rank}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="grade">Grade Level</label>
                  <select
                    id="grade"
                    value={cadetForm.grade}
                    onChange={(e) => setCadetForm({...cadetForm, grade: parseInt(e.target.value)})}
                  >
                    <option value="9">9th Grade (Freshman)</option>
                    <option value="10">10th Grade (Sophomore)</option>
                    <option value="11">11th Grade (Junior)</option>
                    <option value="12">12th Grade (Senior)</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="asLevel">AS Level</label>
                  <select
                    id="asLevel"
                    value={cadetForm.asLevel}
                    onChange={(e) => setCadetForm({...cadetForm, asLevel: parseInt(e.target.value)})}
                  >
                    <option value="1">AS-1 (Aerospace Science 1)</option>
                    <option value="2">AS-2 (Aerospace Science 2)</option>
                    <option value="3">AS-3 (Aerospace Science 3)</option>
                    <option value="4">AS-4 (Aerospace Science 4)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="flight">Flight</label>
                  <input
                    id="flight"
                    type="text"
                    value={cadetForm.flight}
                    onChange={(e) => setCadetForm({...cadetForm, flight: e.target.value})}
                    placeholder="e.g., Alpha, Bravo, Charlie"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email (Optional)</label>
                  <input
                    id="email"
                    type="email"
                    value={cadetForm.email}
                    onChange={(e) => setCadetForm({...cadetForm, email: e.target.value})}
                    placeholder="Cadet's email address"
                  />
                </div>
              </div>

              {/* Activity Selectors */}
              <div className="activities-section">
                <h4>Current Year Activities ({currentSchoolYear?.name})</h4>
                <div className="form-row">
                  <ActivitySelector
                    label="Semester 1 Activities"
                    selectedActivities={cadetForm.semester1Activities}
                    availableActivities={availableActivities}
                    onChange={(activities) => setCadetForm({...cadetForm, semester1Activities: activities})}
                    placeholder="Select Semester 1 activities..."
                  />
                  <ActivitySelector
                    label="Semester 2 Activities"
                    selectedActivities={cadetForm.semester2Activities}
                    availableActivities={availableActivities}
                    onChange={(activities) => setCadetForm({...cadetForm, semester2Activities: activities})}
                    placeholder="Select Semester 2 activities..."
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  value={cadetForm.notes}
                  onChange={(e) => setCadetForm({...cadetForm, notes: e.target.value})}
                  placeholder="Additional notes about the cadet"
                  rows="3"
                />
              </div>

              <div className="modal-actions">
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingCadet(null);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                  disabled={!cadetForm.firstName.trim() || !cadetForm.lastName.trim()}
                >
                  {editingCadet ? 'Update Cadet' : 'Add Cadet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CadetManagement;