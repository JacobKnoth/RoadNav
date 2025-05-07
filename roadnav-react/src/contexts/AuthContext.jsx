import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../services/firebase.js';
//import type { User } from 'firebase/auth';
import { GoogleAuthProvider, signInWithPopup, signOut,
         onAuthStateChanged, signInWithEmailAndPassword,
         createUserWithEmailAndPassword } from 'firebase/auth';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null);
  const [loading, setLoading] = useState(true);

  /* handler helpers */
  const googleLogin = () =>
    signInWithPopup(auth, new GoogleAuthProvider());
  const logout = () => signOut(auth);

  /* observe auth changes */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  /* build the context value *after* state & handlers exist */
  const value = { user, googleLogin, logout };

  return (
    <AuthCtx.Provider value={value}>
      {loading ? null : children}
    </AuthCtx.Provider>
  );
}

