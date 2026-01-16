import { Link } from 'react-router-dom';
import { prefetchRoute } from '../../utils/routePrefetch';

/**
 * A Link component that prefetches the target route's component on hover.
 * This makes navigation feel instant by loading the component before click.
 * 
 * Usage: Drop-in replacement for react-router-dom's Link component.
 */
export default function PrefetchLink({ to, children, onMouseEnter, ...props }) {
    const handleMouseEnter = (e) => {
        // Prefetch the route
        if (typeof to === 'string') {
            prefetchRoute(to);
        } else if (to?.pathname) {
            prefetchRoute(to.pathname);
        }

        // Call original onMouseEnter if provided
        if (onMouseEnter) {
            onMouseEnter(e);
        }
    };

    return (
        <Link to={to} onMouseEnter={handleMouseEnter} {...props}>
            {children}
        </Link>
    );
}
