import { useState, useEffect } from 'react';
import { User, Toast } from '../types.ts';
import { auth } from '../services/firebase.ts';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, updatePassword as firebaseUpdatePassword } from 'firebase/auth';

// --- Developer Settings ---
export const ADMIN_EMAIL = "aclass00@gmail.com"; 

interface AuthHookProps {
    addToast?: (message: string, type: Toast['type']) => void;
}

export const useAuth = ({ addToast }: AuthHookProps = {}) => {
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        // Listen for Firebase auth state changes
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                // Convert Firebase user object to our own user object
                setUser({
                    email: firebaseUser.email || '',
                    passwordHash: 'secured_by_firebase' // We don't store passwords locally
                });
            } else {
                setUser(null);
            }
            setAuthLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            if(addToast) addToast("Logged in successfully", "success");
            return true;
        } catch (error: any) {
            console.error("Login Error:", error.code, error.message);
            return false;
        }
    };

    const register = async (email: string, password: string): Promise<boolean> => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            if(addToast) addToast("Account created successfully", "success");
            return true;
        } catch (error: any) {
            console.error("Register Error:", error.code, error.message);
            return false;
        }
    };

    const devLogin = async (): Promise<boolean> => {
        try {
            await signInWithEmailAndPassword(auth, ADMIN_EMAIL, 'password123');
            return true;
        } catch (error) {
            console.error("Developer Login Failed", error);
            if(addToast) addToast("Developer login failed. Ensure the account exists and the password is 'password123'", "error");
            return false;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
        } catch (error) {
            console.error("Logout Error", error);
        }
    };

    const requestDeleteAccount = () => {
        if(addToast) addToast("This feature requires additional Firebase setup (Cloud Functions) for secure deletion.", "info");
    };

    const cancelDeleteAccount = () => {
        // Placeholder
    };

    const updatePassword = (oldPass: string, newPass: string): boolean => {
        // Firebase Password update requires re-authentication usually
        if (auth.currentUser) {
            firebaseUpdatePassword(auth.currentUser, newPass).then(() => {
                if(addToast) addToast("Password updated successfully", "success");
            }).catch((err) => {
                if(addToast) addToast("Error: Re-authentication is required to change password", "error");
            });
            return true;
        }
        return false;
    };

    return {
        user,
        authLoading,
        login,
        register,
        devLogin, // Re-added
        logout,
        requestDeleteAccount,
        cancelDeleteAccount,
        updatePassword
    };
};