import { useState } from "react";
import {
    JOB_TYPES,
    EXPERIENCE_LEVELS,
    LOCATIONS,
    INDUSTRIES
} from "../../utils/constants";

import "./jobs.css";

export default function JobSearch({ onSearch, searchJobs, fetchJobs }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({
        location: "all",
        jobType: "all",
        experienceLevel: "all",
        industry: "all",
        salaryRange: "all"
    });
    const [showAdvanced, setShowAdvanced] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            if (searchTerm.trim()) {
                await searchJobs(searchTerm, filters);
            } else {
                await fetchJobs(filters);
            }
        } catch (error) {
            console.error("Search error:", error);
        }
    };

    const handleFilterChange = (filterName, value) => {
        setFilters((prev) => ({
            ...prev,
            [filterName]: value,
        }));
    };

    const clearFilters = () => {
        setSearchTerm("");
        setFilters({
            location: "all",
            jobType: "all",
            experienceLevel: "all",
            industry: "all",
            salaryRange: "all"
        });
    };

    return (
        <div className="job-search">
            <div className="search-container">
                <form onSubmit={handleSearch} className="search-form">

                    {/* Search Bar */}
                    <div className="search-main">
                        <div className="search-input-group">
                            <input
                                type="text"
                                placeholder="Search jobs, companies"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />

                            <button type="submit" className="search-button">
                                <span>🔎</span> Search
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="search-filters">
                        <div className="filter-row">

                            {/* Location Dropdown */}
                            <select
                                value={filters.location}
                                onChange={(e) =>
                                    handleFilterChange("location", e.target.value)
                                }
                                className="filter-select"
                            >
                                <option value="all">All Locations</option>
                                {Object.values(LOCATIONS).map((loc) => (
                                    <option key={loc} value={loc}>
                                        {loc}
                                    </option>
                                ))}
                            </select>

                            {/* Job Type Dropdown */}
                            <select
                                value={filters.jobType}
                                onChange={(e) =>
                                    handleFilterChange("jobType", e.target.value)
                                }
                                className="filter-select"
                            >
                                <option value="all">All Job Types</option>
                                {Object.values(JOB_TYPES).map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>

                            {/* Experience Level */}
                            <select
                                value={filters.experienceLevel}
                                onChange={(e) =>
                                    handleFilterChange("experienceLevel", e.target.value)
                                }
                                className="filter-select"
                            >
                                <option value="all">All Experience Levels</option>
                                {Object.values(EXPERIENCE_LEVELS).map((level) => (
                                    <option key={level} value={level}>
                                        {level}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Advanced Filters */}
                        {showAdvanced && (
                            <div className="filter-row advanced">

                                {/* Industry */}
                                <select
                                    value={filters.industry}
                                    onChange={(e) =>
                                        handleFilterChange("industry", e.target.value)
                                    }
                                    className="filter-select"
                                >
                                    <option value="all">All Industries</option>
                                    {Object.values(INDUSTRIES).map((ind) => (
                                        <option key={ind} value={ind}>
                                            {ind}
                                        </option>
                                    ))}
                                </select>

                                {/* Salary Range */}
                                <select
                                    value={filters.salaryRange}
                                    onChange={(e) =>
                                        handleFilterChange("salaryRange", e.target.value)
                                    }
                                    className="filter-select"
                                >
                                    <option value="all">All Salary Ranges</option>
                                    <option value="0-30K">0 - 30K</option>
                                    <option value="30K-50K">30K - 50K</option>
                                    <option value="50K-75K">50K - 75K</option>
                                    <option value="75K-100K">75K - 100K</option>
                                    <option value="100K-150K">100K - 150K</option>
                                </select>

                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="clear-filters"
                                >
                                    Clear All
                                </button>
                            </div>
                        )}
                    </div>
                </form>

                <button
                    type="button"
                    className="advanced-toggle"
                    onClick={() => setShowAdvanced((prev) => !prev)}
                >
                    {showAdvanced ? "Hide Advanced Filters ▲" : "Advanced Filters ▼"}
                </button>
            </div>
        </div>
    );
}
