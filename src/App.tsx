/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useState, useEffect, createContext, useContext } from 'react';
import { auth, handleGoogleRedirect } from './firebase';
import Dashboard from './components/Dashboard';
import CardView from './components/CardView';
import Landing from './components/Landing';
import Navbar from './components/Navbar';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const useAuth = () => useContext(AuthContext);

function PostAuthRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    handleGoogleRedirect()
      .then(result => {
        // If we just came back from a Google redirect sign-in, send the user to dashboard.
        if (result?.user && location.pathname === '/') {
          navigate('/dashboard', { replace: true });
        }
      })
      .catch(err => console.error('redirect result:', err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="app-bg min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      <Router>
        <PostAuthRedirect />
        <div className="app-bg grain min-h-screen text-white">
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/d/:slug" element={<CardView />} />
            <Route
              path="/dashboard"
              element={user ? <Dashboard /> : <Navigate to="/" />}
            />
          </Routes>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}
