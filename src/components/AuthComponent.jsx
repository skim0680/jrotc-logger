import React, { useState, useEffect } from 'react';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import { userService } from '../firebase/services';
import { LogIn, LogOut, User, Shield } from 'lucide-react';
import './AuthComponent.css';

const AuthComponent = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authTimeout, setAuthTimeout] = useState(false);

  useEffect(() => {
    // Set a timeout for auth loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log('Auth timeout reached');
        setAuthTimeout(true);
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(timeoutId);
      console.log('Auth state changed:', firebaseUser ? 'User signed in' : 'User signed out');
      
      if (firebaseUser) {
        try {
          console.log('Creating/getting user profile...');
          // Get or create user profile in Firestore
          const userProfile = await userService.getOrCreate(firebaseUser.uid, {
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            role: 'cadet', // Default role
            unit: 'CA-882',
            lastLogin: new Date().toISOString()
          });
          console.log('User profile loaded:', userProfile);
          setUser({ ...firebaseUser, profile: userProfile });
          setError(null); // Clear any previous errors
        } catch (error) {
          console.error('Error creating user profile:', error);
          setError(`Failed to load user profile: ${error.message}`);
          // Still set the user even if profile creation fails
          setUser(firebaseUser);
        }
      } else {
        setUser(null);
        setError(null);
      }
      setLoading(false);
      setAuthTimeout(false);
    });

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [loading]);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Starting Google sign in...');
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Sign in successful:', result.user.email);
    } catch (error) {
      console.error('Sign in error:', error);
      let errorMessage = 'Failed to sign in. Please try again.';
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign in was cancelled. Please try again.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = 'This domain is not authorized for authentication.';
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      setError('Failed to sign out');
    }
  };

  if (loading || authTimeout) {
    return (
      <div className="auth-loading">
        <div className="loading-spinner">
          <Shield size={48} />
          <h2>AFJROTC Unit CA-882</h2>
          {authTimeout ? (
            <div>
              <p>Authentication is taking longer than expected...</p>
              <button 
                className="btn btn-retry"
                onClick={() => {
                  setAuthTimeout(false);
                  setLoading(true);
                  setError(null);
                  // Force a refresh of auth state
                  window.location.reload();
                }}
              >
                Retry Loading
              </button>
            </div>
          ) : (
            <p>Loading...</p>
          )}
          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="auth-signin">
        <div className="signin-container">
          <div className="unit-branding">
            <Shield size={64} />
            <h1>AFJROTC Unit CA-882</h1>
            <p>Cadet Management System</p>
          </div>
          
          <div className="signin-content">
            <h2>Welcome Back</h2>
            <p>Sign in with your Google account to access the cadet management system.</p>
            
            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}
            
            <button 
              className="btn btn-google"
              onClick={signInWithGoogle}
              disabled={loading}
            >
              <LogIn size={20} />
              Sign in with Google
            </button>
            
            <div className="signin-info">
              <h3>Features:</h3>
              <ul>
                <li>✅ Real-time collaboration</li>
                <li>✅ Cadet management & tracking</li>
                <li>✅ Drag & drop chain of command</li>
                <li>✅ Activity assignment</li>
                <li>✅ School year progression</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="authenticated-app">
      <header className="app-header">
        <div className="header-left">
          <Shield size={24} />
          <span>AFJROTC CA-882</span>
        </div>
        <div className="header-right">
          <div className="user-info">
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName}
                className="user-avatar"
              />
            ) : (
              <div className="user-avatar-placeholder">
                <User size={16} />
              </div>
            )}
            <span className="user-name">{user.displayName || user.email}</span>
            <span className="user-role">{user.profile?.role || 'Cadet'}</span>
          </div>
          <button 
            className="btn btn-ghost"
            onClick={handleSignOut}
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>
      
      <main className="app-main">
        {children}
      </main>
    </div>
  );
};

export default AuthComponent;