import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Heart } from 'lucide-react';

export default function Footer({ transparent = false }) {
    return (
        <footer className={`${transparent ? 'bg-[#0d1117]/70 backdrop-blur-md' : 'bg-babua-dark'} border-t border-white/10`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <img src="/favicon.png" alt="Adhyaya Logo" className="w-8 h-8 object-contain" />
                            <span className="text-xl font-bold text-white">
                                ADHYAYA
                            </span>
                        </Link>
                        <p className="text-white/60 max-w-md">
                            Empowering India's engineering talent. Hamara mission: Har engineer ko haath mein offer letter.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold text-white mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/chai-tapri" className="text-white/60 hover:text-white transition-colors">
                                    Community
                                </Link>
                            </li>
                            <li>
                                <Link to="/rewards" className="text-white/60 hover:text-white transition-colors">
                                    Rewards
                                </Link>
                            </li>
                            <li>
                                <Link to="/profile" className="text-white/60 hover:text-white transition-colors">
                                    Profile
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="text-white/60 hover:text-white transition-colors">
                                    About
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-white mb-4">Resources</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/patterns" className="text-white/60 hover:text-white transition-colors">
                                    DSA Patterns
                                </Link>
                            </li>
                            <li>
                                <Link to="/system-design" className="text-white/60 hover:text-white transition-colors">
                                    System Design
                                </Link>
                            </li>
                            <li>
                                <Link to="/dbms" className="text-white/60 hover:text-white transition-colors">
                                    DBMS
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-white/40 text-sm flex items-center gap-1">
                        © 2025 ADHYAYA. Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> in Bharat 🇮🇳
                    </p>

                    <div className="flex items-center gap-4">
                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-white/40 hover:text-white transition-colors"
                        >
                            <Github size={20} />
                        </a>
                        <a
                            href="https://twitter.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-white/40 hover:text-white transition-colors"
                        >
                            <Twitter size={20} />
                        </a>
                        <a
                            href="https://linkedin.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-white/40 hover:text-white transition-colors"
                        >
                            <Linkedin size={20} />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
