import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useData } from '../context/DataContext';
import { cocService, cadetService } from '../firebase/services';
import { Users, Crown, Shield, Star, Plus, Save, Undo, Settings } from 'lucide-react';
import './ChainOfCommandBuilder.css';

// AFJROTC Position Templates
const POSITION_TEMPLATES = {
  'Squadron': [
    { rank: 'Cadet Colonel', title: 'Squadron Commander', level: 1, x: 400, y: 50 },
    { rank: 'Cadet Lieutenant Colonel', title: 'Squadron Deputy Commander', level: 2, x: 400, y: 150 },
    { rank: 'Cadet Major', title: 'Squadron Operations Officer', level: 3, x: 200, y: 250 },
    { rank: 'Cadet Major', title: 'Squadron Executive Officer', level: 3, x: 600, y: 250 },
    { rank: 'Cadet Captain', title: 'A Flight Commander', level: 4, x: 100, y: 350 },
    { rank: 'Cadet Captain', title: 'B Flight Commander', level: 4, x: 300, y: 350 },
    { rank: 'Cadet Captain', title: 'C Flight Commander', level: 4, x: 500, y: 350 },
    { rank: 'Cadet Captain', title: 'D Flight Commander', level: 4, x: 700, y: 350 },
    { rank: 'Cadet 1st Lieutenant', title: 'A Flight Deputy', level: 5, x: 100, y: 450 },
    { rank: 'Cadet 1st Lieutenant', title: 'B Flight Deputy', level: 5, x: 300, y: 450 },
    { rank: 'Cadet 1st Lieutenant', title: 'C Flight Deputy', level: 5, x: 500, y: 450 },
    { rank: 'Cadet 1st Lieutenant', title: 'D Flight Deputy', level: 5, x: 700, y: 450 }
  ],
  'Group': [
    { rank: 'Cadet Colonel', title: 'Group Commander', level: 1, x: 400, y: 50 },
    { rank: 'Cadet Lieutenant Colonel', title: 'Group Deputy Commander', level: 2, x: 400, y: 150 },
    { rank: 'Cadet Major', title: 'Squadron A Commander', level: 3, x: 200, y: 300 },
    { rank: 'Cadet Major', title: 'Squadron B Commander', level: 3, x: 600, y: 300 },
    { rank: 'Cadet Captain', title: 'Squadron A Deputy', level: 4, x: 200, y: 400 },
    { rank: 'Cadet Captain', title: 'Squadron B Deputy', level: 4, x: 600, y: 400 }
  ]
};

const PositionCard = ({ position, cadet, onDrop, onRemove, isDragging }) => {
  const getRankIcon = (rank) => {
    if (rank?.includes('Colonel')) return <Crown size={16} />;
    if (rank?.includes('Major')) return <Shield size={16} />;
    if (rank?.includes('Captain')) return <Star size={16} />;
    return <Users size={16} />;
  };

  return (
    <div 
      className={`position-card ${cadet ? 'filled' : 'empty'} ${isDragging ? 'dragging' : ''}`}
      style={{ 
        position: 'absolute', 
        left: position.x, 
        top: position.y,
        transform: isDragging ? 'rotate(5deg) scale(1.05)' : 'none'
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const cadetData = JSON.parse(e.dataTransfer.getData('application/json'));
        onDrop(position.id, cadetData);
      }}
    >
      <div className="position-header">
        {getRankIcon(position.rank)}
        <span className="position-rank">{position.rank}</span>
      </div>
      <div className="position-title">{position.title}</div>
      
      {cadet ? (
        <div className="assigned-cadet">
          <div className="cadet-info">
            <strong>{cadet.firstName} {cadet.lastName}</strong>
            <span className="cadet-details">
              Grade {cadet.grade} | AS-{cadet.asLevel} | Flight {cadet.flight}
            </span>
          </div>
          <button 
            className="remove-btn"
            onClick={() => onRemove(position.id)}
            title="Remove from position"
          >
            ×
          </button>
        </div>
      ) : (
        <div className="empty-position">
          <Users size={24} className="empty-icon" />
          <span>Drag cadet here</span>
        </div>
      )}
    </div>
  );
};

