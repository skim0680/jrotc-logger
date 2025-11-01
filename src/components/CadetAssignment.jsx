import React, { useState } from 'react';
import { Search, User, X } from 'lucide-react';
import './CadetAssignment.css';

const CadetAssignment = ({ position, cadets, onAssign, onClose, assignedCadet }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCadets = cadets.filter(cadet => {
    const fullName = `${cadet.firstName} ${cadet.lastName}`.toLowerCase();
    const rank = (cadet.rank || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || rank.includes(search);
  });

  const handleAssign = (cadetId) => {
    onAssign(cadetId);
  };

  const handleUnassign = () => {
    onAssign(null);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Assign Cadet to {position.title}</h3>
          <button className="btn btn-ghost" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="modal-content">
          {assignedCadet && (
            <div className="current-assignment">
              <h4>Currently Assigned:</h4>
              <div className="assigned-cadet-info">
                <User size={16} />
                <span>{assignedCadet.firstName} {assignedCadet.lastName}</span>
                {assignedCadet.rank && <span className="rank-badge">{assignedCadet.rank}</span>}
                <button 
                  className="btn btn-secondary btn-small"
                  onClick={handleUnassign}
                >
                  <X size={14} />
                  Unassign
                </button>
              </div>
            </div>
          )}

          <div className="cadet-search">
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search cadets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <div className="cadet-list">
            {filteredCadets.length === 0 ? (
              <div className="no-cadets">
                {cadets.length === 0 ? (
                  <p>No cadets available. Add cadets to the corps first.</p>
                ) : (
                  <p>No cadets match your search.</p>
                )}
              </div>
            ) : (
              filteredCadets.map(cadet => (
                <div 
                  key={cadet.id} 
                  className={`cadet-item ${assignedCadet?.id === cadet.id ? 'assigned' : ''}`}
                  onClick={() => handleAssign(cadet.id)}
                >
                  <div className="cadet-info">
                    <User size={16} />
                    <div className="cadet-details">
                      <span className="cadet-name">
                        {cadet.firstName} {cadet.lastName}
                      </span>
                      {cadet.rank && <span className="cadet-rank">{cadet.rank}</span>}
                    </div>
                  </div>
                  {assignedCadet?.id === cadet.id && (
                    <span className="assigned-indicator">Currently Assigned</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CadetAssignment;