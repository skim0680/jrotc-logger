import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useData } from '../context/DataContext';
import { cocService, cadetService } from '../firebase/services';
import { Users, Crown, Shield, Star, Plus, Save, Undo, Settings, Edit, Trash2 } from 'lucide-react';
import './ChainOfCommandBuilder.css';

// AFJROTC Position Templates
const POSITION_TEMPLATES = {
  'Squadron': [
    // Top Level - Corps Commander
    { rank: 'Cadet Colonel', title: 'Corps Commander (CC)', level: 1, x: 400, y: 50 },
    
    // Second Level - Deputy Commanders  
    { rank: 'Cadet Lieutenant Colonel', title: 'Deputy Commander (DFC)', level: 2, x: 250, y: 150 },
    { rank: 'Cadet Major', title: 'Operations Squadron Officer (OPSO)', level: 2, x: 550, y: 150 },
    
    // Third Level - Staff Officers
    { rank: 'Cadet Captain', title: 'Drill and Ceremonies Officer (DCO)', level: 3, x: 100, y: 250 },
    { rank: 'Cadet Captain', title: 'Logistics Officer (LO)', level: 3, x: 300, y: 250 },
    { rank: 'Cadet Captain', title: 'Technology Officer (TO)', level: 3, x: 500, y: 250 },
    { rank: 'Cadet Captain', title: 'Services Officer (SO)', level: 3, x: 700, y: 250 },
    
    // Fourth Level - Flight Commanders (4 positions)
    { rank: 'Cadet Captain', title: 'Flight Commander 1 (FC1)', level: 4, x: 150, y: 350 },
    { rank: 'Cadet Captain', title: 'Flight Commander 2 (FC2)', level: 4, x: 300, y: 350 },
    { rank: 'Cadet Captain', title: 'Flight Commander 3 (FC3)', level: 4, x: 450, y: 350 },
    { rank: 'Cadet Captain', title: 'Flight Commander 4 (FC4)', level: 4, x: 600, y: 350 },
    
    // Fifth Level - Special Positions
    { rank: 'Cadet 2nd Lieutenant', title: 'RTC Instructor 1', level: 5, x: 100, y: 450 },
    { rank: 'Cadet 2nd Lieutenant', title: 'RTC Instructor 2', level: 5, x: 250, y: 450 },
    { rank: 'Cadet 1st Lieutenant', title: 'LOS Officer', level: 5, x: 400, y: 450 },
    { rank: 'Cadet 2nd Lieutenant', title: 'JC/SXC Officer 1', level: 5, x: 550, y: 450 },
    { rank: 'Cadet 2nd Lieutenant', title: 'JC/SXC Officer 2', level: 5, x: 700, y: 450 },
    
    // Sixth Level - Additional Positions
    { rank: 'Cadet Staff Sergeant', title: 'KHAS VP', level: 6, x: 300, y: 550 },
    { rank: 'Cadet Staff Sergeant', title: 'MWR Chairman', level: 6, x: 500, y: 550 }
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

const PositionCard = ({ position, cadets = [], onDrop, onRemove, onEdit, onDelete, isDragging, isEditing, onSaveEdit }) => {
  const [editTitle, setEditTitle] = useState(position.title);
  const [editRank, setEditRank] = useState(position.rank);

  const getRankIcon = (rank) => {
    if (rank?.includes('Colonel')) return <Crown size={16} />;
    if (rank?.includes('Major')) return <Shield size={16} />;
    if (rank?.includes('Captain')) return <Star size={16} />;
    if (rank?.includes('Lieutenant')) return <Star size={14} />;
    if (rank?.includes('Sergeant')) return <Shield size={14} />;
    return <Users size={16} />;
  };

  const getRankColor = (rank) => {
    if (rank?.includes('Colonel')) return '#dc2626';
    if (rank?.includes('Major')) return '#ea580c';
    if (rank?.includes('Captain')) return '#2563eb';
    if (rank?.includes('Lieutenant')) return '#7c3aed';
    if (rank?.includes('Sergeant')) return '#059669';
    return '#6b7280';
  };

  const handleSaveEdit = () => {
    onSaveEdit(position.id, { title: editTitle, rank: editRank });
  };

  // Calculate dynamic height based on number of cadets
  const baseHeight = 120;
  const cadetHeight = 45;
  const dynamicHeight = baseHeight + (Math.max(0, cadets.length - 1) * cadetHeight);

  return (
    <div 
      className={`position-card ${cadets.length > 0 ? 'filled' : 'empty'} ${isDragging ? 'dragging' : ''} ${isEditing ? 'editing' : ''}`}
      style={{ 
        position: 'absolute', 
        left: position.x, 
        top: position.y,
        minHeight: `${dynamicHeight}px`,
        transform: isDragging ? 'rotate(2deg) scale(1.02)' : 'none',
        zIndex: isEditing ? 1000 : 1
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const cadetData = JSON.parse(e.dataTransfer.getData('application/json'));
        onDrop(position.id, cadetData);
      }}
    >
      <div className="position-header" style={{ borderColor: getRankColor(position.rank) }}>
        <div className="position-controls">
          {getRankIcon(position.rank)}
          {isEditing ? (
            <div className="edit-controls">
              <input 
                value={editRank}
                onChange={(e) => setEditRank(e.target.value)}
                className="rank-input"
                placeholder="Rank"
              />
              <button onClick={handleSaveEdit} className="save-btn">✓</button>
            </div>
          ) : (
            <span className="position-rank" style={{ color: getRankColor(position.rank) }}>
              {position.rank}
            </span>
          )}
        </div>
        <div className="position-actions">
          <button 
            className="edit-position-btn"
            onClick={() => onEdit(position.id)}
            title="Edit position"
          >
            <Edit size={12} />
          </button>
          <button 
            className="delete-position-btn"
            onClick={() => onDelete(position.id)}
            title="Delete position"
          >
            ×
          </button>
        </div>
      </div>
      
      <div className="position-title-section">
        {isEditing ? (
          <input 
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="title-input"
            placeholder="Position Title"
          />
        ) : (
          <div className="position-title">{position.title}</div>
        )}
      </div>
      
      <div className="cadets-container">
        {cadets.length > 0 ? (
          cadets.map((cadet, index) => (
            <div key={`${cadet.id}-${index}`} className="assigned-cadet">
              <div className="cadet-info">
                <strong>{cadet.firstName} {cadet.lastName}</strong>
                <span className="cadet-details">
                  Grade {cadet.grade} | AS-{cadet.asLevel} | Flight {cadet.flight}
                </span>
              </div>
              <button 
                className="remove-cadet-btn"
                onClick={() => onRemove(position.id, cadet.id)}
                title="Remove from position"
              >
                ×
              </button>
            </div>
          ))
        ) : (
          <div className="empty-position">
            <Users size={24} className="empty-icon" />
            <span>Drag cadets here</span>
            <small>Multiple cadets allowed</small>
          </div>
        )}
      </div>
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
  const [editingPosition, setEditingPosition] = useState(null);
  const [showAddPosition, setShowAddPosition] = useState(false);
  const [newPositionData, setNewPositionData] = useState({
    title: '',
    rank: '',
    x: 400,
    y: 300
  });

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
      assignedCadets: [] // Changed to array
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
      // Remove cadet from any existing position first
      let updatedPositions = positions.map(pos => ({
        ...pos,
        assignedCadets: pos.assignedCadets?.filter(c => c.id !== cadet.id) || []
      }));

      // Add cadet to new position
      updatedPositions = updatedPositions.map(pos => 
        pos.id === positionId 
          ? { ...pos, assignedCadets: [...(pos.assignedCadets || []), cadet] }
          : pos
      );

      setPositions(updatedPositions);
      setHasChanges(true);

      // Save to Firebase
      await cocService.assignCadet(positionId, cadet.id, 'current-user');
    } catch (error) {
      console.error('Error assigning cadet:', error);
    }
  };

  const handleRemoveCadet = async (positionId, cadetId) => {
    try {
      const newPositions = positions.map(pos => 
        pos.id === positionId 
          ? { 
              ...pos, 
              assignedCadets: pos.assignedCadets?.filter(c => c.id !== cadetId) || []
            }
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

  const handleEditPosition = (positionId) => {
    setEditingPosition(positionId);
  };

  const handleSavePositionEdit = (positionId, updates) => {
    const newPositions = positions.map(pos => 
      pos.id === positionId 
        ? { ...pos, ...updates }
        : pos
    );
    setPositions(newPositions);
    setEditingPosition(null);
    setHasChanges(true);
  };

  const handleDeletePosition = (positionId) => {
    if (window.confirm('Are you sure you want to delete this position?')) {
      setPositions(positions.filter(pos => pos.id !== positionId));
      setHasChanges(true);
    }
  };

  const handleAddPosition = () => {
    const newPosition = {
      id: `pos-${Date.now()}`,
      ...newPositionData,
      schoolYearId: schoolYear.id,
      assignedCadets: []
    };
    setPositions([...positions, newPosition]);
    setNewPositionData({ title: '', rank: '', x: 400, y: 300 });
    setShowAddPosition(false);
    setHasChanges(true);
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
    const assigned = [];
    positions.forEach(pos => {
      if (pos.assignedCadets) {
        assigned.push(...pos.assignedCadets.map(c => c.id));
      }
    });
    return assigned;
  };

  const getCadetsForPosition = (positionId) => {
    const position = positions.find(p => p.id === positionId);
    return position?.assignedCadets || [];
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
            onClick={() => setShowAddPosition(true)}
          >
            <Plus size={16} />
            Add Position
          </button>
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
            {/* Organizational Chart Lines */}
            <svg className="org-lines" width="1200" height="700">
              {/* CC to Deputies */}
              <line x1="400" y1="110" x2="250" y2="150" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
              <line x1="400" y1="110" x2="550" y2="150" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
              
              {/* Deputies to Staff */}
              <line x1="250" y1="210" x2="200" y2="250" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
              <line x1="250" y1="210" x2="300" y2="250" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
              <line x1="550" y1="210" x2="500" y2="250" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
              <line x1="550" y1="210" x2="700" y2="250" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
              
              {/* Staff to Flight Commanders */}
              <line x1="200" y1="310" x2="225" y2="350" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
              <line x1="300" y1="310" x2="300" y2="350" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
              <line x1="500" y1="310" x2="450" y2="350" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
              <line x1="700" y1="310" x2="600" y2="350" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
            </svg>
            
            {positions.map(position => (
              <PositionCard
                key={position.id}
                position={position}
                cadets={getCadetsForPosition(position.id)}
                onDrop={handleAssignCadet}
                onRemove={handleRemoveCadet}
                onEdit={handleEditPosition}
                onDelete={handleDeletePosition}
                onSaveEdit={handleSavePositionEdit}
                isDragging={isDragging && position.assignedCadets?.some(c => c.id === draggedCadet?.id)}
                isEditing={editingPosition === position.id}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Add Position Modal */}
      {showAddPosition && (
        <div className="modal-overlay">
          <div className="modal add-position-modal">
            <div className="modal-header">
              <h3>Add New Position</h3>
              <button 
                className="btn btn-ghost"
                onClick={() => setShowAddPosition(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label>Position Title</label>
                <input
                  type="text"
                  value={newPositionData.title}
                  onChange={(e) => setNewPositionData({...newPositionData, title: e.target.value})}
                  placeholder="e.g. Squadron Commander"
                />
              </div>
              <div className="form-group">
                <label>Rank</label>
                <select
                  value={newPositionData.rank}
                  onChange={(e) => setNewPositionData({...newPositionData, rank: e.target.value})}
                >
                  <option value="">Select Rank</option>
                  <option value="Cadet Colonel">Cadet Colonel</option>
                  <option value="Cadet Lieutenant Colonel">Cadet Lieutenant Colonel</option>
                  <option value="Cadet Major">Cadet Major</option>
                  <option value="Cadet Captain">Cadet Captain</option>
                  <option value="Cadet 1st Lieutenant">Cadet 1st Lieutenant</option>
                  <option value="Cadet 2nd Lieutenant">Cadet 2nd Lieutenant</option>
                  <option value="Cadet Chief Master Sergeant">Cadet Chief Master Sergeant</option>
                  <option value="Cadet Senior Master Sergeant">Cadet Senior Master Sergeant</option>
                  <option value="Cadet Master Sergeant">Cadet Master Sergeant</option>
                  <option value="Cadet Technical Sergeant">Cadet Technical Sergeant</option>
                  <option value="Cadet Staff Sergeant">Cadet Staff Sergeant</option>
                  <option value="Cadet Senior Airman">Cadet Senior Airman</option>
                  <option value="Cadet Airman First Class">Cadet Airman First Class</option>
                  <option value="Cadet Airman">Cadet Airman</option>
                  <option value="Cadet Airman Basic">Cadet Airman Basic</option>
                </select>
              </div>
              <div className="position-preview">
                <p>Position will be placed at center of chart. You can drag it to desired location after creation.</p>
              </div>
              <div className="modal-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowAddPosition(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleAddPosition}
                  disabled={!newPositionData.title || !newPositionData.rank}
                >
                  Add Position
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChainOfCommandBuilder;