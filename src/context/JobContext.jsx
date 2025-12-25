import { createContext, useContext, useState, useEffect } from "react";
import {
    collection, addDoc, getDocs, getDoc,
    doc, updateDoc, deleteDoc, query, where,
    orderBy, limit, startAt, startAfter, serverTimestamp
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "./AuthContext";

//create Job context
const JobContext = createContext();

//cutom hook to use job context
export function useJobs() {
    return useContext(JobContext);
}

//Job provider component
export function JobProvider({ children }) {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lastDoc, setLastDoc] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const { currentUser, userProfile } = useAuth();

    // Post a new job (companies only)
    async function postJob(jobData) {
        try {
            if (!currentUser) {
                throw new Error('You must be logged in to post a job');
            }

            if (!userProfile || userProfile.userType !== 'company') {
                throw new Error('Only companies can post jobs');
            }

            console.log('Current user:', currentUser.uid); // Debug log
            console.log('User profile:', userProfile); // Debug log
            console.log('Job data being posted:', jobData); // Debug log

            // Ensure the job data includes the company ID
            const jobDoc = {
                ...jobData,
                companyId: currentUser.uid,
                postedAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            console.log('Final job document:', jobDoc); // Debug log

            const docRef = await addDoc(collection(db, 'jobs'), jobDoc);
            console.log('Job posted with ID:', docRef.id); // Debug log

            return docRef.id;
        } catch (error) {
            console.error('Error in postJob function:', error);
            throw error;
        }
    }

    // Fetch jobs with pagination and filters
    async function fetchJobs(filters = {}, loadMore = false) {
        try {
            setLoading(true);

            const jobCollection = collection(db, 'jobs');
            let constraints = [where('isActive', '==', true)];

            // Apply filters
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

            // Add ordering and pagination
            constraints.push(orderBy('postedAt', 'desc'));
            constraints.push(limit(10));

            if (loadMore && lastDoc) {
                constraints.push(startAfter(lastDoc));
            }

            const finalQuery = query(jobCollection, ...constraints);
            const snapshot = await getDocs(finalQuery);

            const jobList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            if (loadMore) {
                setJobs(prev => [...prev, ...jobList]);
            } else {
                setJobs(jobList);
            }

            // Update pagination state
            setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
            setHasMore(snapshot.docs.length === 10);

            return jobList;
        } catch (error) {
            console.error('Error fetching jobs:', error);

            // If it's a permission error, try a simpler query
            if (error.code === 'permission-denied') {
                try {
                    console.log('Trying simpler query due to permission error...');
                    const simpleQuery = query(
                        collection(db, 'jobs'),
                        where('isActive', '==', true),
                        orderBy('postedAt', 'desc'),
                        limit(10)
                    );

                    const snapshot = await getDocs(simpleQuery);
                    const jobList = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));

                    setJobs(jobList);
                    return jobList;
                } catch (simpleError) {
                    console.error('Simple query also failed:', simpleError);
                    throw simpleError;
                }
            }

            throw error;
        } finally {
            setLoading(false);
        }
    }

    //search jobs by title or company
    async function searchJobs(searchTerm, filters = {}) {
        try {
            setLoading(true);

            const jobCollection = collection(db, 'jobs');
            let constraints = [where('isActive', '==', true)];

            // Only add one server-side filter to avoid index requirements
            if (filters.location && filters.location !== 'all') {
                constraints.push(where('location', '==', filters.location));
            }

            constraints.push(orderBy('postedAt', 'desc'));
            const finalQuery = query(jobCollection, ...constraints);

            const snapshot = await getDocs(finalQuery);
            let jobList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Apply all other filters client-side
            if (filters.jobType && filters.jobType !== 'all') {
                jobList = jobList.filter(job => job.jobType === filters.jobType);
            }
            if (filters.experienceLevel && filters.experienceLevel !== 'all') {
                jobList = jobList.filter(job => job.experienceLevel === filters.experienceLevel);
            }
            if (filters.industry && filters.industry !== 'all') {
                jobList = jobList.filter(job => job.industry === filters.industry);
            }

            // Client-side search filtering
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
            console.error('Error searching jobs:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }

    //get single job by id
    async function getJobById(jobid) {
        try {
            const jobDoc = await getDoc(doc(db, 'jobs', jobid));
            if (jobDoc.exists()) {
                return {
                    id: jobDoc.id,
                    ...jobDoc.data()
                };
            }
            return null;
        } catch (error) {
            console.error('Error searching job', error);
            throw error;
        }
    }

    //get job posts for current company
    async function getCompanyJobs() {
        try {
            if (!currentUser || userProfile?.userType !== 'company') {
                return [];
            }

            const jobQuery = query(
                collection(db, 'jobs'),
                where('companyId', '===', currentUser.uid),
                orderBy('postedAt', 'desc')
            );
            const snapshot = await getDocs(jobQuery);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error fetching company jobs", error);
            throw error;
        }
    }

    //update job
    async function updateJob(jobId, updates) {
        try {
            if (!currentUser || userProfile?.userType !== 'company') {
                throw new Error('Only comapies can update jobs');
            }
            const updateData = {
                ...updates,
                updatedAt: serverTimestamp()
            }
            await updateDoc(doc(db, 'jobs', jobId), updateData);
            return true;
        } catch (error) {
            throw error;
        }
    }

    //delete job
    async function deleteJob(jobId) {
        try {
            if (!currentUser || userProfile?.userType !== 'company') {
                throw new Error('Only companies can delete jobs');
            }
            await deleteDoc(doc(db, 'jobs', jobId));
            return true;
        } catch (error) {
            throw error;
        }
    }

    //apply to job
    async function applyToJob(jobId, applicationData) {
        try {
            if (!currentUser || userProfile?.userType !== 'jobSeeker') {
                throw new Error('Only job seeeker can apply to jobs');
            }

            const application = {
                ...applicationData,
                applicantId: currentUser.uid,
                applicantName: userProfile.firstName + ' ' + userProfile.lastName,
                applicantEmail: userProfile.email,
                appliedAt: serverTimestamp(),
                status: 'pending'
            };

            await addDoc(collection(db, 'applications'), application);

            // Update job applications count
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

    // Get applications for a job
    async function getJobApplications(jobId) {
        try {
            if (!currentUser || userProfile?.userType !== 'company') {
                throw new Error('Only companies can view applications');
            }
            const applicationsQuery = query(
                collection(db, 'applications'),
                where('jobId', '==', jobId),
                orderBy('appliedAt', 'desc')
            );

            const snapshot = await getDocs(applicationsQuery);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error fetching applications:', error);
            throw error;
        }
    }

    // Get user's applications (job seeker view)
    async function getUserApplications() {
        try {
            if (!currentUser || userProfile?.userType !== 'job_seeker') {
                return [];
            }
            const applicationsQuery = query(
                collection(db, 'applications'),
                where('applicantId', '==', currentUser.uid),
                orderBy('appliedAt', 'desc')
            );

            const snapshot = await getDocs(applicationsQuery);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error fetching user applications:', error);
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