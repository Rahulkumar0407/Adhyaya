const resolveBackendBaseUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    if (apiUrl) {
        return apiUrl.replace(/\/api\/?$/, '');
    }

    if (typeof window !== 'undefined' && window.location?.origin) {
        return window.location.origin;
    }

    return 'http://localhost:5000';
};

export const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;

    if (avatarPath.startsWith('http')) {
        return avatarPath;
    }

    const BASE_URL = resolveBackendBaseUrl().replace(/\/$/, '');
    const cleanPath = avatarPath.startsWith('/') ? avatarPath : `/${avatarPath}`;

    return `${BASE_URL}${cleanPath}`;
};

export const getInitialsDataUrl = (name = '') => {
    const initials = (name || 'B').split(' ').map(n => n.charAt(0)).join('').slice(0,2).toUpperCase();
    const bg = '#f97316';
    const fg = '#fff';
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'><rect width='100%' height='100%' fill='${bg}' rx='128' ry='128'/><text x='50%' y='50%' dy='.08em' text-anchor='middle' fill='${fg}' font-family='system-ui, Arial, sans-serif' font-size='110' font-weight='700'>${initials}</text></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};
