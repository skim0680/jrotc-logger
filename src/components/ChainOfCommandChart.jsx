import React, { useState, useCallback } from 'react';
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, KeyboardSensor } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useData } from '../context/DataContext';
import { Plus, Edit, Trash2, User, Save, X, Users } from 'lucide-react';
import PositionCard from './PositionCard';
import CadetAssignment from './CadetAssignment';
import './ChainOfCommandChart.css';

const ChainOfCommandChart = ({ chainOfCommand, corps }) => {
  const { 
    updateChainOfCommand,
    addPosition, 
    updatePosition, 
    deletePosition,
    assignCadetToPosition
  } = useData();

  const [showAddPositionModal, setShowAddPositionModal] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);
  const [showCadetAssignment, setShowCadetAssignment] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [positionForm, setPositionForm] = useState({
    title: '',
    level: 1,
    notes: ''
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const resetForm = () => {
    setPositionForm({
      title: '',
      level: 1,
      notes: ''
    });
  };

  const handleAddPosition = () => {
    setEditingPosition(null);
    resetForm();
    setShowAddPositionModal(true);
  };

  const handleEditPosition = (position) => {
    setEditingPosition(position);
    setPositionForm({
      title: position.title,
      level: position.level,
      notes: position.notes || ''
    });
    setShowAddPositionModal(true);
  };

  const handleSubmitPosition = (e) => {
    e.preventDefault();
    if (positionForm.title.trim()) {
      if (editingPosition) {
        updatePosition({
          ...editingPosition,
          ...positionForm,
          title: positionForm.title.trim()
        });
      } else {
        // Calculate position based on level
        const sameLevel = chainOfCommand.positions.filter(p => p.level === positionForm.level);
        const x = (sameLevel.length * 250) + 50; // Spread positions horizontally
        const y = (positionForm.level - 1) * 150 + 50; // Stack levels vertically
        
        addPosition(
          positionForm.title.trim(),
          positionForm.level,
          x,
          y,
          positionForm.notes
        );
      }
      resetForm();
      setShowAddPositionModal(false);
      setEditingPosition(null);
    }
  };

  const handleDeletePosition = (position) => {
    if (window.confirm(`Are you sure you want to delete the "${position.title}" position?`)) {
      deletePosition(position.id);
    }
  };

  const handleAssignCadet = (position) => {
    setShowCadetAssignment(position);
  };

  const handleCadetAssignment = (cadetId) => {
    if (showCadetAssignment) {
      assignCadetToPosition(showCadetAssignment.id, cadetId);
      setShowCadetAssignment(null);
    }
  };

  const handleDragStart = (event) => {
    const { active } = event;
    const position = chainOfCommand.positions.find(p => p.id === active.id);
    setDraggedItem(position);
  };

  const handleDragEnd = (event) => {
    const { active, delta } = event;
    
    if (delta.x !== 0 || delta.y !== 0) {
      const position = chainOfCommand.positions.find(p => p.id === active.id);
      if (position) {
        updatePosition({
          ...position,
          x: position.x + delta.x,
          y: position.y + delta.y
        });
      }
    }
    
    setDraggedItem(null);
  };

  const positions = chainOfCommand.positions || [];
  const maxLevel = Math.max(...positions.map(p => p.level), 0);

  const getCadetById = (cadetId) => {
    return corps.cadets?.find(c => c.id === cadetId) || null;
  };

  return (
    <div className="chain-of-command-chart">
      <div className="chart-header">
        <div>
          <h2>{chainOfCommand.name}</h2>
          {chainOfCommand.description && (
            <p className="chart-description">{chainOfCommand.description}</p>
          )}
        </div>
        <div className="chart-actions">
          <button className="btn btn-primary" onClick={handleAddPosition}>
            <Plus size={16} />
            Add Position
          </button>
        </div>
      </div>

      <div className="chart-stats">
        <div className="stat-item">
          <span>{positions.length} Positions</span>
        </div>
        <div className="stat-item">
          <span>{positions.filter(p => p.assignedCadet).length} Assigned</span>
        </div>
        <div className="stat-item">
          <span>{maxLevel} Levels</span>
        </div>
      </div>

      {positions.length === 0 ? (
        <div className="empty-chart">
          <Users size={64} className="empty-icon" />
          <h3>No Positions Yet</h3>
          <p>Start building your chain of command by adding positions.</p>
          <button className="btn btn-primary" onClick={handleAddPosition}>
            <Plus size={16} />
            Add First Position
          </button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="chart-container">
            <div className="chart-canvas">
              {positions.map(position => {
                const assignedCadet = position.assignedCadet ? getCadetById(position.assignedCadet) : null;
                return (
                  <PositionCard
                    key={position.id}
                    position={position}
                    assignedCadet={assignedCadet}
                    onEdit={() => handleEditPosition(position)}
                    onDelete={() => handleDeletePosition(position)}
                    onAssignCadet={() => handleAssignCadet(position)}
                  />
                );
              })}
            </div>
          </div>
          
          <DragOverlay>
            {draggedItem && (
              <PositionCard
                position={draggedItem}
                assignedCadet={draggedItem.assignedCadet ? getCadetById(draggedItem.assignedCadet) : null}
                isDragging={true}
              />
            )}
          </DragOverlay>
        </DndContext>
      )}

      {/* Add/Edit Position Modal */}
      {showAddPositionModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingPosition ? 'Edit Position' : 'Add New Position'}</h3>
              <button 
                className="btn btn-ghost"
                onClick={() => {
                  setShowAddPositionModal(false);
                  setEditingPosition(null);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmitPosition} className="modal-content">
              <div className="form-group">
                <label htmlFor="position-title">Position Title *</label>
                <input
                  id="position-title"
                  type="text"
                  value={positionForm.title}
                  onChange={(e) => setPositionForm({...positionForm, title: e.target.value})}
                  placeholder="e.g., Battalion Commander, Company Commander"
                  required
                  autoFocus
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="position-level">Level</label>
                <select
                  id="position-level"
                  value={positionForm.level}
                  onChange={(e) => setPositionForm({...positionForm, level: parseInt(e.target.value)})}
                >
                  {[1, 2, 3, 4, 5].map(level => (
                    <option key={level} value={level}>
                      Level {level} {level === 1 && '(Top)'}
                    </option>
                  ))}
                </select>
                <small>Higher levels appear at the top of the chart</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="position-notes">Notes (Optional)</label>
                <textarea
                  id="position-notes"
                  value={positionForm.notes}
                  onChange={(e) => setPositionForm({...positionForm, notes: e.target.value})}
                  placeholder="Additional notes about this position"
                  rows="3"
                />
              </div>

              <div className="modal-actions">
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddPositionModal(false);
                    setEditingPosition(null);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                  disabled={!positionForm.title.trim()}
                >
                  {editingPosition ? 'Update Position' : 'Add Position'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cadet Assignment Modal */}
      {showCadetAssignment && (
        <CadetAssignment
          position={showCadetAssignment}
          cadets={corps.cadets || []}
          onAssign={handleCadetAssignment}
          onClose={() => setShowCadetAssignment(null)}
          assignedCadet={showCadetAssignment.assignedCadet ? getCadetById(showCadetAssignment.assignedCadet) : null}
        />
      )}
    </div>
  );
};

export default ChainOfCommandChart;