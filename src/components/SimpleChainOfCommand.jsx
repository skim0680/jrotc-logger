import React, { useState } from 'react';
import { useData } from '../context/SimpleDataContext';
import { Users, Plus, Edit3, Trash2, Target } from 'lucide-react';

// AFJROTC organizational structure
const DEFAULT_POSITIONS = [
  // Command Level
  { id: 'wing-commander', title: 'Wing Commander', rank: 'Cadet Colonel', level: 1, maxCadets: 1 },
  { id: 'vice-commander', title: 'Vice Commander', rank: 'Cadet Lt Colonel', level: 1, maxCadets: 1 },
  
  // Group Level
  { id: 'group-commander', title: 'Group Commander', rank: 'Cadet Major', level: 2, maxCadets: 2 },
  { id: 'deputy-group-commander', title: 'Deputy Group Commander', rank: 'Cadet Captain', level: 2, maxCadets: 2 },
  
  // Squadron Level
  { id: 'squadron-commander', title: 'Squadron Commander', rank: 'Cadet Captain', level: 3, maxCadets: 4 },
  { id: 'operations-officer', title: 'Operations Officer', rank: 'Cadet 1st Lt', level: 3, maxCadets: 2 },
  { id: 'logistics-officer', title: 'Logistics Officer', rank: 'Cadet 1st Lt', level: 3, maxCadets: 2 },
  
  // Flight Level
  { id: 'flight-commander', title: 'Flight Commander', rank: 'Cadet 2nd Lt', level: 4, maxCadets: 8 },
  { id: 'flight-sergeant', title: 'Flight Sergeant', rank: 'Cadet Master Sergeant', level: 4, maxCadets: 8 },
  
  // Element Level
  { id: 'element-leader', title: 'Element Leader', rank: 'Cadet Staff Sergeant', level: 5, maxCadets: 12 }
];

