import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HeroSection from '../components/landing/HeroSection';
import GameMapSection from '../components/landing/GameMapSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import CTASection from '../components/landing/CTASection';
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
        <div className="min-h-screen bg-[#0b0f14]">
            <main className="pb-20 md:pb-24">
                <HeroSection />
                <GameMapSection />
                <TestimonialsSection />
                <CTASection />
            </main>
            <LandingFooter />
        </div>
    );
}
