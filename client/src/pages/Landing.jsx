import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HeroSection from '../components/landing/HeroSection';
import StatsSection from '../components/landing/StatsSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import RoadmapSection from '../components/landing/RoadmapSection';
import LandingFooter from '../components/landing/LandingFooter';

export default function Landing() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    return (
        <div className="min-h-screen bg-[#1a1a1a]">
            <main>
                <HeroSection />
                <StatsSection />
                <FeaturesSection />
                <RoadmapSection />
            </main>
            <LandingFooter />
        </div>
    );
}

