// src/context/AuthContext.js
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { supabase } from '../../config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);      // auth.users
  const [profile, setProfile] = useState(null); // public.profiles
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const syncUserAndProfile = async (authUser) => {
      if (!isMounted) return;

      setUser(authUser);

      if (!authUser) {
        setProfile(null);
        return;
      }

      try {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();

        if (!isMounted) return;

        if (error) {
          console.log('Profile load error:', error);
          setProfile(null);
        } else {
          setProfile(profileData ?? null);
        }
      } catch (e) {
        if (!isMounted) return;
        console.log('Unexpected profile load error:', e);
        setProfile(null);
      }
    };

    const init = async () => {
      try {
        // Use getSession instead of getUser for better session handling
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (error) {
          console.log('Auth init error:', error);
          setUser(null);
          setProfile(null);
        } else {
          const authUser = session?.user ?? null;
          await syncUserAndProfile(authUser);
        }
      } catch (e) {
        if (!isMounted) return;
        console.log('Unexpected auth init error:', e);
        setUser(null);
        setProfile(null);
      } finally {
        if (isMounted) setInitializing(false);
      }
    };

    init();

    // Listen for login / logout / token refresh
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event); // Helpful for debugging
      
      // Handle different auth events
      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        console.log('User signed out or deleted');
        if (isMounted) {
          setUser(null);
          setProfile(null);
        }
        return;
      }

      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
      }

      if (event === 'SIGNED_IN') {
        console.log('User signed in');
      }

      // Sync user and profile for all events
      const authUser = session?.user ?? null;
      if (isMounted) {
        await syncUserAndProfile(authUser);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

const signOut = async () => {
  try {
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Sign out error:', error);
      throw error;
    }
    
    // Clear local state
    setUser(null);
    setProfile(null);
    
    console.log('User signed out successfully');
  } catch (error) {
    console.error('Unexpected sign out error:', error);
    setUser(null);
    setProfile(null);
  }
};

  const value = {
    user,       // auth user
    profile,    // row from public.profiles
    initializing,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use in screens
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return ctx;
};