import { createContext, useContext, useEffect, useState } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { USER_TYPES } from '../utils/constants';

// Create authentication context
const AuthContext = createContext();

// Custom hook to use auth context
export function useAuth() {
    return useContext(AuthContext);
}

// Authentication provider component
export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Register new job seeker
    async function signupJobSeeker(email, password, userData) {
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);

            await updateProfile(result.user, {
                displayName: `${userData.firstName} ${userData.lastName}`
            });

            // Save user profile to Firestore
            const profileData = {
                ...userData,
                userType: USER_TYPES.JOB_SEEKER,
                email: email,
                uid: result.user.uid,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            await setDoc(doc(db, 'users', result.user.uid), profileData);
            setUserProfile(profileData);

            return result;
        } catch (error) {
            throw error;
        }
    }

    // Register new company
    async function signupCompany(email, password, companyData) {
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);

            await updateProfile(result.user, {
                displayName: companyData.companyName
            });

            // Save company profile to Firestore
            const profileData = {
                ...companyData,
                userType: USER_TYPES.COMPANY,
                email: email,
                uid: result.user.uid,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isVerified: false // Companies need verification
            };

            await setDoc(doc(db, 'users', result.user.uid), profileData);
            await setDoc(doc(db, 'companies', result.user.uid), profileData);
            setUserProfile(profileData);

            return result;
        } catch (error) {
            throw error;
        }
    }

    // Login existing user
    async function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    // Logout current user
    function logout() {
        setUserProfile(null);
        return signOut(auth);
    }

    // Fetch user profile data
    async function fetchUserProfile(uid) {
        try {
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
                const profileData = userDoc.data();
                setUserProfile(profileData);
                return profileData;
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
        return null;
    }

    // Update user profile
    async function updateUserProfile(updates) {
        try {
            if (!currentUser) throw new Error('No user logged in');

            const updatedData = {
                ...updates,
                updatedAt: new Date().toISOString()
            };

            await setDoc(doc(db, 'users', currentUser.uid), updatedData, { merge: true });

            // Update company collection if user is a company
            if (userProfile?.userType === USER_TYPES.COMPANY) {
                await setDoc(doc(db, 'companies', currentUser.uid), updatedData, { merge: true });
            }

            setUserProfile(prev => ({ ...prev, ...updatedData }));
            return true;
        } catch (error) {
            throw error;
        }
    }

    // Listen for authentication state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(user);
                await fetchUserProfile(user.uid);
            } else {
                setCurrentUser(null);
                setUserProfile(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // Context value object
    const value = {
        currentUser,
        userProfile,
        signupJobSeeker,
        signupCompany,
        login,
        logout,
        updateUserProfile,
        fetchUserProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}