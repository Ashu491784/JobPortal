import { createContext, useContext, useState } from "react";
import {
    collection, addDoc, getDocs, getDoc,
    doc, updateDoc, deleteDoc, query, where,
    orderBy, limit, startAfter, serverTimestamp
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "./AuthContext";

// Create Job Context
const JobContext = createContext();

// Custom hook
export function useJobs() {
    return useContext(JobContext);
}

// Job Provider
export function JobProvider({ children }) {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lastDoc, setLastDoc] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const { currentUser, userProfile } = useAuth();

    // ============================
    // POST NEW JOB
    // ============================
    async function postJob(jobData) {
        try {
            if (!currentUser || userProfile?.userType !== 'company') {
                throw new Error('Only companies can post jobs');
            }

            const jobDoc = {
                ...jobData,
                companyId: currentUser.uid,
                companyName: userProfile.companyName,
                companyLogo: userProfile.logo || '',
                postedAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                isActive: true,
                applicationCount: 0
            };

            const docRef = await addDoc(collection(db, 'jobs'), jobDoc);
            return docRef.id;

        } catch (error) {
            throw error;
        }
    }

    // ============================
    // FETCH JOBS (Filters + Pagination)
    // ============================
    async function fetchJobs(filters = {}, loadMore = false) {
        try {
            setLoading(true);

            let constraints = [where('isActive', '==', true)];

            // Filters
            if (filters.location && filters.location !== 'all') {
                constraints.push(where('location', '==', filters.location));
            }
            if (filters.jobType && filters.jobType !== 'all') {
                constraints.push(where('jobType', '==', filters.jobType));
            }
            if (filters.experienceLevel && filters.experienceLevel !== 'all') {
                constraints.push(where('experienceLevel', '==', filters.experienceLevel));
            }
            if (filters.industry && filters.industry !== 'all') {
                constraints.push(where('industry', '==', filters.industry));
            }

            constraints.push(orderBy('postedAt', 'desc'));
            constraints.push(limit(10));

            if (loadMore && lastDoc) {
                constraints.push(startAfter(lastDoc));
            }

            const jobQuery = query(collection(db, 'jobs'), ...constraints);

            const snapshot = await getDocs(jobQuery);

            const jobList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            if (loadMore) {
                setJobs(prev => [...prev, ...jobList]);
            } else {
                setJobs(jobList);
            }

            setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
            setHasMore(snapshot.docs.length === 10);

            return jobList;

        } catch (error) {
            console.error("Error fetching jobs:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    }

    // ============================
    // SEARCH JOBS
    // ============================
    async function searchJobs(searchTerm, filters = {}) {
        try {
            setLoading(true);

            let constraints = [where('isActive', '==', true)];

            if (filters.location && filters.location !== 'all') {
                constraints.push(where('location', '==', filters.location));
            }

            if (filters.jobType && filters.jobType !== 'all') {
                constraints.push(where('jobType', '==', filters.jobType));
            }

            constraints.push(orderBy('postedAt', 'desc'));

            const jobQuery = query(collection(db, 'jobs'), ...constraints);
            const snapshot = await getDocs(jobQuery);

            let jobList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Text Search
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();

                jobList = jobList.filter(job =>
                    job.title?.toLowerCase().includes(searchLower) ||
                    job.companyName?.toLowerCase().includes(searchLower) ||
                    job.description?.toLowerCase().includes(searchLower) ||
                    job.skills?.some(skill => skill.toLowerCase().includes(searchLower))
                );
            }

            setJobs(jobList);
            return jobList;

        } catch (error) {
            console.error("Error searching jobs:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    }

    // ============================
    // GET JOB BY ID
    // ============================
    async function getJobById(jobId) {
        try {
            const jobDoc = await getDoc(doc(db, 'jobs', jobId));
            if (jobDoc.exists()) {
                return { id: jobDoc.id, ...jobDoc.data() };
            }
            return null;

        } catch (error) {
            console.error("Error fetching job:", error);
            throw error;
        }
    }

    // COMPANY JOBS LIST
    async function getCompanyJobs() {
        try {
            if (!currentUser || userProfile?.userType !== 'company') return [];

            const q = query(
                collection(db, 'jobs'),
                where('companyId', '==', currentUser.uid),
                orderBy('postedAt', 'desc')
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

        } catch (error) {
            console.error("Error fetching company jobs:", error);
            throw error;
        }
    }


    // UPDATE JOB
  async function updateJob(jobId, updates) {
        try {
            if (!currentUser || userProfile?.userType !== 'company') {
                throw new Error("Only companies can update jobs");
            }

            const updateData = {
                ...updates,
                updatedAt: serverTimestamp()
            };

            await updateDoc(doc(db, 'jobs', jobId), updateData);
            return true;

        } catch (error) {
            throw error;
        }
    }


    // DELETE JOB
    async function deleteJob(jobId) {
        try {
            if (!currentUser || userProfile?.userType !== 'company') {
                throw new Error("Only companies can delete jobs");
            }

            await deleteDoc(doc(db, 'jobs', jobId));
            return true;

        } catch (error) {
            throw error;
        }
    }

    // APPLY TO JOB
    async function applyToJob(jobId, applicationData) {
        try {
            if (!currentUser || userProfile?.userType !== 'jobSeeker') {
                throw new Error("Only job seekers can apply");
            }

            const application = {
                ...applicationData,
                jobId,
                applicantId: currentUser.uid,
                applicantName: userProfile.firstName + " " + userProfile.lastName,
                applicantEmail: userProfile.email,
                appliedAt: serverTimestamp(),
                status: "pending"
            };

            await addDoc(collection(db, 'applications'), application);

            // Increase application count
            const jobRef = doc(db, 'jobs', jobId);
            const jobDoc = await getDoc(jobRef);

            if (jobDoc.exists()) {
                const currentCount = jobDoc.data().applicationsCount || 0;
                await updateDoc(jobRef, {
                    applicationsCount: currentCount + 1
                });
            }

            return true;

        } catch (error) {
            throw error;
        }
    }

    async function getJobApplications(jobId) {
        try {
            if (!currentUser || userProfile?.userType !== 'company') {
                throw new Error("Only companies can view applications");
            }

            const q = query(
                collection(db, 'applications'),
                where('jobId', '==', jobId),
                orderBy('appliedAt', 'desc')
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

        } catch (error) {
            console.error("Error fetching applications:", error);
            throw error;
        }
    }

    async function getUserApplications() {
        try {
            if (!currentUser || userProfile?.userType !== 'jobSeeker') return [];

            const q = query(
                collection(db, 'applications'),
                where('applicantId', '==', currentUser.uid),
                orderBy('appliedAt', 'desc')
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

        } catch (error) {
            console.error("Error fetching user applications:", error);
            throw error;
        }
    }

    const value = {
        jobs,
        loading,
        hasMore,
        postJob,
        fetchJobs,
        searchJobs,
        getJobById,
        getCompanyJobs,
        updateJob,
        deleteJob,
        applyToJob,
        getJobApplications,
        getUserApplications
    };

    return (
        <JobContext.Provider value={value}>
            {children}
        </JobContext.Provider>
    );
}