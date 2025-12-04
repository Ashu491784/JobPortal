import { useState, useEffect } from "react";
import { useJobs } from "../../context/JobContext";
import JobCard from "./Jobcard";
import JobSearch from "./JobSearch";
import LoadingSpinner from "../Common/LoadingSpinner";

export default function JobList() {
    const { jobs, loading, hasMore, fetchJobs, searchJobs } = useJobs();
    const [initialLoad, setInitialLoad] = useState(true);

    // Initial Load
    useEffect(() => {
        const loadInitialJobs = async () => {
            try {
                await fetchJobs();
                setInitialLoad(false);
            } catch (error) {
                console.error("Error loading jobs:", error);
                setInitialLoad(false);
            }
        };

        loadInitialJobs();
    }, []);

    const loadMoreJobs = async () => {
        try {
            await fetchJobs({}, true);
        } catch (error) {
            console.error("Error loading more jobs:", error);
        }
    };

    if (initialLoad) {
        return (
            <div className="job-container">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="jobs-container">
            <div className="jobs-header">
                <h1>Find your Dream Job</h1>
                <p>Discover opportunities from top companies</p>
            </div>

            <JobSearch
                searchJobs={searchJobs}
                fetchJobs={fetchJobs}
            />

            <div className="jobs-content">
                <div className="jobs-results">
                    <div className="results-header">
                        <h2>
                            {jobs.length > 0
                                ? `${jobs.length} job${jobs.length !== 1 ? "s" : ""} found`
                                : "No jobs found"}
                        </h2>
                    </div>

                    {jobs.length > 0 ? (
                        <>
                            <div className="jobs-grid">
                                {jobs.map((job) => (
                                    <JobCard key={job.id} job={job} />
                                ))}
                            </div>

                            {hasMore && (
                                <div className="load-more-container">
                                    <button
                                        className="load-more-btn"
                                        disabled={loading}
                                        onClick={loadMoreJobs}
                                    >
                                        {loading ? "Loading..." : "Load More Jobs"}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="no-jobs">
                            <div className="no-jobs-icon">🗑️</div>
                            <h3>No Jobs Found</h3>
                            <p>Try again or check back later for new opportunities</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
