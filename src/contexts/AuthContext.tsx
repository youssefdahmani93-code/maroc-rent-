import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { UserProfile } from '../types';
import { MOCK_USERS } from '../constants';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchUserProfile(session.user.email);
            } else {
                setLoading(false);
            }
        });

        // 2. Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchUserProfile(session.user.email);
            } else {
                setUserProfile(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchUserProfile = async (email: string | undefined) => {
        if (!email) return;

        // In a real app, you would fetch this from a 'profiles' table in Supabase.
        // For now, we will map the Supabase Auth user to our MOCK_USERS based on email
        // to keep the roles/permissions logic working without building a full admin panel yet.
        const mockProfile = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (mockProfile) {
            setUserProfile(mockProfile);
        } else {
            // Fallback for new users not in mock data
            setUserProfile({
                id: 'new-user',
                name: email.split('@')[0],
                email: email,
                role: 'AGENT', // Default role
                active: true,
                permissions: {
                    manageReservations: true,
                    manageContracts: true,
                    viewFinancials: false,
                    manageFleet: false,
                    manageMaintenance: false,
                    manageUsers: false,
                    downloadReports: false
                }
            } as UserProfile);
        }
        setLoading(false);
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUserProfile(null);
    };

    return (
        <AuthContext.Provider value={{ session, user, userProfile, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
