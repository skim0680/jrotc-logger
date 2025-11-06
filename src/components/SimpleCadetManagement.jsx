import React, { useState } from 'react';
import { useData } from '../context/SimpleDataContext';
import { Plus, Edit, Trash2, Search, User, Mail, GraduationCap, Star } from 'lucide-react';

function CadetManagement() {
  const {
    currentSchoolYear,
    addCadet,
    updateCadet,
    deleteCadet,
    availableRanks,
    defaultActivities
  } = useData();

  const [showForm, setShowForm] = useState(false);
  const [editingCadet, setEditingCadet] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    rank: availableRanks[0],
    grade: 9,
    asLevel: 1,
    flight: '',
    email: '',
    activities: [],
    notes: ''
  });

  const cadets = currentSchoolYear?.cadets || [];
  const filteredCadets = cadets.filter(cadet => {
    const searchLower = searchTerm.toLowerCase();
    return (
      cadet.firstName.toLowerCase().includes(searchLower) ||
      cadet.lastName.toLowerCase().includes(searchLower) ||
      cadet.rank.toLowerCase().includes(searchLower) ||
      cadet.grade.toString().includes(searchLower)
    );
  });

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      rank: availableRanks[0],
      grade: 9,
      asLevel: 1,
      flight: '',
      email: '',
      activities: [],
      notes: ''
    });
    setEditingCadet(null);
  };

  const handleAdd = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (cadet) => {
    setFormData({
      firstName: cadet.firstName,
      lastName: cadet.lastName,
      rank: cadet.rank,
      grade: cadet.grade,
      asLevel: cadet.asLevel,
      flight: cadet.flight || '',
      email: cadet.email || '',
      activities: cadet.activities || [],
      notes: cadet.notes || ''
    });
    setEditingCadet(cadet);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      alert('First and last name are required');
      return;
    }

    try {
      if (editingCadet) {
        updateCadet(editingCadet.id, formData);
      } else {
        addCadet(formData);
      }
      
      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error('Error saving cadet:', error);
      alert('Failed to save cadet. Please try again.');
    }
  };

  const handleDelete = (cadet) => {
    if (window.confirm(`Delete ${cadet.firstName} ${cadet.lastName}? This cannot be undone.`)) {
      deleteCadet(cadet.id);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    resetForm();
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cadets</h2>
          <p className="text-gray-600">{cadets.length} total cadets</p>
        </div>
        <button onClick={handleAdd} className="btn btn-primary">
          <Plus size={20} />
          Add Cadet
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search cadets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-10"
          />
        </div>
      </div>

      {/* Cadet List */}
      {filteredCadets.length === 0 ? (
        <div className="text-center py-12">
          <User size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            {cadets.length === 0 ? 'No cadets yet' : 'No cadets match your search'}
          </h3>
          <p className="text-gray-500">
            {cadets.length === 0 ? 'Add your first cadet to get started' : 'Try a different search term'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCadets.map((cadet) => (
            <div key={cadet.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <User size={24} className="text-primary-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {cadet.firstName} {cadet.lastName}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Star size={14} />
                        {cadet.rank}
                      </span>
                      <span className="flex items-center gap-1">
                        <GraduationCap size={14} />
                        Grade {cadet.grade}
                      </span>
                      {cadet.flight && <span>Flight {cadet.flight}</span>}
                    </div>
                    {cadet.email && (
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <Mail size={12} />
                        {cadet.email}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(cadet)}
                    className="btn btn-secondary btn-sm"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(cadet)}
                    className="btn btn-error btn-sm"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              {cadet.activities && cadet.activities.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-600 mb-1">Activities:</p>
                  <div className="flex flex-wrap gap-1">
                    {cadet.activities.slice(0, 3).map((activity, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        {activity}
                      </span>
                    ))}
                    {cadet.activities.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        +{cadet.activities.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold">
                {editingCadet ? 'Edit Cadet' : 'Add New Cadet'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              {/* Name */}
              <div className="form-row mb-4">
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              {/* Rank and Grade */}
              <div className="form-row mb-4">
                <div className="form-group">
                  <label className="form-label">Rank</label>
                  <select
                    value={formData.rank}
                    onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                    className="form-select"
                  >
                    {availableRanks.map((rank) => (
                      <option key={rank} value={rank}>{rank}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Grade</label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: parseInt(e.target.value) })}
                    className="form-select"
                  >
                    {[9, 10, 11, 12].map((grade) => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* AS Level and Flight */}
              <div className="form-row mb-4">
                <div className="form-group">
                  <label className="form-label">AS Level</label>
                  <select
                    value={formData.asLevel}
                    onChange={(e) => setFormData({ ...formData, asLevel: parseInt(e.target.value) })}
                    className="form-select"
                  >
                    {[1, 2, 3, 4].map((level) => (
                      <option key={level} value={level}>AS-{level}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Flight</label>
                  <input
                    type="text"
                    value={formData.flight}
                    onChange={(e) => setFormData({ ...formData, flight: e.target.value })}
                    placeholder="e.g., Alpha, Bravo, Charlie"
                    className="form-input"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="form-group mb-4">
                <label className="form-label">Email (Optional)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="form-input"
                />
              </div>

              {/* Activities */}
              <div className="form-group mb-4">
                <label className="form-label">Activities</label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded p-3">
                  {defaultActivities.map((activity) => (
                    <label key={activity} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.activities.includes(activity)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              activities: [...formData.activities, activity]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              activities: formData.activities.filter(a => a !== activity)
                            });
                          }
                        }}
                        className="rounded"
                      />
                      {activity}
                    </label>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="form-group mb-6">
                <label className="form-label">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                  className="form-textarea"
                  placeholder="Any additional notes about this cadet..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button type="submit" className="btn btn-primary flex-1">
                  {editingCadet ? 'Update Cadet' : 'Add Cadet'}
                </button>
                <button type="button" onClick={handleCancel} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CadetManagement;