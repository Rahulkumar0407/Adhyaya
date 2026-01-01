import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { useAuth } from './context/AuthContext';
import Loader from './components/common/Loader';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthSuccess from './pages/AuthSuccess';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Patterns from './pages/Patterns';
import PatternDetail from './pages/PatternDetail';
import Problem from './pages/Problem';
import Revisions from './pages/Revisions';
import Pods from './pages/Pods';
import DSAPatterns from './pages/DSAPatterns';
import DSAItemDetail from './pages/DSAItemDetail';
import CourseIndex from './pages/CourseIndex';
import CourseLayout from './components/course/CourseLayout';
import Leaderboard from './pages/Leaderboard';
import PadhaiZone from './pages/PadhaiZone';
import Settings from './pages/Settings';
import Community from './pages/Community';
import HowToEarn from './pages/HowToEarn';
import SystemDesignCourse from './pages/SystemDesignCourse';
import Syllabus from './pages/Syllabus';
import SystemDesignSyllabus from './pages/SystemDesignSyllabus';
import DBMSCourse from './pages/DBMSCourse';
import DBMSSyllabus from './pages/DBMSSyllabus';
import ChaiTapri from './pages/ChaiTapri';
import About from './pages/About';
import MockInterview from './pages/MockInterview';
import DSASyllabus from './pages/DSASyllabus';
import RevisionPage from './pages/RevisionPage';
import InterviewerSelection from './pages/InterviewerSelection';
import InterviewerDetail from './pages/InterviewerDetail';

// Mentorship Pages
import MentorConnect from './pages/MentorConnect';
import MentorListing from './pages/MentorListing';
import MentorProfile from './pages/MentorProfile';
import CallRoom from './pages/CallRoom';
import BecomeAMentor from './pages/BecomeAMentor';

// Adaptive Revision Pages
import AdaptiveRevision from './pages/AdaptiveRevision';
import RevisionQuizPage from './pages/RevisionQuizPage';

// Doubt Solving System
import AskDoubt from './pages/AskDoubt';
import DoubtDashboard from './pages/DoubtDashboard';
import DoubtChatView from './pages/DoubtChatView';
import StudentAnalytics from './pages/StudentAnalytics';
import MentorAnalytics from './pages/MentorAnalytics';
import MentorDashboard from './pages/MentorDashboard';
import WalletPage from './pages/WalletPage';
import MentorProfileSettings from './pages/MentorProfileSettings';

function App() {
    const { loading } = useAuth();

    // Show loader while checking auth
    if (loading) {
        return <Loader />;
    }

    return (
        <MainLayout>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
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
                <Route path="/revision" element={<RevisionPage />} />
                <Route path="/dsa" element={<DSAPatterns />} />
                <Route path="/dsa-shuru-karein" element={<DSAPatterns />} />
                <Route path="/dsa/:patternSlug/:itemSlug" element={<DSAItemDetail />} />
                <Route path="/dsa-syllabus" element={<DSASyllabus />} />
                <Route path="/interviewers/premium" element={<InterviewerSelection />} />
                <Route path="/interviewer/:id" element={<InterviewerDetail />} />

                {/* Mentorship Routes */}
                <Route path="/mentors" element={<MentorConnect />} />
                <Route path="/mentors/list" element={<MentorListing />} />
                <Route path="/mentors/:id" element={<MentorProfile />} />
                <Route path="/mentor/:id" element={<MentorProfile />} />
                <Route path="/call/:callId" element={<CallRoom />} />
                <Route path="/become-mentor" element={<BecomeAMentor />} />

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
            </Routes>
        </MainLayout>
    );
}

export default App;



