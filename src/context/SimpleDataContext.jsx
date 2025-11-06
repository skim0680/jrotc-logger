import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Simple state structure - just what we actually need
const initialState = {
  schoolYears: [],
  currentSchoolYear: null,
  loading: false,
  error: null
};

// Simplified actions
const actions = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_SCHOOL_YEARS: 'SET_SCHOOL_YEARS',
  SET_CURRENT_SCHOOL_YEAR: 'SET_CURRENT_SCHOOL_YEAR',
  ADD_SCHOOL_YEAR: 'ADD_SCHOOL_YEAR',
  UPDATE_SCHOOL_YEAR: 'UPDATE_SCHOOL_YEAR',
  DELETE_SCHOOL_YEAR: 'DELETE_SCHOOL_YEAR',
  ADD_CADET: 'ADD_CADET',
  UPDATE_CADET: 'UPDATE_CADET',
  DELETE_CADET: 'DELETE_CADET',
  UPDATE_CHAIN_OF_COMMAND: 'UPDATE_CHAIN_OF_COMMAND'
};

// Helper function to generate unique IDs
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// Simple reducer - no complex nested logic
function dataReducer(state, action) {
  switch (action.type) {
    case actions.SET_LOADING:
      return { ...state, loading: action.payload };
      
    case actions.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
      
    case actions.SET_SCHOOL_YEARS:
      return { ...state, schoolYears: action.payload, loading: false };
      
    case actions.SET_CURRENT_SCHOOL_YEAR:
      return { ...state, currentSchoolYear: action.payload };
      
    case actions.ADD_SCHOOL_YEAR:
      return {
        ...state,
        schoolYears: [action.payload, ...state.schoolYears]
      };
      
    case actions.UPDATE_SCHOOL_YEAR:
      return {
        ...state,
        schoolYears: state.schoolYears.map(year =>
          year.id === action.payload.id ? action.payload : year
        ),
        currentSchoolYear: state.currentSchoolYear?.id === action.payload.id 
          ? action.payload : state.currentSchoolYear
      };
      
    case actions.DELETE_SCHOOL_YEAR:
      const remainingYears = state.schoolYears.filter(year => year.id !== action.payload);
      return {
        ...state,
        schoolYears: remainingYears,
        currentSchoolYear: state.currentSchoolYear?.id === action.payload 
          ? (remainingYears[0] || null) : state.currentSchoolYear
      };
      
    case actions.ADD_CADET:
      if (!state.currentSchoolYear) return state;
      
      const updatedYear = {
        ...state.currentSchoolYear,
        cadets: [...(state.currentSchoolYear.cadets || []), action.payload]
      };
      
      return {
        ...state,
        currentSchoolYear: updatedYear,
        schoolYears: state.schoolYears.map(year =>
          year.id === updatedYear.id ? updatedYear : year
        )
      };
      
    case actions.UPDATE_CADET:
      if (!state.currentSchoolYear) return state;
      
      const yearWithUpdatedCadet = {
        ...state.currentSchoolYear,
        cadets: state.currentSchoolYear.cadets.map(cadet =>
          cadet.id === action.payload.id ? action.payload : cadet
        )
      };
      
      return {
        ...state,
        currentSchoolYear: yearWithUpdatedCadet,
        schoolYears: state.schoolYears.map(year =>
          year.id === yearWithUpdatedCadet.id ? yearWithUpdatedCadet : year
        )
      };
      
    case actions.DELETE_CADET:
      if (!state.currentSchoolYear) return state;
      
      const yearWithoutCadet = {
        ...state.currentSchoolYear,
        cadets: state.currentSchoolYear.cadets.filter(cadet => cadet.id !== action.payload)
      };
      
      return {
        ...state,
        currentSchoolYear: yearWithoutCadet,
        schoolYears: state.schoolYears.map(year =>
          year.id === yearWithoutCadet.id ? yearWithoutCadet : year
        )
      };
      
    case actions.UPDATE_CHAIN_OF_COMMAND:
      if (!state.currentSchoolYear) return state;
      
      const yearWithUpdatedCoC = {
        ...state.currentSchoolYear,
        chainOfCommand: action.payload
      };
      
      return {
        ...state,
        currentSchoolYear: yearWithUpdatedCoC,
        schoolYears: state.schoolYears.map(year =>
          year.id === yearWithUpdatedCoC.id ? yearWithUpdatedCoC : year
        )
      };
      
    default:
      return state;
  }
}

