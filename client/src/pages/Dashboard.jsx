import DashboardLayout from '../components/dashboard/DashboardLayout';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import Hero from '../components/dashboard/Hero';
import Stats from '../components/dashboard/Stats';
import Roadmap from '../components/dashboard/Roadmap';
import ChatPanel from '../components/dashboard/ChatPanel';

export default function Dashboard() {
    // Mock user data
    const userData = {
        name: 'Babua',
        streakCount: 12,
        babuaCoins: 420,
        globalRank: 892,
    };

    return (
        <DashboardLayout>
            {/* Main Content */}

            <main className="flex-grow flex flex-col lg:flex-row max-w-[1400px] mx-auto w-full p-4 gap-6">
                {/* Left Column: Dashboard Main */}
                <div className="flex-1 flex flex-col gap-6">
                    <Hero />
                    <Stats userData={userData} />
                    <Roadmap />
                </div>

                {/* Right Column: Chai Tapri Sidebar */}
                <ChatPanel />
            </main>
        </DashboardLayout>
    );
}
