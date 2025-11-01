import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Initial state
const initialState = {
  corps: [],
  currentCorps: null,
  currentSchoolYear: null,
  currentChainOfCommand: null,
  availableActivities: [
    // Leadership & Drill
    'Drill Team', 'Honor Guard', 'Color Guard', 'Leadership Education',
    'Cadet Leadership Course', 'Squadron/Group Commander', 'Flight Commander',
    
    // Academic & Competition
    'Academic Bowl', 'CyberPatriot', 'StellarXplorers', 'Orienteering',
    'Drill Competition', 'Inspection Competition', 'Rifle Team',
    
    // Community Service & Events  
    'Community Service', 'Veterans Day Ceremony', 'Memorial Day Event',
    'Flag Detail', 'Funeral Honor Guard', 'Special Events',
    
    // Physical Fitness & Recreation
    'Physical Training', 'Fitness Testing', 'Outdoor Recreation',
    'Hiking/Camping', 'Sports Competition', 'Wellness Education',
    
    // Career & Education
    'Career Exploration', 'College Fair', 'Job Shadowing',
    'STEM Activities', 'Flight Simulation', 'Aerospace Education',
    
    // Special Programs
    'Summer Leadership School', 'Encampment', 'Model Rocketry',
    'Ground School', 'Emergency Services', 'Search and Rescue'
  ]
};

// Action types
const ACTION_TYPES = {
  SET_CORPS: 'SET_CORPS',
  ADD_CORPS: 'ADD_CORPS',
  UPDATE_CORPS: 'UPDATE_CORPS',
  DELETE_CORPS: 'DELETE_CORPS',
  SET_CURRENT_CORPS: 'SET_CURRENT_CORPS',
  ADD_SCHOOL_YEAR: 'ADD_SCHOOL_YEAR',
  SET_CURRENT_SCHOOL_YEAR: 'SET_CURRENT_SCHOOL_YEAR',
  UPDATE_SCHOOL_YEAR: 'UPDATE_SCHOOL_YEAR',
  ADD_CADET: 'ADD_CADET',
  UPDATE_CADET: 'UPDATE_CADET',
  DELETE_CADET: 'DELETE_CADET',
  PROMOTE_CADETS: 'PROMOTE_CADETS',
  ADD_CHAIN_OF_COMMAND: 'ADD_CHAIN_OF_COMMAND',
  UPDATE_CHAIN_OF_COMMAND: 'UPDATE_CHAIN_OF_COMMAND',
  DELETE_CHAIN_OF_COMMAND: 'DELETE_CHAIN_OF_COMMAND',
  SET_CURRENT_CHAIN_OF_COMMAND: 'SET_CURRENT_CHAIN_OF_COMMAND',
  ADD_POSITION: 'ADD_POSITION',
  UPDATE_POSITION: 'UPDATE_POSITION',
  DELETE_POSITION: 'DELETE_POSITION',
  ASSIGN_CADET_TO_POSITION: 'ASSIGN_CADET_TO_POSITION',
  UPDATE_AVAILABLE_ACTIVITIES: 'UPDATE_AVAILABLE_ACTIVITIES',
};