// Default activities - simplified list
const defaultActivities = [
  // Leadership & Military
  'Drill Team', 'Honor Guard', 'Color Guard', 'Leadership Course',
  'Squadron Commander', 'Flight Commander', 'First Sergeant',
  
  // Academic & Competition
  'Academic Bowl', 'CyberPatriot', 'Drill Competition', 'Inspection Team',
  
  // Community & Service
  'Community Service', 'Veterans Day Ceremony', 'Flag Detail',
  
  // Physical & Recreation
  'Physical Training', 'Fitness Testing', 'Outdoor Activities',
  
  // Career & Education
  'Career Exploration', 'STEM Activities', 'Aerospace Education'
];

// AFJROTC rank structure - simplified
const afjrotcRanks = [
  'Cadet Airman Basic',
  'Cadet Airman',
  'Cadet Airman First Class',
  'Cadet Senior Airman',
  'Cadet Staff Sergeant',
  'Cadet Technical Sergeant',
  'Cadet Master Sergeant',
  'Cadet First Sergeant',
  'Cadet Chief Master Sergeant',
  'Cadet Second Lieutenant',
  'Cadet First Lieutenant',
  'Cadet Captain',
  'Cadet Major',
  'Cadet Lieutenant Colonel',
  'Cadet Colonel'
];

// Create context
const DataContext = createContext();

// Provider component
export function DataProvider({ children }) {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  // Load initial data from localStorage
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('afjrotc-ca882-data');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.schoolYears) {
          dispatch({ type: actions.SET_SCHOOL_YEARS, payload: parsed.schoolYears });
          if (parsed.currentSchoolYearId) {
            const currentYear = parsed.schoolYears.find(y => y.id === parsed.currentSchoolYearId);
            if (currentYear) {
              dispatch({ type: actions.SET_CURRENT_SCHOOL_YEAR, payload: currentYear });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    try {
      const dataToSave = {
        schoolYears: state.schoolYears,
        currentSchoolYearId: state.currentSchoolYear?.id
      };
      localStorage.setItem('afjrotc-ca882-data', JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }, [state.schoolYears, state.currentSchoolYear]);

  // Simplified API functions
  const api = {
    // School Year Management
    createSchoolYear: (name) => {
      const newYear = {
        id: generateId(),
        name: name.trim(),
        cadets: [],
        chainOfCommand: null,
        activities: [...defaultActivities],
        createdAt: new Date().toISOString()
      };
      
      dispatch({ type: actions.ADD_SCHOOL_YEAR, payload: newYear });
      return newYear;
    },

    updateSchoolYear: (updates) => {
      if (!state.currentSchoolYear) return;
      
      const updated = { ...state.currentSchoolYear, ...updates };
      dispatch({ type: actions.UPDATE_SCHOOL_YEAR, payload: updated });
      return updated;
    },

    deleteSchoolYear: (yearId) => {
      dispatch({ type: actions.DELETE_SCHOOL_YEAR, payload: yearId });
    },

    setCurrentSchoolYear: (year) => {
      dispatch({ type: actions.SET_CURRENT_SCHOOL_YEAR, payload: year });
    },

    // Cadet Management
    addCadet: (cadetData) => {
      const newCadet = {
        id: generateId(),
        firstName: cadetData.firstName.trim(),
        lastName: cadetData.lastName.trim(),
        rank: cadetData.rank || afjrotcRanks[0],
        grade: cadetData.grade || 9,
        asLevel: cadetData.asLevel || 1,
        flight: cadetData.flight || '',
        email: cadetData.email || '',
        notes: cadetData.notes || '',
        activities: cadetData.activities || [],
        createdAt: new Date().toISOString()
      };
      
      dispatch({ type: actions.ADD_CADET, payload: newCadet });
      return newCadet;
    },

    updateCadet: (cadetId, updates) => {
      if (!state.currentSchoolYear) return;
      
      const cadet = state.currentSchoolYear.cadets.find(c => c.id === cadetId);
      if (!cadet) return;
      
      const updatedCadet = { ...cadet, ...updates };
      dispatch({ type: actions.UPDATE_CADET, payload: updatedCadet });
      return updatedCadet;
    },

    deleteCadet: (cadetId) => {
      dispatch({ type: actions.DELETE_CADET, payload: cadetId });
    },

    // Chain of Command
    updateChainOfCommand: (positions) => {
      dispatch({ type: actions.UPDATE_CHAIN_OF_COMMAND, payload: positions });
    },

    // Utilities
    setLoading: (loading) => {
      dispatch({ type: actions.SET_LOADING, payload: loading });
    },

    setError: (error) => {
      dispatch({ type: actions.SET_ERROR, payload: error });
    }
  };

  const value = {
    // State
    ...state,
    
    // API
    ...api,
    
    // Constants
    availableRanks: afjrotcRanks,
    defaultActivities,
    
    // Computed values
    cadetCount: state.currentSchoolYear?.cadets?.length || 0,
    hasData: state.schoolYears.length > 0
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

// Hook to use the context
export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

export default DataContext;