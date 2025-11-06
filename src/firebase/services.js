// Firebase services for AFJROTC CA-882 real-time collaboration
import { 
  doc, 
  collection, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './config';

// Collections
const COLLECTIONS = {
  SCHOOL_YEARS: 'schoolYears',
  CADETS: 'cadets', 
  CHAIN_OF_COMMAND: 'chainOfCommand',
  POSITIONS: 'positions',
  ACTIVITIES: 'activities',
  USERS: 'users'
};

// School Years Management
export const schoolYearService = {
  // Get all school years
  async getAll() {
    const querySnapshot = await getDocs(
      query(collection(db, COLLECTIONS.SCHOOL_YEARS), orderBy('createdAt', 'desc'))
    );
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Listen to school years changes (real-time)
  onSnapshot(callback) {
    return onSnapshot(
      query(collection(db, COLLECTIONS.SCHOOL_YEARS), orderBy('createdAt', 'desc')), 
      (snapshot) => {
        const schoolYears = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(schoolYears);
      }
    );
  },

  // Add new school year
  async add(schoolYearData) {
    const docRef = await addDoc(collection(db, COLLECTIONS.SCHOOL_YEARS), {
      ...schoolYearData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, ...schoolYearData };
  },

  // Update school year
  async update(id, updates) {
    const docRef = doc(db, COLLECTIONS.SCHOOL_YEARS, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  // Delete school year
  async delete(id) {
    await deleteDoc(doc(db, COLLECTIONS.SCHOOL_YEARS, id));
  }
};

// Cadets Management  
export const cadetService = {
  // Get cadets for a school year
  async getBySchoolYear(schoolYearId) {
    const q = query(
      collection(db, COLLECTIONS.CADETS), 
      where('schoolYearId', '==', schoolYearId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Listen to cadets changes (real-time)
  onSnapshot(schoolYearId, callback) {
    const q = query(
      collection(db, COLLECTIONS.CADETS), 
      where('schoolYearId', '==', schoolYearId)
    );
    return onSnapshot(q, (snapshot) => {
      const cadets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(cadets);
    });
  },

  // Add cadet
  async add(cadetData) {
    const docRef = await addDoc(collection(db, COLLECTIONS.CADETS), {
      ...cadetData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, ...cadetData };
  },

  // Update cadet
  async update(id, updates) {
    const docRef = doc(db, COLLECTIONS.CADETS, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  // Delete cadet
  async delete(id) {
    await deleteDoc(doc(db, COLLECTIONS.CADETS, id));
  }
};

// Chain of Command Management
export const cocService = {
  // Get chain of command for school year
  async getBySchoolYear(schoolYearId) {
    const q = query(
      collection(db, COLLECTIONS.CHAIN_OF_COMMAND), 
      where('schoolYearId', '==', schoolYearId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Listen to CoC changes (real-time)
  onSnapshot(schoolYearId, callback) {
    const q = query(
      collection(db, COLLECTIONS.CHAIN_OF_COMMAND), 
      where('schoolYearId', '==', schoolYearId)
    );
    return onSnapshot(q, (snapshot) => {
      const positions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(positions);
    });
  },

  // Add/Update position
  async upsertPosition(positionData) {
    if (positionData.id) {
      // Update existing
      const docRef = doc(db, COLLECTIONS.CHAIN_OF_COMMAND, positionData.id);
      await updateDoc(docRef, {
        ...positionData,
        updatedAt: serverTimestamp()
      });
      return positionData;
    } else {
      // Add new
      const docRef = await addDoc(collection(db, COLLECTIONS.CHAIN_OF_COMMAND), {
        ...positionData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { id: docRef.id, ...positionData };
    }
  },

  // Assign cadet to position (real-time update)
  async assignCadet(positionId, cadetId, assignedBy) {
    const docRef = doc(db, COLLECTIONS.CHAIN_OF_COMMAND, positionId);
    await updateDoc(docRef, {
      assignedCadetId: cadetId,
      assignedAt: serverTimestamp(),
      assignedBy: assignedBy,
      updatedAt: serverTimestamp()
    });
  },

  // Remove cadet from position
  async removeCadet(positionId) {
    const docRef = doc(db, COLLECTIONS.CHAIN_OF_COMMAND, positionId);
    await updateDoc(docRef, {
      assignedCadetId: null,
      assignedAt: null,
      assignedBy: null,
      updatedAt: serverTimestamp()
    });
  }
};

// Activities Management
export const activityService = {
  // Get available activities
  async getAll() {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.ACTIVITIES));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Listen to activities changes
  onSnapshot(callback) {
    return onSnapshot(collection(db, COLLECTIONS.ACTIVITIES), (snapshot) => {
      const activities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(activities);
    });
  },

  // Update activities list
  async updateList(activities) {
    // This would typically be an admin function
    // For now, we'll store as a single document
    const docRef = doc(db, COLLECTIONS.ACTIVITIES, 'available');
    await updateDoc(docRef, {
      list: activities,
      updatedAt: serverTimestamp()
    });
  }
};

// User Management
export const userService = {
  // Get or create user profile
  async getOrCreate(uid, userData) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return { id: uid, ...userSnap.data() };
      } else {
        // Create new user with setDoc instead of updateDoc
        const newUser = {
          ...userData,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        };
        await setDoc(userRef, newUser);
        return { id: uid, ...userData };
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
      // Return basic user data even if Firestore fails
      return { id: uid, ...userData };
    }
  },

  // Update user profile
  async update(uid, updates) {
    const userRef = doc(db, COLLECTIONS.USERS, uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  }
};