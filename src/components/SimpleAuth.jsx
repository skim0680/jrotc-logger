import React, { useState, useEffect } from 'react';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import { userService } from '../firebase/services';
import { LogIn, LogOut, Shield, AlertCircle } from 'lucide-react';

function AuthComponent({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Create/update user profile
          const userProfile = await userService.getOrCreate(firebaseUser.uid, {
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            role: 'cadet',
            unit: 'CA-882',
            lastLogin: new Date().toISOString()
          });
          
          setUser({ ...firebaseUser, profile: userProfile });
        } else {
          setUser(null);
        }
        setError(null);
      } catch (err) {
        console.error('Auth error:', err);
        setError('Authentication failed. Please try again.');
        // Still set user even if profile creation fails
        if (firebaseUser) setUser(firebaseUser);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Sign in error:', err);
      setError('Failed to sign in. Please try again.');
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign out error:', err);
      setError('Failed to sign out. Please try again.');
    }
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--primary-gradient)' }}>
        <div className="text-center text-white">
          <Shield size={64} className="mx-auto mb-4 opacity-90" />
          <h1 className="text-3xl font-bold mb-2">AFJROTC Unit CA-882</h1>
          <p className="text-lg opacity-80 mb-6">Cadet Management System</p>
          <div className="spinner mx-auto" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }}></div>
        </div>
      </div>
    );
  }

  // Sign In Screen
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--primary-gradient)' }}>
        <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <Shield size={48} className="mx-auto mb-4 text-primary-500" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">AFJROTC CA-882</h1>
            <p className="text-gray-600">Sign in to access the cadet management system</p>
          </div>

          {error && (
            <div className="bg-error-100 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
              <AlertCircle size={20} className="text-error-500 flex-shrink-0" />
              <p className="text-error-500 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleSignIn}
            disabled={loading}
            className="btn btn-primary w-full btn-lg"
          >
            <LogIn size={20} />
            Sign in with Google
          </button>

          <p className="text-xs text-gray-500 text-center mt-6">
            Contact your instructor if you need access
          </p>
        </div>
      </div>
    );
  }

  // Authenticated - render children with user info header
  return (
    <div className="min-h-screen bg-gray-50">
      {/* User Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Shield size={32} className="text-primary-500" />
            <div>
              <h1 className="font-bold text-lg text-gray-900">AFJROTC Unit CA-882</h1>
              <p className="text-sm text-gray-600">Cadet Management System</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {user.photoURL && (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-8 h-8 rounded-full"
              />
            )}
            <div className="text-right">
              <p className="font-medium text-sm text-gray-900">{user.displayName}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="btn btn-secondary btn-sm"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">
        {children}
      </main>
    </div>
  );
}

export default AuthComponent;