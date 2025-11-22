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
          .single();

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
        const { data, error } = await supabase.auth.getUser();
        if (!isMounted) return;

        if (error) {
          console.log('Auth init error:', error);
          setUser(null);
          setProfile(null);
        } else {
          const authUser = data?.user ?? null;
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
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const authUser = session?.user ?? null;
      // fire and forget; syncUserAndProfile handles errors
      syncUserAndProfile(authUser);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      // onAuthStateChange will clear user & profile
    } catch (e) {
      console.log('Error on signOut:', e);
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
