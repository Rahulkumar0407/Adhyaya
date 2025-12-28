import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';

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
import DSALearning from './pages/DSALearning';
import CourseIndex from './pages/CourseIndex';
import CourseLayout from './components/course/CourseLayout';
import Leaderboard from './pages/Leaderboard';

function App() {
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
                <Route path="/dsa" element={<DSALearning />} />
                <Route path="/courses" element={<CourseIndex />} />
                <Route path="/course/:courseId" element={<CourseLayout />} />
                <Route path="/course/:courseId/:topicSlug" element={<CourseLayout />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
            </Routes>
        </MainLayout>
    );
}

export default App;
