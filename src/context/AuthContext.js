// AI-assisted: see docs/AI_LOG.md #4
// Contexto de sesión del conductor: usuario de Firebase Auth + documento drivers/{uid} en Firestore.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  auth,
  db,
  doc,
  onAuthStateChanged,
  onSnapshot,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from '../services/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // usuario autenticado (o null si no hay sesión)
  const [user, setUser] = useState(null);
  // datos del conductor guardados en Firestore (null si aún no existen)
  const [driver, setDriver] = useState(null);
  // true mientras Firebase restaura la sesión al abrir la app
  const [initializing, setInitializing] = useState(true);
  // AI-assisted: see docs/AI_LOG.md #6
  // true mientras se envía el registro: al crear la cuenta, Firebase ya inicia sesión,
  // pero la app no debe pasar al Drawer hasta guardar el documento del conductor
  const [registering, setRegistering] = useState(false);

  // escucha los cambios de sesión; la limpieza cancela la suscripción al desmontar
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  // escucha en tiempo real el documento del conductor; se vuelve a suscribir si cambia el usuario
  useEffect(() => {
    if (!user) {
      setDriver(null);
      return undefined;
    }
    const unsubscribe = onSnapshot(
      doc(db, 'drivers', user.uid),
      (snapshot) => {
        setDriver(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null);
      },
      (error) => {
        console.log('Error escuchando el documento del conductor:', error);
        setDriver(null);
      },
    );
    return unsubscribe;
  }, [user]);

  // inicia sesión; los errores los traduce la pantalla con getAuthErrorMessage
  const signIn = useCallback((email, password) => {
    return signInWithEmailAndPassword(auth, email.trim(), password);
  }, []);

  const signOut = useCallback(() => firebaseSignOut(auth), []);

  // se memoriza el valor para no re-renderizar a todos los consumidores en cada render
  const value = useMemo(
    () => ({ user, driver, initializing, registering, setRegistering, signIn, signOut }),
    [user, driver, initializing, registering, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// hook para leer la sesión desde cualquier pantalla
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
