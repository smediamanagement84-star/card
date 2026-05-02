/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
        if (result?.user && location.pathname === '/') {
          navigate('/dashboard', { replace: true });
        }
      })
      .catch(err => console.error('redirect result:', err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
};

function AppRoutes({ user }: { user: User | null }) {
  const location = useLocation();
  // Key the wrapper by pathname so AnimatePresence enter/exits routes properly.
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      >
        <Routes location={location}>
          <Route path="/" element={<Landing />} />
          <Route path="/d/:slug" element={<CardView />} />
          <Route
            path="/dashboard"
            element={user ? <Dashboard /> : <Navigate to="/" replace />}
          />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
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
        <div className="w-10 h-10 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      <Router>
        <PostAuthRedirect />
        <div className="app-bg min-h-screen">
          <Navbar />
          <AppRoutes user={user} />
        </div>
      </Router>
    </AuthContext.Provider>
  );
}
