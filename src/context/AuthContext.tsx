import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile as fbUpdateProfile,
  fbSignOut, 
  onAuthStateChanged, 
  db, 
  doc, 
  getDoc, 
  setDoc,
  updateDoc
} from '../lib/firebase';
import { UserProfile, UserRole, UserStatus, FileVisibility } from '../types';
import { PERSONAL_CONFIG, isAuthorizedOwnerEmail } from '../config/personalData';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  role: UserRole;
  status: UserStatus;
  isActive: boolean;
  isPending: boolean;
  isSuspended: boolean;
  isDenied: boolean;
  isOwner: () => boolean;
  hasRole: (requiredRole: UserRole) => boolean;
  canRead: (visibility: FileVisibility, fileOwnerId?: string) => boolean;
  canWrite: () => boolean;
  canDelete: () => boolean;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string, photo?: string) => Promise<UserProfile>;
  sendPasswordReset: (email: string) => Promise<void>;
  updateProfileData: (displayName: string, photoURL?: string) => Promise<void>;
  signInWithGoogle: () => Promise<UserProfile | null>;
  signInAsDemo: (demoRole: UserRole, demoStatus?: UserStatus) => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [demoState, setDemoState] = useState<{ role: UserRole; status: UserStatus } | null>(() => {
    const savedRole = localStorage.getItem('as_demo_role') as UserRole;
    const savedStatus = (localStorage.getItem('as_demo_status') as UserStatus) || 'active';
    return savedRole ? { role: savedRole, status: savedStatus } : null;
  });

  const fetchUserProfile = async (fbUser: FirebaseUser): Promise<UserProfile> => {
    const isOwnerEmail = isAuthorizedOwnerEmail(fbUser.email);
    
    // Sync claims with server via Firebase Admin SDK
    try {
      const idToken = await fbUser.getIdToken();
      await fetch('/api/auth/sync-claims', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
      });
      // Force refresh the token to pull newly minted custom claims into the client
      await fbUser.getIdToken(true);
    } catch (claimErr) {
      console.warn('[AUTH CLAIMS SYNC]:', claimErr);
    }

    // Inspect authenticated token claims
    let tokenClaimsRole: UserRole | undefined;
    let tokenClaimsStatus: UserStatus | undefined;
    try {
      const tokenResult = await fbUser.getIdTokenResult();
      if (tokenResult.claims.role === 'OWNER' || tokenResult.claims.owner === true) {
        tokenClaimsRole = 'OWNER';
        tokenClaimsStatus = 'active';
      } else if (tokenResult.claims.role) {
        tokenClaimsRole = tokenResult.claims.role as UserRole;
        tokenClaimsStatus = (tokenResult.claims.status as UserStatus) || 'active';
      }
    } catch (e) {
      console.warn('Could not read token claims:', e);
    }

    const userDocRef = doc(db, 'users', fbUser.uid);
    let userSnap;
    try {
      userSnap = await getDoc(userDocRef);
    } catch (e) {
      console.warn('Could not read user doc from remote:', e);
    }

    const defaultRole: UserRole = tokenClaimsRole || (isOwnerEmail ? 'OWNER' : 'LIMITED');
    const defaultStatus: UserStatus = tokenClaimsStatus || (isOwnerEmail ? 'active' : 'pending');

    if (userSnap && userSnap.exists()) {
      const data = userSnap.data() as UserProfile;
      // If token claims confirm OWNER, ensure profile matches
      if ((tokenClaimsRole === 'OWNER' || isOwnerEmail) && (data.role !== 'OWNER' || data.status !== 'active')) {
        const updated = { ...data, role: 'OWNER' as UserRole, status: 'active' as UserStatus, email: fbUser.email || data.email };
        try { await setDoc(userDocRef, updated, { merge: true }); } catch (e) {}
        return updated;
      }
      return data;
    } else {
      const newProfile: UserProfile = {
        uid: fbUser.uid,
        displayName: fbUser.displayName || (isOwnerEmail ? 'Ahmmad Sakib (Owner)' : 'Digital Explorer'),
        email: fbUser.email || '',
        photoURL: fbUser.photoURL || '',
        role: defaultRole,
        status: defaultStatus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      try {
        await setDoc(userDocRef, newProfile);
      } catch (err) {
        console.warn('Local profile initialized for session:', err);
      }
      return newProfile;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      if (fbUser) {
        try {
          const userProf = await fetchUserProfile(fbUser);
          setProfile(userProf);
        } catch (err: any) {
          console.error('Error fetching user profile:', err);
        }
      } else {
        if (demoState) {
          setProfile({
            uid: `demo-${demoState.role.toLowerCase()}`,
            displayName: demoState.role === 'OWNER' ? 'Ahmmad Sakib (Demo Owner)' : `${demoState.role} Member`,
            email: demoState.role === 'OWNER' ? PERSONAL_CONFIG.ownerEmail : `guest-${demoState.role.toLowerCase()}@vault.secure`,
            photoURL: '',
            role: demoState.role,
            status: demoState.status,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
          });
        } else {
          setProfile(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [demoState]);

  const refreshProfile = async () => {
    if (user) {
      const updated = await fetchUserProfile(user);
      setProfile(updated);
    }
  };

  const effectiveRole: UserRole = demoState ? demoState.role : profile?.role || 'LIMITED';
  const effectiveStatus: UserStatus = demoState ? demoState.status : profile?.status || 'pending';

  const isActive = effectiveStatus === 'active';
  const isPending = effectiveStatus === 'pending';
  const isSuspended = effectiveStatus === 'suspended' || effectiveStatus === 'disabled';
  const isDenied = effectiveStatus === 'denied';

  const isOwner = (): boolean => {
    if (effectiveRole === 'OWNER') return true;
    if (isAuthorizedOwnerEmail(user?.email) || isAuthorizedOwnerEmail(profile?.email)) return true;
    return false;
  };

  const hasRole = (requiredRole: UserRole): boolean => {
    if (effectiveRole === 'OWNER') return true;
    if (requiredRole === 'LIMITED') return true;
    if (requiredRole === 'TRUSTED' && effectiveRole === 'TRUSTED') return true;
    return false;
  };

  const canRead = (visibility: FileVisibility, fileOwnerId?: string): boolean => {
    if (visibility === 'PUBLIC') return true;
    if (!isActive) return false;
    if (!user && !demoState) return false;
    if (effectiveRole === 'OWNER') return true;
    if (effectiveRole === 'TRUSTED') {
      return visibility === 'SHARED' || (fileOwnerId === (user?.uid || profile?.uid));
    }
    if (effectiveRole === 'LIMITED') {
      return fileOwnerId === (user?.uid || profile?.uid);
    }
    return false;
  };

  const canWrite = (): boolean => {
    if (!isActive) return false;
    return effectiveRole === 'OWNER' || effectiveRole === 'TRUSTED';
  };

  const canDelete = (): boolean => {
    if (!isActive) return false;
    return effectiveRole === 'OWNER';
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setError(null);
    try {
      setLoading(true);
      localStorage.removeItem('as_demo_role');
      localStorage.removeItem('as_demo_status');
      setDemoState(null);
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      console.error('Email sign in error:', err);
      let msg = 'Failed to authenticate. Please check your email and password.';
      if (err.code === 'auth/user-not-found') msg = 'Account not found. Please create an account.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') msg = 'Invalid credentials provided.';
      if (err.code === 'auth/invalid-email') msg = 'Please enter a valid email address.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string, photo?: string): Promise<UserProfile> => {
    setError(null);
    try {
      setLoading(true);
      localStorage.removeItem('as_demo_role');
      localStorage.removeItem('as_demo_status');
      setDemoState(null);

      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const fbUser = userCredential.user;

      // Update Firebase Auth profile
      if (name || photo) {
        try {
          await fbUpdateProfile(fbUser, {
            displayName: name,
            photoURL: photo || ''
          });
        } catch (e) {
          console.warn('Profile name update error:', e);
        }
      }

      const isOwnerEmail = email.toLowerCase() === PERSONAL_CONFIG.ownerEmail.toLowerCase();
      const newProfile: UserProfile = {
        uid: fbUser.uid,
        displayName: name || 'Digital Explorer',
        email: email,
        photoURL: photo || '',
        role: isOwnerEmail ? 'OWNER' : 'LIMITED',
        status: isOwnerEmail ? 'active' : 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      const userDocRef = doc(db, 'users', fbUser.uid);
      try {
        await setDoc(userDocRef, newProfile);
      } catch (err) {
        console.warn('Failed saving user doc in Firestore:', err);
      }

      setProfile(newProfile);
      return newProfile;
    } catch (err: any) {
      console.error('Sign up error:', err);
      let msg = 'Failed to create account.';
      if (err.code === 'auth/email-already-in-use') msg = 'This email address is already registered. Please login instead.';
      if (err.code === 'auth/weak-password') msg = 'Password should be at least 6 characters.';
      if (err.code === 'auth/invalid-email') msg = 'Please enter a valid email address.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordReset = async (email: string) => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      console.error('Password reset error:', err);
      let msg = 'Failed to dispatch password reset email.';
      if (err.code === 'auth/user-not-found') msg = 'No account found with this email.';
      if (err.code === 'auth/invalid-email') msg = 'Please enter a valid email address.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const updateProfileData = async (displayName: string, photoURL?: string) => {
    if (!user && !demoState) throw new Error('Not authenticated');
    
    if (user) {
      try {
        await fbUpdateProfile(user, { displayName, photoURL });
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          displayName,
          photoURL: photoURL || '',
          updatedAt: new Date().toISOString()
        });
      } catch (e) {
        console.warn('Profile update warning:', e);
      }
    }

    setProfile(prev => prev ? {
      ...prev,
      displayName,
      photoURL: photoURL !== undefined ? photoURL : prev.photoURL,
      updatedAt: new Date().toISOString()
    } : null);
  };

  const signInWithGoogle = async (): Promise<UserProfile | null> => {
    setError(null);
    try {
      setLoading(true);
      localStorage.removeItem('as_demo_role');
      localStorage.removeItem('as_demo_status');
      setDemoState(null);
      const cred = await signInWithPopup(auth, googleProvider);
      const userProf = await fetchUserProfile(cred.user);
      setProfile(userProf);
      setUser(cred.user);
      return userProf;
    } catch (err: any) {
      console.error('Google Sign-in error:', err);
      const msg = err.message || 'Failed to authenticate via Google.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const signInAsDemo = (role: UserRole, status: UserStatus = 'active') => {
    localStorage.setItem('as_demo_role', role);
    localStorage.setItem('as_demo_status', status);
    setDemoState({ role, status });
    setProfile({
      uid: `demo-${role.toLowerCase()}-${status}`,
      displayName: role === 'OWNER' ? 'Ahmmad Sakib (Demo Owner)' : `${role} Member (${status.toUpperCase()})`,
      email: role === 'OWNER' ? PERSONAL_CONFIG.ownerEmail : `user-${role.toLowerCase()}@vault.internal`,
      photoURL: '',
      role: role,
      status: status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    });
  };

  const signOut = async () => {
    setError(null);
    try {
      localStorage.removeItem('as_demo_role');
      localStorage.removeItem('as_demo_status');
      setDemoState(null);
      await fbSignOut(auth);
      setProfile(null);
      setUser(null);
    } catch (err: any) {
      console.error('Sign-out error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        role: effectiveRole,
        status: effectiveStatus,
        isActive,
        isPending,
        isSuspended,
        isDenied,
        isOwner,
        hasRole,
        canRead,
        canWrite,
        canDelete,
        signInWithEmail,
        signUpWithEmail,
        sendPasswordReset,
        updateProfileData,
        signInWithGoogle,
        signInAsDemo,
        signOut,
        refreshProfile,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
