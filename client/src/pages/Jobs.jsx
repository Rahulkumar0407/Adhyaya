import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Clock, DollarSign, Building, Search, Filter, SlidersHorizontal, ChevronRight } from 'lucide-react';
import Loader from '../components/common/Loader';
import { useAuth } from '../context/AuthContext';

// Filter Options
const JOB_TYPES = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance'];
const EXPERIENCE_LEVELS = ['Entry Level', 'Mid Level', 'Senior', 'Lead', 'Executive'];

const Jobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters State
    const [filters, setFilters] = useState({
        search: '',
        type: '',
        experience: ''
    });

    // Debounced search term
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce logic
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(filters.search);
        }, 500);
        return () => clearTimeout(timer);
    }, [filters.search]);

    // Fetch Jobs
    useEffect(() => {
        const fetchJobs = async () => {
            setLoading(true);
            try {
                const params = {};
                if (debouncedSearch) params.search = debouncedSearch;
                if (filters.type) params.type = filters.type;
                if (filters.experience) params.experience = filters.experience;

                const { data } = await axios.get('/api/jobs', { params });

                if (data.success) {
                    setJobs(data.data);
                    setError(null);
                } else {
                    setError('Failed to load jobs');
                }
            } catch (err) {
                console.error(err);
                setError('Could not fetch jobs. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, [debouncedSearch, filters.type, filters.experience]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
            {/* Background Gradients */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative z-10 container mx-auto px-6 py-12 max-w-6xl">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
                            <Building className="w-3 h-3" />
                            Career Center
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
                            Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Dream Job</span>
                        </h1>
                        <p className="text-gray-400 text-lg">Curated opportunities from top tech companies.</p>
                    </div>

                    {/* Stats or Action */}
                    <Link to="/profile" className="hidden md:flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium">
                        Update Profile
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Search & Filter Bar */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-10 shadow-2xl">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search Input */}
                        <div className="flex-1 relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search role, company, or skills..."
                                className="w-full bg-[#0a0a0f] border border-white/10 text-white pl-12 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 placeholder:text-gray-600 transition-all font-medium"
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex gap-4 overflow-x-auto pb-1 lg:pb-0">
                            {/* Job Type Filter */}
                            <div className="relative min-w-[160px]">
                                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                <select
                                    className="w-full bg-[#0a0a0f] border border-white/10 text-gray-300 pl-10 pr-8 py-3.5 rounded-xl focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer hover:border-white/20 transition-colors text-sm font-medium"
                                    value={filters.type}
                                    onChange={(e) => handleFilterChange('type', e.target.value)}
                                >
                                    <option value="">All Job Types</option>
                                    {JOB_TYPES.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Experience Filter */}
                            <div className="relative min-w-[160px]">
                                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                <select
                                    className="w-full bg-[#0a0a0f] border border-white/10 text-gray-300 pl-10 pr-8 py-3.5 rounded-xl focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer hover:border-white/20 transition-colors text-sm font-medium"
                                    value={filters.experience}
                                    onChange={(e) => handleFilterChange('experience', e.target.value)}
                                >
                                    <option value="">All Experience</option>
                                    {EXPERIENCE_LEVELS.map(exp => (
                                        <option key={exp} value={exp}>{exp}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader />
                    </div>
                ) : error ? (
                    <div className="text-center py-20 bg-red-500/5 rounded-2xl border border-red-500/20">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Filter className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Oops! Something went wrong</h3>
                        <p className="text-gray-400">{error}</p>
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="text-center py-32 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                        <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="w-10 h-10 text-gray-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">No jobs found</h3>
                        <p className="text-gray-400 max-w-md mx-auto">
                            We couldn't find any positions matching your criteria. Try adjusting your filters or search terms.
                        </p>
                        <button
                            onClick={() => setFilters({ search: '', type: '', experience: '' })}
                            className="mt-6 px-6 py-2.5 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {jobs.map((job) => (
                            <Link
                                to={`/jobs/${job._id}`}
                                key={job._id}
                                className="group relative bg-[#12121a] hover:bg-[#1a1a24] border border-white/5 hover:border-blue-500/30 rounded-2xl p-6 md:p-8 transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] hover:-translate-y-1 block"
                            >
                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    <div className="flex gap-6">
                                        {/* Company Logo / Placeholder */}
                                        <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-blue-500/30 group-hover:scale-105 transition-all shadow-lg">
                                            <Building className="w-8 h-8 md:w-10 md:h-10 text-gray-500 group-hover:text-blue-400 transition-colors" />
                                        </div>

                                        <div>
                                            <h2 className="text-xl md:text-2xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                                                {job.role}
                                            </h2>
                                            <div className="flex items-center gap-2 text-gray-400 font-medium mb-3">
                                                <span>{job.companyName}</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {job.location || 'Remote'}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap gap-2.5">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                    <Briefcase className="w-3 h-3" />
                                                    {job.jobType}
                                                </span>
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                                    <Clock className="w-3 h-3" />
                                                    {job.experienceLevel}
                                                </span>
                                                {job.salaryRange && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                        <DollarSign className="w-3 h-3" />
                                                        {job.salaryRange}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-between items-end pl-0 md:pl-6 border-l border-transparent md:border-white/5">
                                        <span className="text-xs text-gray-500 font-medium mb-4 md:mb-0">
                                            Posted {new Date(job.createdAt).toLocaleDateString()}
                                        </span>

                                        <div className="flex items-center gap-2 text-blue-400 font-bold text-sm bg-blue-500/10 px-4 py-2 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-all">
                                            View Details
                                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Jobs;
