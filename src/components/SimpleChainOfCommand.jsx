import React, { useState } from 'react';
import { useData } from '../context/SimpleDataContext';
import { Users, Plus, Edit3, Trash2, Target, Crown, Settings } from 'lucide-react';

function SimpleChainOfCommand() {
  const {
    currentSchoolYear,
    updateChainOfCommand,
    availableRanks
  } = useData();

  const [positions, setPositions] = useState(
    currentSchoolYear?.chainOfCommand || []
  );
  const [showAddPosition, setShowAddPosition] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);
  const [newPosition, setNewPosition] = useState({
    title: '',
    rank: availableRanks[0],
    maxCadets: 1,
    x: 50, // Position on chart (percentage)
    y: 50
  });

  const availableCadets = currentSchoolYear?.cadets || [];

  const savePositions = (updatedPositions) => {
    setPositions(updatedPositions);
    updateChainOfCommand(updatedPositions);
  };

  const addCadetToPosition = (positionId, cadet) => {
    const position = positions.find(pos => pos.id === positionId);
    if (position && position.cadets.length < position.maxCadets) {
      const updatedPositions = positions.map(pos => {
        if (pos.id === positionId) {
          return {
            ...pos,
            cadets: [...pos.cadets, cadet]
          };
        }
        return pos;
      });
      savePositions(updatedPositions);
    }
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
      x: 50, // Default to center
      y: 20, // Default to top
      cadets: [],
      custom: true
    };

    savePositions([...positions, customPosition]);
    setNewPosition({ title: '', rank: availableRanks[0], maxCadets: 1, x: 50, y: 50 });
    setShowAddPosition(false);
  };

  const deletePosition = (positionId) => {
    const updatedPositions = positions.filter(pos => pos.id !== positionId);
    savePositions(updatedPositions);
  };

  const updatePositionLocation = (positionId, x, y) => {
    const updatedPositions = positions.map(pos => {
      if (pos.id === positionId) {
        return { ...pos, x, y };
      }
      return pos;
    });
    savePositions(updatedPositions);
  };

  const handleChartDrop = (e) => {
    e.preventDefault();
    const positionId = e.dataTransfer.getData('text/plain');
    if (positionId) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      updatePositionLocation(positionId, Math.max(10, Math.min(90, x)), Math.max(10, Math.min(90, y)));
    }
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
          <p className="text-gray-600">Build your organizational chart</p>
        </div>
        <button
          onClick={() => setShowAddPosition(true)}
          className="btn btn-primary"
        >
          <Plus size={20} />
          Add Position
        </button>
      </div>

      {positions.length === 0 ? (
        // Empty State
        <div className="text-center py-16">
          <Crown size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Positions Created</h3>
          <p className="text-gray-500 mb-6">Start building your chain of command by adding positions</p>
          <button
            onClick={() => setShowAddPosition(true)}
            className="btn btn-primary"
          >
            <Plus size={20} />
            Create First Position
          </button>
        </div>
      ) : (
        <div>
          {/* Unassigned Cadets Panel */}
          {getUnassignedCadets().length > 0 && (
            <div className="card mb-6">
              <div className="card-header">
                <h3 className="font-semibold flex items-center gap-2">
                  <Users size={20} />
                  Unassigned Cadets
                </h3>
              </div>
              <div className="card-body">
                <div className="flex flex-wrap gap-2">
                  {getUnassignedCadets().map(cadet => (
                    <div
                      key={cadet.id}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 cursor-move border border-gray-300 transition-colors"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('application/json', JSON.stringify(cadet));
                      }}
                    >
                      {cadet.firstName} {cadet.lastName}
                      <span className="text-xs text-gray-500 block">{cadet.rank}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                  <Target size={12} />
                  Drag cadets to positions in the chart below
                </p>
              </div>
            </div>
          )}

          {/* Organizational Chart */}
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold flex items-center gap-2">
                <Crown size={20} />
                Organizational Chart
              </h3>
            </div>
            <div className="card-body p-0">
              <div 
                className="relative bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg m-4"
                style={{ 
                  minHeight: '600px', 
                  height: '70vh',
                  backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                  backgroundPosition: '10px 10px'
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleChartDrop}
              >
                {positions.map(position => (
                  <div
                    key={position.id}
                    className="absolute bg-white border-2 border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-all cursor-move hover:border-primary-300"
                    style={{
                      left: `${position.x || 50}%`,
                      top: `${position.y || 50}%`,
                      transform: 'translate(-50%, -50%)',
                      width: '220px',
                      minHeight: '140px'
                    }}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', position.id);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add('border-primary-400', 'bg-primary-50');
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove('border-primary-400', 'bg-primary-50');
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-primary-400', 'bg-primary-50');
                      try {
                        const cadetData = e.dataTransfer.getData('application/json');
                        if (cadetData) {
                          const cadet = JSON.parse(cadetData);
                          addCadetToPosition(position.id, cadet);
                        }
                      } catch (error) {
                        console.error('Error dropping cadet:', error);
                      }
                    }}
                  >
                    {/* Position Header */}
                    <div className="bg-primary-500 text-white p-3 rounded-t-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm leading-tight">{position.title}</h4>
                          <p className="text-xs opacity-90">{position.rank}</p>
                        </div>
                        <button
                          onClick={() => deletePosition(position.id)}
                          className="text-white hover:text-red-200 p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Assigned Cadets */}
                    <div className="p-2">
                      {position.cadets.length > 0 ? (
                        <div className="space-y-1">
                          {position.cadets.slice(0, 2).map(cadet => (
                            <div key={cadet.id} className="flex items-center justify-between bg-gray-50 rounded p-1">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-xs text-gray-900 truncate">
                                  {cadet.firstName} {cadet.lastName}
                                </p>
                                <p className="text-xs text-gray-500 truncate">{cadet.rank}</p>
                              </div>
                              <button
                                onClick={() => removeCadetFromPosition(position.id, cadet.id)}
                                className="text-gray-400 hover:text-red-500 p-0.5"
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          ))}
                          {position.cadets.length > 2 && (
                            <p className="text-xs text-gray-500 text-center">
                              +{position.cadets.length - 2} more
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <Users size={20} className="mx-auto text-gray-300 mb-1" />
                          <p className="text-xs text-gray-400">Drop cadet here</p>
                        </div>
                      )}
                      
                      {/* Status indicator */}
                      <div className="text-center mt-2 pt-2 border-t border-gray-200">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          position.cadets.length === 0 ? 'bg-gray-100 text-gray-500' :
                          position.cadets.length < position.maxCadets ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {position.cadets.length}/{position.maxCadets}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Instructions & Stats */}
                {positions.length > 0 && (
                  <>
                    <div className="absolute bottom-4 left-4 bg-white border border-gray-200 rounded-lg p-4 shadow-lg max-w-xs">
                      <h4 className="font-semibold text-sm text-gray-900 mb-2 flex items-center gap-1">
                        <Target size={14} />
                        Chart Builder Tips
                      </h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Drag positions anywhere on the chart</li>
                        <li>• Drop cadets from the panel above onto positions</li>
                        <li>• Use the grid dots for alignment</li>
                        <li>• Delete positions with the trash icon</li>
                      </ul>
                    </div>
                    
                    <div className="absolute bottom-4 right-4 bg-white border border-gray-200 rounded-lg p-4 shadow-lg">
                      <h4 className="font-semibold text-sm text-gray-900 mb-2 flex items-center gap-1">
                        <Crown size={14} />
                        Chart Statistics
                      </h4>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div className="flex justify-between gap-4">
                          <span>Positions:</span>
                          <span className="font-medium">{positions.length}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span>Assigned:</span>
                          <span className="font-medium">
                            {positions.reduce((sum, pos) => sum + pos.cadets.length, 0)}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span>Unassigned:</span>
                          <span className="font-medium">{getUnassignedCadets().length}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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