const CadetDragItem = ({ cadet, isAssigned }) => {
  return (
    <div 
      className={`cadet-drag-item ${isAssigned ? 'assigned' : 'available'}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('application/json', JSON.stringify(cadet));
      }}
    >
      <div className="cadet-avatar">
        {cadet.firstName?.charAt(0)}{cadet.lastName?.charAt(0)}
      </div>
      <div className="cadet-details">
        <strong>{cadet.firstName} {cadet.lastName}</strong>
        <span>Grade {cadet.grade} | AS-{cadet.asLevel} | Flight {cadet.flight}</span>
        {isAssigned && <span className="assigned-badge">Assigned</span>}
      </div>
    </div>
  );
};

const ChainOfCommandBuilder = ({ schoolYear, onBack }) => {
  const { getCurrentYearCadets } = useData();
  const [positions, setPositions] = useState([]);
  const [cadets, setCadets] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('Squadron');
  const [isDragging, setIsDragging] = useState(false);
  const [draggedCadet, setDraggedCadet] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on component mount
  useEffect(() => {
    loadChainOfCommand();
    loadCadets();
  }, [schoolYear]);

  const loadChainOfCommand = async () => {
    try {
      const cocData = await cocService.getBySchoolYear(schoolYear.id);
      if (cocData.length === 0) {
        // Initialize with template
        initializeFromTemplate(selectedTemplate);
      } else {
        setPositions(cocData);
      }
    } catch (error) {
      console.error('Error loading chain of command:', error);
      // Fallback to template
      initializeFromTemplate(selectedTemplate);
    }
    setIsLoading(false);
  };

  const loadCadets = async () => {
    try {
      const cadetData = await cadetService.getBySchoolYear(schoolYear.id);
      setCadets(cadetData);
    } catch (error) {
      console.error('Error loading cadets:', error);
      // Fallback to local data
      setCadets(getCurrentYearCadets());
    }
  };

  const initializeFromTemplate = (templateName) => {
    const template = POSITION_TEMPLATES[templateName] || POSITION_TEMPLATES['Squadron'];
    const newPositions = template.map((pos, index) => ({
      id: `pos-${index}`,
      ...pos,
      schoolYearId: schoolYear.id,
      assignedCadetId: null
    }));
    setPositions(newPositions);
    setHasChanges(true);
  };

  const handleDragStart = (cadet) => {
    setIsDragging(true);
    setDraggedCadet(cadet);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedCadet(null);
  };

  const handleAssignCadet = async (positionId, cadet) => {
    try {
      // Remove cadet from any existing position
      const updatedPositions = positions.map(pos => ({
        ...pos,
        assignedCadetId: pos.assignedCadetId === cadet.id ? null : pos.assignedCadetId
      }));

      // Assign to new position
      const newPositions = updatedPositions.map(pos => 
        pos.id === positionId 
          ? { ...pos, assignedCadetId: cadet.id }
          : pos
      );

      setPositions(newPositions);
      setHasChanges(true);

      // Save to Firebase
      await cocService.assignCadet(positionId, cadet.id, 'current-user'); // Replace with actual user
    } catch (error) {
      console.error('Error assigning cadet:', error);
    }
  };

  const handleRemoveCadet = async (positionId) => {
    try {
      const newPositions = positions.map(pos => 
        pos.id === positionId 
          ? { ...pos, assignedCadetId: null }
          : pos
      );

      setPositions(newPositions);
      setHasChanges(true);

      // Save to Firebase
      await cocService.removeCadet(positionId);
    } catch (error) {
      console.error('Error removing cadet:', error);
    }
  };

  const handleSaveChanges = async () => {
    try {
      setIsLoading(true);
      
      // Save all positions to Firebase
      for (const position of positions) {
        await cocService.upsertPosition(position);
      }
      
      setHasChanges(false);
      alert('Chain of Command saved successfully!');
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Error saving changes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getAssignedCadets = () => {
    return positions
      .filter(pos => pos.assignedCadetId)
      .map(pos => pos.assignedCadetId);
  };

  const getCadetById = (id) => {
    return cadets.find(c => c.id === id);
  };

  if (isLoading) {
    return (
      <div className="coc-builder loading">
        <div className="loading-spinner">
          <Users size={48} />
          <p>Loading Chain of Command...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="coc-builder">
      <header className="coc-header">
        <div className="coc-header-left">
          <button className="btn btn-secondary" onClick={onBack}>
            ← Back
          </button>
          <div>
            <h1>Chain of Command Builder</h1>
            <p>AFJROTC Unit CA-882 - {schoolYear.name}</p>
          </div>
        </div>
        <div className="coc-header-actions">
          <select 
            value={selectedTemplate} 
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="template-select"
          >
            <option value="Squadron">Squadron Structure</option>
            <option value="Group">Group Structure</option>
          </select>
          <button 
            className="btn btn-secondary"
            onClick={() => initializeFromTemplate(selectedTemplate)}
          >
            <Settings size={16} />
            Reset Template
          </button>
          {hasChanges && (
            <button 
              className="btn btn-primary"
              onClick={handleSaveChanges}
              disabled={isLoading}
            >
              <Save size={16} />
              Save Changes
            </button>
          )}
        </div>
      </header>

      <div className="coc-content">
        <div className="cadets-panel">
          <h3>Available Cadets</h3>
          <div className="cadets-list">
            {cadets
              .filter(cadet => !getAssignedCadets().includes(cadet.id))
              .map(cadet => (
                <CadetDragItem 
                  key={cadet.id} 
                  cadet={cadet} 
                  isAssigned={false}
                />
              ))
            }
          </div>

          <h3>Assigned Cadets</h3>
          <div className="cadets-list">
            {cadets
              .filter(cadet => getAssignedCadets().includes(cadet.id))
              .map(cadet => (
                <CadetDragItem 
                  key={cadet.id} 
                  cadet={cadet} 
                  isAssigned={true}
                />
              ))
            }
          </div>
        </div>

        <div className="org-chart">
          <div className="chart-container">
            {positions.map(position => (
              <PositionCard
                key={position.id}
                position={position}
                cadet={getCadetById(position.assignedCadetId)}
                onDrop={handleAssignCadet}
                onRemove={handleRemoveCadet}
                isDragging={isDragging && draggedCadet?.id === position.assignedCadetId}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChainOfCommandBuilder;