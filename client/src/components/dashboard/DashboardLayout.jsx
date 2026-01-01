export default function DashboardLayout({ children }) {
    return (
        <div className="relative min-h-screen flex flex-col bg-background-dark text-white font-mono antialiased overflow-x-hidden selection:bg-neon-blue selection:text-black">
            {children}
        </div>
    );
}
