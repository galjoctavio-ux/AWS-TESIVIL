import React, { createContext, useContext, useState, useEffect } from 'react';

// Mock User Type
type User = {
    id: string;
    email: string;
};

type AuthContextType = {
    user: User | null;
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
    isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    signIn: async () => { },
    signOut: async () => { },
    isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate checking for stored session
        setTimeout(() => {
            // Auto-login as test user for development
            setUser({ id: 'test-user-id', email: 'test@tesivil.com' });
            setIsLoading(false);
        }, 1000);
    }, []);

    const signIn = async () => {
        setIsLoading(true);
        // Simulate network request
        setTimeout(() => {
            setUser({ id: 'test-user-id', email: 'test@tesivil.com' });
            setIsLoading(false);
        }, 500);
    };

    const signOut = async () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, signIn, signOut, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};