// Reducer
function dataReducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.SET_CORPS:
      return {
        ...state,
        corps: action.payload,
      };

    case ACTION_TYPES.ADD_CORPS:
      return {
        ...state,
        corps: [...state.corps, action.payload],
      };

    case ACTION_TYPES.UPDATE_CORPS:
      return {
        ...state,
        corps: state.corps.map(corps => 
          corps.id === action.payload.id ? action.payload : corps
        ),
      };

    case ACTION_TYPES.DELETE_CORPS:
      return {
        ...state,
        corps: state.corps.filter(corps => corps.id !== action.payload),
        currentCorps: state.currentCorps?.id === action.payload ? null : state.currentCorps,
      };

    case ACTION_TYPES.SET_CURRENT_CORPS:
      return {
        ...state,
        currentCorps: action.payload,
        currentSchoolYear: action.payload?.schoolYears?.[action.payload.schoolYears.length - 1] || null,
      };

    case ACTION_TYPES.ADD_SCHOOL_YEAR:
      return {
        ...state,
        corps: state.corps.map(corps =>
          corps.id === action.payload.corpsId
            ? {
                ...corps,
                schoolYears: [...corps.schoolYears, action.payload.schoolYear]
              }
            : corps
        ),
      };

    case ACTION_TYPES.SET_CURRENT_SCHOOL_YEAR:
      return {
        ...state,
        currentSchoolYear: action.payload,
      };

    case ACTION_TYPES.UPDATE_SCHOOL_YEAR:
      return {
        ...state,
        corps: state.corps.map(corps =>
          corps.id === action.payload.corpsId
            ? {
                ...corps,
                schoolYears: corps.schoolYears.map(year =>
                  year.id === action.payload.schoolYear.id ? action.payload.schoolYear : year
                )
              }
            : corps
        ),
      };

    case ACTION_TYPES.ADD_CADET:
      return {
        ...state,
        corps: state.corps.map(corps =>
          corps.id === action.payload.corpsId
            ? {
                ...corps,
                schoolYears: corps.schoolYears.map(year =>
                  year.id === action.payload.schoolYearId
                    ? {
                        ...year,
                        cadets: [...(year.cadets || []), action.payload.cadet]
                      }
                    : year
                )
              }
            : corps
        ),
      };

    case ACTION_TYPES.UPDATE_CADET:
      return {
        ...state,
        corps: state.corps.map(corps =>
          corps.id === action.payload.corpsId
            ? {
                ...corps,
                schoolYears: corps.schoolYears.map(year =>
                  year.id === action.payload.schoolYearId
                    ? {
                        ...year,
                        cadets: year.cadets.map(cadet =>
                          cadet.id === action.payload.cadet.id ? action.payload.cadet : cadet
                        )
                      }
                    : year
                )
              }
            : corps
        ),
      };

    case ACTION_TYPES.DELETE_CADET:
      return {
        ...state,
        corps: state.corps.map(corps =>
          corps.id === action.payload.corpsId
            ? {
                ...corps,
                schoolYears: corps.schoolYears.map(year =>
                  year.id === action.payload.schoolYearId
                    ? {
                        ...year,
                        cadets: year.cadets.filter(cadet => cadet.id !== action.payload.cadetId)
                      }
                    : year
                )
              }
            : corps
        ),
      };

    case ACTION_TYPES.ADD_CHAIN_OF_COMMAND:
      return {
        ...state,
        corps: state.corps.map(corps =>
          corps.id === action.payload.corpsId
            ? {
                ...corps,
                schoolYears: corps.schoolYears.map(year =>
                  year.id === action.payload.schoolYearId
                    ? {
                        ...year,
                        chainOfCommands: [...(year.chainOfCommands || []), action.payload.chainOfCommand]
                      }
                    : year
                )
              }
            : corps
        ),
      };

    case ACTION_TYPES.UPDATE_CHAIN_OF_COMMAND:
      return {
        ...state,
        corps: state.corps.map(corps =>
          corps.id === action.payload.corpsId
            ? {
                ...corps,
                schoolYears: corps.schoolYears.map(year =>
                  year.id === action.payload.schoolYearId
                    ? {
                        ...year,
                        chainOfCommands: year.chainOfCommands.map(coc =>
                          coc.id === action.payload.chainOfCommand.id ? action.payload.chainOfCommand : coc
                        )
                      }
                    : year
                )
              }
            : corps
        ),
      };

    case ACTION_TYPES.DELETE_CHAIN_OF_COMMAND:
      return {
        ...state,
        corps: state.corps.map(corps =>
          corps.id === action.payload.corpsId
            ? {
                ...corps,
                schoolYears: corps.schoolYears.map(year =>
                  year.id === action.payload.schoolYearId
                    ? {
                        ...year,
                        chainOfCommands: year.chainOfCommands.filter(coc => coc.id !== action.payload.chainOfCommandId)
                      }
                    : year
                )
              }
            : corps
        ),
        currentChainOfCommand: state.currentChainOfCommand?.id === action.payload.chainOfCommandId ? null : state.currentChainOfCommand,
      };

    case ACTION_TYPES.SET_CURRENT_CHAIN_OF_COMMAND:
      return {
        ...state,
        currentChainOfCommand: action.payload,
      };

    case ACTION_TYPES.ADD_POSITION:
      return {
        ...state,
        currentChainOfCommand: state.currentChainOfCommand
          ? {
              ...state.currentChainOfCommand,
              positions: [...state.currentChainOfCommand.positions, action.payload]
            }
          : null,
      };

    case ACTION_TYPES.UPDATE_POSITION:
      return {
        ...state,
        currentChainOfCommand: state.currentChainOfCommand
          ? {
              ...state.currentChainOfCommand,
              positions: state.currentChainOfCommand.positions.map(pos =>
                pos.id === action.payload.id ? action.payload : pos
              )
            }
          : null,
      };

    case ACTION_TYPES.DELETE_POSITION:
      return {
        ...state,
        currentChainOfCommand: state.currentChainOfCommand
          ? {
              ...state.currentChainOfCommand,
              positions: state.currentChainOfCommand.positions.filter(pos => pos.id !== action.payload)
            }
          : null,
      };

    case ACTION_TYPES.ASSIGN_CADET_TO_POSITION:
      return {
        ...state,
        currentChainOfCommand: state.currentChainOfCommand
          ? {
              ...state.currentChainOfCommand,
              positions: state.currentChainOfCommand.positions.map(pos =>
                pos.id === action.payload.positionId
                  ? { ...pos, assignedCadet: action.payload.cadetId }
                  : pos
              )
            }
          : null,
      };

    case ACTION_TYPES.PROMOTE_CADETS:
      return {
        ...state,
        corps: state.corps.map(corps =>
          corps.id === action.payload.corpsId
            ? {
                ...corps,
                schoolYears: corps.schoolYears.map(year =>
                  year.id === action.payload.fromYearId
                    ? {
                        ...year,
                        cadets: year.cadets.filter(cadet => cadet.grade !== 12) // Remove graduating seniors
                      }
                    : year.id === action.payload.toYearId
                    ? {
                        ...year,
                        cadets: action.payload.promotedCadets
                      }
                    : year
                )
              }
            : corps
        ),
      };

    case ACTION_TYPES.UPDATE_AVAILABLE_ACTIVITIES:
      return {
        ...state,
        availableActivities: action.payload,
      };

    default:
      return state;
  }
}

