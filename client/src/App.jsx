import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { useAuth } from './context/AuthContext';
import Loader from './components/common/Loader';
import { FocusProvider } from './context/FocusContext';
import FloatingFocusTimer from './components/focus/FloatingFocusTimer';

// Lazy load pages for better performance
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const AuthSuccess = lazy(() => import('./pages/AuthSuccess'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const Patterns = lazy(() => import('./pages/Patterns'));
const PatternDetail = lazy(() => import('./pages/PatternDetail'));
const Problem = lazy(() => import('./pages/Problem'));
const Revisions = lazy(() => import('./pages/Revisions'));
const Pods = lazy(() => import('./pages/Pods'));
const DSAPatterns = lazy(() => import('./pages/DSAPatterns'));
const DSAItemDetail = lazy(() => import('./pages/DSAItemDetail'));
const CourseIndex = lazy(() => import('./pages/CourseIndex'));
const CourseLayout = lazy(() => import('./components/course/CourseLayout'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const PadhaiZone = lazy(() => import('./pages/PadhaiZone'));
const Settings = lazy(() => import('./pages/Settings'));
const Community = lazy(() => import('./pages/Community'));
const HowToEarn = lazy(() => import('./pages/HowToEarn'));
const SystemDesignCourse = lazy(() => import('./pages/SystemDesignCourse'));
const Syllabus = lazy(() => import('./pages/Syllabus'));
const SystemDesignSyllabus = lazy(() => import('./pages/SystemDesignSyllabus'));
const DBMSCourse = lazy(() => import('./pages/DBMSCourse'));
const DBMSSyllabus = lazy(() => import('./pages/DBMSSyllabus'));
const ChaiTapri = lazy(() => import('./pages/ChaiTapri'));
const About = lazy(() => import('./pages/About'));
const MockInterview = lazy(() => import('./pages/MockInterview'));
const InterviewHistory = lazy(() => import('./pages/InterviewHistory'));
const DSASyllabus = lazy(() => import('./pages/DSASyllabus'));
const RevisionPage = lazy(() => import('./pages/RevisionPage'));
const FocusMode = lazy(() => import('./pages/FocusMode'));
const FocusDashboard = lazy(() => import('./pages/FocusDashboard'));
const InterviewerDetail = lazy(() => import('./pages/InterviewerDetail'));
const InterviewerSelection = lazy(() => import('./pages/InterviewerSelection'));

// Mentorship Pages
const MentorConnect = lazy(() => import('./pages/MentorConnect'));
const MentorListing = lazy(() => import('./pages/MentorListing'));
const MentorProfile = lazy(() => import('./pages/MentorProfile'));
const CallRoom = lazy(() => import('./pages/CallRoom'));
// BecomeAMentor removed - mentors now login directly via /login?role=mentor

// Adaptive Revision Pages
const AdaptiveRevision = lazy(() => import('./pages/AdaptiveRevision'));
const RevisionQuizPage = lazy(() => import('./pages/RevisionQuizPage'));

// Doubt Solving System
const AskDoubt = lazy(() => import('./pages/AskDoubt'));
const DoubtDashboard = lazy(() => import('./pages/DoubtDashboard'));
const DoubtChatView = lazy(() => import('./pages/DoubtChatView'));
const StudentAnalytics = lazy(() => import('./pages/StudentAnalytics'));
const MentorAnalytics = lazy(() => import('./pages/MentorAnalytics'));
const MentorDashboard = lazy(() => import('./pages/MentorDashboard'));
const WalletPage = lazy(() => import('./pages/WalletPage'));
const MentorProfileSettings = lazy(() => import('./pages/MentorProfileSettings'));

// Admin Dashboard
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminHome = lazy(() => import('./pages/admin/AdminHome'));
const UserInspector = lazy(() => import('./pages/admin/UserInspector'));
const LiveOperations = lazy(() => import('./pages/admin/LiveOperations'));
const MentorOperations = lazy(() => import('./pages/admin/MentorOperations'));
const ServerHealth = lazy(() => import('./pages/admin/ServerHealth'));
const CouponGenerator = lazy(() => import('./pages/admin/CouponGenerator'));
const CourseManager = lazy(() => import('./pages/admin/CourseManager'));
const CommunityCommand = lazy(() => import('./pages/admin/CommunityCommand'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));

// Page loading fallback
const PageLoader = () => (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader />
    </div>
);

import { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client'; // Import io
import MaintenanceOverlay from './components/common/MaintenanceOverlay';

function App() {
    const { loading, user, logout } = useAuth(); // Destructure logout
    const [maintenance, setMaintenance] = useState({ enabled: false, message: '' });

    // Check system status
    const checkSystemStatus = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const { data } = await axios.get(`${API_URL}/public/config`);
            if (data.success && data.config?.maintenance) {
                setMaintenance(data.config.maintenance);
            }
        } catch (error) {
            console.error('Failed to check system status');
        }
    };

    useEffect(() => {
        checkSystemStatus();

        // Socket for system-wide events
        const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
        const socket = io(SOCKET_URL);

        socket.on('system:maintenance', (data) => {
            setMaintenance(data);
            if (data.enabled && user?.role !== 'admin') {
                logout(); // Logout immediately if maintenance starts
            }
        });

        // Poll every minute (backup)
        const interval = setInterval(checkSystemStatus, 60000);

        return () => {
            clearInterval(interval);
            socket.disconnect();
        };
    }, [user?.role]); // Re-run if role changes (though unlikely during session)

    // Show loader while checking auth
    if (loading) {
        return <Loader />;
    }

    // Show Maintenance Overlay if enabled and not admin
    if (maintenance.enabled && user?.role !== 'admin') {
        return <MaintenanceOverlay message={maintenance.message} onRefresh={checkSystemStatus} />;
    }

    return (
        <FocusProvider>
            <MainLayout>
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/auth-success" element={<AuthSuccess />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/patterns" element={<Patterns />} />
                        <Route path="/patterns/:slug" element={<PatternDetail />} />
                        <Route path="/problems/:slug" element={<Problem />} />
                        <Route path="/revisions" element={<Revisions />} />
                        <Route path="/pods" element={<Pods />} />
                        <Route path="/dsa" element={<DSAPatterns />} />
                        <Route path="/courses" element={<CourseIndex />} />
                        <Route path="/course/:courseId" element={<CourseLayout />} />
                        <Route path="/course/:courseId/:topicSlug" element={<CourseLayout />} />
                        <Route path="/leaderboard" element={<Leaderboard />} />
                        <Route path="/padhai-zone" element={<PadhaiZone />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/community" element={<Community />} />
                        <Route path="/how-to-earn" element={<HowToEarn />} />
                        <Route path="/system-design" element={<SystemDesignCourse />} />
                        <Route path="/system-design/:lessonId" element={<SystemDesignCourse />} />
                        <Route path="/syllabus/:courseId" element={<Syllabus />} />
                        <Route path="/system-design-syllabus" element={<SystemDesignSyllabus />} />
                        <Route path="/dbms" element={<DBMSCourse />} />
                        <Route path="/dbms/:lessonId" element={<DBMSCourse />} />
                        <Route path="/dbms-syllabus" element={<DBMSSyllabus />} />
                        <Route path="/chai-tapri" element={<ChaiTapri />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/mock-interview" element={<MockInterview />} />
                        <Route path="/interview-history" element={<InterviewHistory />} />
                        <Route path="/revision" element={<RevisionPage />} />
                        <Route path="/dsa-shuru-karein" element={<DSAPatterns />} />
                        <Route path="/dsa/:patternSlug/:itemSlug" element={<DSAItemDetail />} />
                        <Route path="/dsa-syllabus" element={<DSASyllabus />} />
                        <Route path="/interviewers/premium" element={<InterviewerSelection />} />
                        <Route path="/interviewer/:id" element={<InterviewerDetail />} />

                        {/* Focus Mode */}
                        <Route path="/focus" element={<FocusMode />} />
                        <Route path="/focus-dashboard" element={<FocusDashboard />} />

                        <Route path="/mentors" element={<MentorConnect />} />
                        <Route path="/mentors/list" element={<MentorListing />} />
                        <Route path="/mentors/:id" element={<MentorProfile />} />
                        <Route path="/mentor/:id" element={<MentorProfile />} />
                        <Route path="/call/:callId" element={<CallRoom />} />
                        {/* Mentor login handled via /login?role=mentor */}

                        {/* Adaptive Revision Routes */}
                        <Route path="/adaptive-revision" element={<AdaptiveRevision />} />
                        <Route path="/revision-quiz/:revisionId" element={<RevisionQuizPage />} />

                        {/* Doubt Solving System Routes */}
                        <Route path="/doubts" element={<DoubtDashboard />} />
                        <Route path="/doubts/ask" element={<AskDoubt />} />
                        <Route path="/doubts/:doubtId" element={<DoubtChatView />} />
                        <Route path="/doubts/analytics" element={<StudentAnalytics />} />
                        <Route path="/doubts/mentor-analytics" element={<MentorAnalytics />} />
                        <Route path="/mentor-dashboard" element={<MentorDashboard />} />
                        <Route path="/wallet" element={<WalletPage />} />
                        <Route path="/mentor/profile" element={<MentorProfileSettings />} />

                        {/* Admin Dashboard Routes */}
                        <Route path="/admin" element={<AdminDashboard />}>
                            <Route index element={<AdminHome />} />
                            <Route path="users" element={<UserInspector />} />
                            <Route path="courses" element={<CourseManager />} />
                            <Route path="community" element={<CommunityCommand />} />
                            <Route path="live" element={<LiveOperations />} />
                            <Route path="mentors" element={<MentorOperations />} />
                            <Route path="health" element={<ServerHealth />} />
                            <Route path="coupons" element={<CouponGenerator />} />
                            <Route path="settings" element={<AdminSettings />} />
                        </Route>
                    </Routes>
                </Suspense>
                <FloatingFocusTimer />
            </MainLayout>
        </FocusProvider>
    );
}

export default App;
