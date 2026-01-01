import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin } from 'lucide-react';

const footerLinks = {
    product: {
        title: 'Maal-Paani (Product)',
        links: [
            { name: 'Features', href: '/patterns' },
            { name: 'Pricing', href: '/pricing' },
            { name: 'Roadmap', href: '/roadmap' },
        ],
    },
    resources: {
        title: 'Gyaan (Resources)',
        links: [
            { name: 'Blog', href: '/blog' },
            { name: 'Community', href: '/community' },
            { name: 'Success Stories', href: '/stories' },
        ],
    },
    company: {
        title: 'Apni Company',
        links: [
            { name: 'About Us', href: '/about' },
            { name: 'Naukri (Careers)', href: '/careers' },
            { name: 'Sampark Karein', href: '/contact' },
        ],
    },
};

export default function LandingFooter() {
    return (
        <footer className="bg-[#0f0f0f] border-t border-gray-800">
            <div className="container-babua py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                    {/* Brand Column */}
                    <div className="lg:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <img src="/favicon.png" alt="Adhyaya Logo" className="w-8 h-8 object-contain" />
                            <span className="text-xl font-bold text-white">ADHYAYA</span>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                            Empowering India's engineering talent. Hamra mission: Har engineer ko haath mein offer lettar.
                        </p>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h3 className="text-gray-300 font-semibold mb-4">{footerLinks.product.title}</h3>
                        <ul className="space-y-3">
                            {footerLinks.product.links.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.href}
                                        className="text-gray-400 hover:text-orange-400 transition-colors text-sm"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources Links */}
                    <div>
                        <h3 className="text-gray-300 font-semibold mb-4">{footerLinks.resources.title}</h3>
                        <ul className="space-y-3">
                            {footerLinks.resources.links.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.href}
                                        className="text-gray-400 hover:text-orange-400 transition-colors text-sm"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h3 className="text-gray-300 font-semibold mb-4">{footerLinks.company.title}</h3>
                        <ul className="space-y-3">
                            {footerLinks.company.links.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.href}
                                        className="text-gray-400 hover:text-orange-400 transition-colors text-sm"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-gray-500 text-sm">
                        © 2024 ADHYAYA. Made with <span className="text-red-500">❤</span> & LIT Choklet.
                    </p>

                    {/* Social Links */}
                    <div className="flex items-center gap-4">
                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
                        >
                            <Github className="w-5 h-5 text-gray-400" />
                        </a>
                        <a
                            href="https://twitter.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
                        >
                            <Twitter className="w-5 h-5 text-gray-400" />
                        </a>
                        <a
                            href="https://linkedin.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
                        >
                            <Linkedin className="w-5 h-5 text-gray-400" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