// Context
const DataContext = createContext();

// Hook to use context
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Provider component
export const DataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('jrotc-app-data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        dispatch({ type: ACTION_TYPES.SET_CORPS, payload: parsedData.corps || [] });
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('jrotc-app-data', JSON.stringify({ corps: state.corps }));
  }, [state.corps]);

  // Action creators
  const actions = {
    addCorps: (name, description = '') => {
      const currentYear = new Date().getFullYear();
      const defaultSchoolYear = {
        id: uuidv4(),
        name: `${currentYear}-${currentYear + 1}`,
        startYear: currentYear,
        endYear: currentYear + 1,
        cadets: [],
        chainOfCommands: [],
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      
      const newCorps = {
        id: uuidv4(),
        name,
        description,
        schoolYears: [defaultSchoolYear],
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: ACTION_TYPES.ADD_CORPS, payload: newCorps });
      return newCorps;
    },

    updateCorps: (corps) => {
      dispatch({ type: ACTION_TYPES.UPDATE_CORPS, payload: corps });
    },

    deleteCorps: (corpsId) => {
      dispatch({ type: ACTION_TYPES.DELETE_CORPS, payload: corpsId });
    },

    setCurrentCorps: (corps) => {
      dispatch({ type: ACTION_TYPES.SET_CURRENT_CORPS, payload: corps });
    },

    addSchoolYear: (corpsId, startYear, endYear) => {
      const previousYear = state.corps.find(c => c.id === corpsId)?.schoolYears
        ?.sort((a, b) => b.startYear - a.startYear)[0];
      
      const newSchoolYear = {
        id: uuidv4(),
        name: `${startYear}-${endYear}`,
        startYear,
        endYear,
        cadets: [],
        chainOfCommands: [],
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      // Mark all other years as inactive
      const corps = state.corps.find(c => c.id === corpsId);
      if (corps) {
        corps.schoolYears.forEach(year => {
          if (year.isActive) {
            dispatch({ 
              type: ACTION_TYPES.UPDATE_SCHOOL_YEAR, 
              payload: { 
                corpsId, 
                schoolYear: { ...year, isActive: false } 
              } 
            });
          }
        });
      }

      dispatch({
        type: ACTION_TYPES.ADD_SCHOOL_YEAR,
        payload: { corpsId, schoolYear: newSchoolYear }
      });

      // If there was a previous year, promote cadets
      if (previousYear) {
        actions.promoteCadetsToNewYear(corpsId, previousYear.id, newSchoolYear.id);
      }

      return newSchoolYear;
    },

    setCurrentSchoolYear: (schoolYear) => {
      dispatch({ type: ACTION_TYPES.SET_CURRENT_SCHOOL_YEAR, payload: schoolYear });
    },

    promoteCadetsToNewYear: (corpsId, fromYearId, toYearId) => {
      const corps = state.corps.find(c => c.id === corpsId);
      const fromYear = corps?.schoolYears.find(y => y.id === fromYearId);
      
      if (!fromYear) return;

      const promotedCadets = fromYear.cadets
        .filter(cadet => cadet.grade !== 12) // Exclude graduating seniors
        .map(cadet => ({
          ...cadet,
          grade: Math.min(cadet.grade + 1, 12), // Advance grade
          asLevel: Math.min((cadet.asLevel || 1) + 1, 4), // Advance AS level
          yearlyHistory: [
            ...(cadet.yearlyHistory || []),
            {
              schoolYearId: fromYearId,
              schoolYearName: fromYear.name,
              grade: cadet.grade,
              asLevel: cadet.asLevel || 1,
              flight: cadet.flight,
              semester1Activities: cadet.semester1Activities || [],
              semester2Activities: cadet.semester2Activities || [],
            }
          ],
          // Reset current semester activities for new year
          semester1Activities: [],
          semester2Activities: [],
        }));

      dispatch({
        type: ACTION_TYPES.PROMOTE_CADETS,
        payload: { corpsId, fromYearId, toYearId, promotedCadets }
      });
    },

    addCadet: (corpsId, schoolYearId, cadetData) => {
      const newCadet = {
        id: uuidv4(),
        ...cadetData,
        grade: cadetData.grade || 9,
        asLevel: cadetData.asLevel || 1,
        flight: cadetData.flight || '',
        semester1Activities: cadetData.semester1Activities || [],
        semester2Activities: cadetData.semester2Activities || [],
        yearlyHistory: [],
        createdAt: new Date().toISOString(),
      };
      dispatch({
        type: ACTION_TYPES.ADD_CADET,
        payload: { corpsId, schoolYearId, cadet: newCadet }
      });
      return newCadet;
    },

    updateCadet: (corpsId, schoolYearId, cadet) => {
      dispatch({
        type: ACTION_TYPES.UPDATE_CADET,
        payload: { corpsId, schoolYearId, cadet }
      });
    },

    deleteCadet: (corpsId, schoolYearId, cadetId) => {
      dispatch({
        type: ACTION_TYPES.DELETE_CADET,
        payload: { corpsId, schoolYearId, cadetId }
      });
    },

    addChainOfCommand: (corpsId, schoolYearId, name, description = '') => {
      const newChainOfCommand = {
        id: uuidv4(),
        name,
        description,
        positions: [],
        createdAt: new Date().toISOString(),
      };
      dispatch({
        type: ACTION_TYPES.ADD_CHAIN_OF_COMMAND,
        payload: { corpsId, schoolYearId, chainOfCommand: newChainOfCommand }
      });
      return newChainOfCommand;
    },

    updateChainOfCommand: (corpsId, schoolYearId, chainOfCommand) => {
      dispatch({
        type: ACTION_TYPES.UPDATE_CHAIN_OF_COMMAND,
        payload: { corpsId, schoolYearId, chainOfCommand }
      });
    },

    deleteChainOfCommand: (corpsId, schoolYearId, chainOfCommandId) => {
      dispatch({
        type: ACTION_TYPES.DELETE_CHAIN_OF_COMMAND,
        payload: { corpsId, schoolYearId, chainOfCommandId }
      });
    },

    setCurrentChainOfCommand: (chainOfCommand) => {
      dispatch({ type: ACTION_TYPES.SET_CURRENT_CHAIN_OF_COMMAND, payload: chainOfCommand });
    },

    addPosition: (title, level = 1, x = 0, y = 0, notes = '') => {
      const newPosition = {
        id: uuidv4(),
        title,
        level,
        x,
        y,
        notes,
        assignedCadet: null,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: ACTION_TYPES.ADD_POSITION, payload: newPosition });
      return newPosition;
    },

    updatePosition: (position) => {
      dispatch({ type: ACTION_TYPES.UPDATE_POSITION, payload: position });
    },

    deletePosition: (positionId) => {
      dispatch({ type: ACTION_TYPES.DELETE_POSITION, payload: positionId });
    },

    assignCadetToPosition: (positionId, cadetId) => {
      dispatch({
        type: ACTION_TYPES.ASSIGN_CADET_TO_POSITION,
        payload: { positionId, cadetId }
      });
    },

    exportData: () => {
      return JSON.stringify(state.corps, null, 2);
    },

    importData: (jsonData) => {
      try {
        const importedCorps = JSON.parse(jsonData);
        dispatch({ type: ACTION_TYPES.SET_CORPS, payload: importedCorps });
        return true;
      } catch (error) {
        console.error('Error importing data:', error);
        return false;
      }
    },

    updateAvailableActivities: (activities) => {
      dispatch({ type: ACTION_TYPES.UPDATE_AVAILABLE_ACTIVITIES, payload: activities });
    },

    getCurrentYearCadets: (corpsId) => {
      const corps = state.corps.find(c => c.id === corpsId);
      const currentYear = corps?.schoolYears?.find(y => y.isActive);
      return currentYear?.cadets || [];
    },

    getSchoolYearCadets: (corpsId, schoolYearId) => {
      const corps = state.corps.find(c => c.id === corpsId);
      const schoolYear = corps?.schoolYears?.find(y => y.id === schoolYearId);
      return schoolYear?.cadets || [];
    },
  };

  return (
    <DataContext.Provider value={{ ...state, ...actions }}>
      {children}
    </DataContext.Provider>
  );
};