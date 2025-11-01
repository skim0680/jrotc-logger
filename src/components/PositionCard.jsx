import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Edit, Trash2, User, UserPlus } from 'lucide-react';
import './PositionCard.css';

const PositionCard = ({ 
  position, 
  assignedCadet, 
  onEdit, 
  onDelete, 
  onAssignCadet,
  isDragging = false
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isDragActive,
  } = useDraggable({
    id: position.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : {
    transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`position-card ${isDragActive || isDragging ? 'dragging' : ''} level-${position.level}`}
      {...listeners}
      {...attributes}
    >
      <div className="position-header">
        <div className="position-info">
          <h4 className="position-title">{position.title}</h4>
          <span className="position-level">Level {position.level}</span>
        </div>
        <div className="position-actions">
          <button
            className="btn btn-ghost btn-small"
            onClick={(e) => {
              e.stopPropagation();
              onEdit && onEdit();
            }}
            title="Edit Position"
          >
            <Edit size={12} />
          </button>
          <button
            className="btn btn-danger btn-small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete && onDelete();
            }}
            title="Delete Position"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      <div className="cadet-assignment">
        {assignedCadet ? (
          <div className="assigned-cadet">
            <User size={16} />
            <div className="cadet-details">
              <span className="cadet-name">
                {assignedCadet.firstName} {assignedCadet.lastName}
              </span>
              {assignedCadet.rank && (
                <span className="cadet-rank">{assignedCadet.rank}</span>
              )}
            </div>
          </div>
        ) : (
          <div className="unassigned">
            <UserPlus size={16} />
            <span>Unassigned</span>
          </div>
        )}
        
        <button
          className="btn btn-secondary btn-small assign-btn"
          onClick={(e) => {
            e.stopPropagation();
            onAssignCadet && onAssignCadet();
          }}
          title={assignedCadet ? "Change Assignment" : "Assign Cadet"}
        >
          {assignedCadet ? "Change" : "Assign"}
        </button>
      </div>

      {position.notes && (
        <div className="position-notes">
          {position.notes}
        </div>
      )}
    </div>
  );
};

export default PositionCard;