function SimpleChainOfCommand() {
  const {
    currentSchoolYear,
    updateChainOfCommand
  } = useData();

  const [positions, setPositions] = useState(
    currentSchoolYear?.chainOfCommand || DEFAULT_POSITIONS.map(pos => ({ ...pos, cadets: [] }))
  );
  const [showAddPosition, setShowAddPosition] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);
  const [newPosition, setNewPosition] = useState({
    title: '',
    rank: 'Cadet Airman',
    level: 5,
    maxCadets: 1
  });

  const availableCadets = currentSchoolYear?.cadets || [];

  const savePositions = (updatedPositions) => {
    setPositions(updatedPositions);
    updateChainOfCommand(updatedPositions);
  };

  const addCadetToPosition = (positionId, cadet) => {
    const updatedPositions = positions.map(pos => {
      if (pos.id === positionId && pos.cadets.length < pos.maxCadets) {
        return {
          ...pos,
          cadets: [...pos.cadets, cadet]
        };
      }
      return pos;
    });
    savePositions(updatedPositions);
  };

  const removeCadetFromPosition = (positionId, cadetId) => {
    const updatedPositions = positions.map(pos => {
      if (pos.id === positionId) {
        return {
          ...pos,
          cadets: pos.cadets.filter(c => c.id !== cadetId)
        };
      }
      return pos;
    });
    savePositions(updatedPositions);
  };

  const addCustomPosition = () => {
    if (!newPosition.title.trim()) return;

    const customPosition = {
      id: `custom-${Date.now()}`,
      ...newPosition,
      cadets: [],
      custom: true
    };

    savePositions([...positions, customPosition]);
    setNewPosition({ title: '', rank: 'Cadet Airman', level: 5, maxCadets: 1 });
    setShowAddPosition(false);
  };

  const deletePosition = (positionId) => {
    const updatedPositions = positions.filter(pos => pos.id !== positionId);
    savePositions(updatedPositions);
  };

  const getPositionsByLevel = (level) => {
    return positions.filter(pos => pos.level === level);
  };

  const getUnassignedCadets = () => {
    const assignedCadetIds = new Set();
    positions.forEach(pos => {
      pos.cadets.forEach(cadet => assignedCadetIds.add(cadet.id));
    });
    return availableCadets.filter(cadet => !assignedCadetIds.has(cadet.id));
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Chain of Command</h2>
          <p className="text-gray-600">Organize cadets by position and responsibility</p>
        </div>
        <button
          onClick={() => setShowAddPosition(true)}
          className="btn btn-primary"
        >
          <Plus size={20} />
          Add Position
        </button>
      </div>

      {/* Unassigned Cadets */}
      {getUnassignedCadets().length > 0 && (
        <div className="card mb-6">
          <div className="card-header">
            <h3 className="font-semibold">Unassigned Cadets</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-wrap gap-2">
              {getUnassignedCadets().map(cadet => (
                <div
                  key={cadet.id}
                  className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 cursor-move"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/json', JSON.stringify(cadet));
                  }}
                >
                  {cadet.firstName} {cadet.lastName} - {cadet.rank}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Drag cadets to positions below to assign them
            </p>
          </div>
        </div>
      )}

      {/* Organizational Chart */}
      <div className="space-y-6">
        {[1, 2, 3, 4, 5].map(level => {
          const levelPositions = getPositionsByLevel(level);
          if (levelPositions.length === 0) return null;

          return (
            <div key={level} className="card">
              <div className="card-header">
                <h3 className="font-semibold">
                  Level {level} - {
                    level === 1 ? 'Command' :
                    level === 2 ? 'Group' :
                    level === 3 ? 'Squadron' :
                    level === 4 ? 'Flight' :
                    'Element'
                  }
                </h3>
              </div>
              <div className="card-body">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {levelPositions.map(position => (
                    <div
                      key={position.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        try {
                          const cadet = JSON.parse(e.dataTransfer.getData('application/json'));
                          addCadetToPosition(position.id, cadet);
                        } catch (error) {
                          console.error('Error dropping cadet:', error);
                        }
                      }}
                    >
                      {/* Position Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{position.title}</h4>
                          <p className="text-sm text-gray-600">{position.rank}</p>
                        </div>
                        {position.custom && (
                          <button
                            onClick={() => deletePosition(position.id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>

                      {/* Assigned Cadets */}
                      <div className="space-y-2 mb-3">
                        {position.cadets.map(cadet => (
                          <div
                            key={cadet.id}
                            className="flex items-center justify-between bg-primary-50 rounded p-2"
                          >
                            <div>
                              <p className="font-medium text-sm text-primary-700">
                                {cadet.firstName} {cadet.lastName}
                              </p>
                              <p className="text-xs text-primary-600">{cadet.rank}</p>
                            </div>
                            <button
                              onClick={() => removeCadetFromPosition(position.id, cadet.id)}
                              className="text-primary-400 hover:text-red-500"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Status */}
                      <div className="text-center py-2 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          {position.cadets.length} / {position.maxCadets} assigned
                        </p>
                        {position.cadets.length === 0 && (
                          <p className="text-xs text-gray-400 mt-1">
                            Drop cadets here to assign
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Position Modal */}
      {showAddPosition && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold">Add Custom Position</h3>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="form-label">Position Title</label>
                  <input
                    type="text"
                    value={newPosition.title}
                    onChange={(e) => setNewPosition({ ...newPosition, title: e.target.value })}
                    className="form-input"
                    placeholder="e.g., Public Affairs Officer"
                  />
                </div>
                
                <div>
                  <label className="form-label">Rank</label>
                  <input
                    type="text"
                    value={newPosition.rank}
                    onChange={(e) => setNewPosition({ ...newPosition, rank: e.target.value })}
                    className="form-input"
                    placeholder="e.g., Cadet Captain"
                  />
                </div>
                
                <div className="form-row">
                  <div>
                    <label className="form-label">Level</label>
                    <select
                      value={newPosition.level}
                      onChange={(e) => setNewPosition({ ...newPosition, level: parseInt(e.target.value) })}
                      className="form-select"
                    >
                      <option value={1}>1 - Command</option>
                      <option value={2}>2 - Group</option>
                      <option value={3}>3 - Squadron</option>
                      <option value={4}>4 - Flight</option>
                      <option value={5}>5 - Element</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="form-label">Max Cadets</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={newPosition.maxCadets}
                      onChange={(e) => setNewPosition({ ...newPosition, maxCadets: parseInt(e.target.value) })}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={addCustomPosition}
                  className="btn btn-primary flex-1"
                >
                  Add Position
                </button>
                <button
                  onClick={() => setShowAddPosition(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {availableCadets.length === 0 && (
        <div className="text-center py-12">
          <Target size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Cadets Available</h3>
          <p className="text-gray-500">Add cadets first to build your chain of command</p>
        </div>
      )}
    </div>
  );
}

export default SimpleChainOfCommand;