import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
    Briefcase, MapPin, Clock, DollarSign, Building, ChevronLeft,
    CheckCircle, Globe, Share2, AlertCircle, FileText, Send
} from 'lucide-react';
import Loader from '../components/common/Loader';
import { useAuth } from '../context/AuthContext';

const JobDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [applying, setApplying] = useState(false);
    const [applySuccess, setApplySuccess] = useState(false);
    const [applyError, setApplyError] = useState(null);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const { data } = await axios.get(`/api/jobs/${id}`);
                if (data.success) {
                    setJob(data.data);
                } else {
                    setError('Job not found');
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load job details');
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [id]);

    const handleApply = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (user.role !== 'student') {
            setApplyError('Only students can apply for jobs.');
            return;
        }

        setApplying(true);
        setApplyError(null);

        try {
            const { data } = await axios.post(`/api/jobs/${id}/apply`, {
                resumeSnapshot: user.resume || 'Default Profile Resume',
                skillSnapshot: user.skills || [],
                mentorRequest: false
            });

            if (data.success) {
                setApplySuccess(true);
            }
        } catch (err) {
            console.error(err);
            setApplyError(err.response?.data?.message || 'Failed to apply. Please try again.');
        } finally {
            setApplying(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
            <Loader />
        </div>
    );

    if (error || !job) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white p-6">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Job Not Found</h2>
            <p className="text-gray-400 mb-6">{error || "The job you're looking for doesn't exist."}</p>
            <Link to="/jobs" className="px-6 py-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors">
                Back to Jobs
            </Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white pb-20">
            {/* Header / Hero */}
            <div className="relative h-80 bg-gradient-to-b from-blue-900/20 to-[#0a0a0f]">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                <div className="container mx-auto px-6 h-full flex flex-col justify-center relative z-10">
                    <Link to="/jobs" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors w-fit">
                        <ChevronLeft className="w-5 h-5" />
                        Back to Opportunities
                    </Link>

                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                        <div className="w-24 h-24 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center shadow-xl">
                            <Building className="w-12 h-12 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{job.role}</h1>
                            <div className="flex items-center gap-3 text-lg text-gray-300">
                                <span className="font-semibold text-blue-400">{job.companyName}</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                                <span>{job.location || 'Remote'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 -mt-10 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Job Highlights */}
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-purple-400" />
                                Role Overview
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Type</p>
                                    <p className="font-semibold text-white">{job.jobType}</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Experience</p>
                                    <p className="font-semibold text-white">{job.experienceLevel}</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Salary</p>
                                    <p className="font-semibold text-white">{job.salaryRange || 'Competitive'}</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Date Posted</p>
                                    <p className="font-semibold text-white">{new Date(job.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-cyan-400" />
                                Description
                            </h2>
                            <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed whitespace-pre-line">
                                {job.description}
                            </div>
                        </div>

                        {/* Requirements */}
                        {job.requirements && (
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                    Requirements
                                </h2>
                                <ul className="space-y-3">
                                    {job.requirements.map((req, index) => (
                                        <li key={index} className="flex items-start gap-3 text-gray-300">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2.5 flex-shrink-0" />
                                            <span>{req}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {/* Fallback if requirements not array but string */}
                        {job.requiredSkills && typeof job.requirements !== 'object' && (
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl mt-6">
                                <h2 className="text-xl font-bold mb-6">Skills Required</h2>
                                <div className="flex flex-wrap gap-2">
                                    {job.requiredSkills.split(',').map(skill => (
                                        <span key={skill} className="px-3 py-1 bg-white/10 rounded-full text-sm border border-white/10">
                                            {skill.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar / Actions */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            {/* Apply Card */}
                            <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-xl border border-blue-500/30 rounded-3xl p-6 shadow-2xl">
                                <h3 className="text-2xl font-bold text-white mb-2">Ready to Apply?</h3>
                                <p className="text-gray-400 mb-6 text-sm">Join {job.companyName} and take the next step in your career.</p>

                                {applySuccess ? (
                                    <div className="bg-green-500/20 border border-green-500/50 rounded-2xl p-6 text-center">
                                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
                                            <CheckCircle className="w-8 h-8 text-white" />
                                        </div>
                                        <h4 className="text-xl font-bold text-white mb-1">Application Sent!</h4>
                                        <p className="text-green-300 text-sm">Best of luck! We'll notify you of updates.</p>
                                    </div>
                                ) : (
                                    <>
                                        {applyError && (
                                            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                                <p className="text-red-400 text-sm">{applyError}</p>
                                            </div>
                                        )}

                                        <button
                                            onClick={handleApply}
                                            disabled={applying}
                                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {applying ? (
                                                <>Processing...</>
                                            ) : (
                                                <>
                                                    <Send className="w-5 h-5" />
                                                    Apply Now
                                                </>
                                            )}
                                        </button>

                                        <p className="text-center text-gray-500 text-xs mt-4">
                                            Your profile & resume will be shared with the recruiter.
                                        </p>
                                    </>
                                )}
                            </div>

                            {/* Share */}
                            <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-gray-300 font-medium transition-colors flex items-center justify-center gap-2">
                                <Share2 className="w-4 h-4" />
                                Share Opportunity
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDetail;
