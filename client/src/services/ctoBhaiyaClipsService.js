let cachedClips = null;
let pending = null;

const normalize = (s) => (s || '').trim().toLowerCase();

export async function loadCtoBhaiyaClips() {
    if (cachedClips) return cachedClips;
    if (pending) return pending;

    pending = fetch('/cto-bhaiya-patterns-clips.json', { cache: 'no-cache' })
        .then(async (res) => {
            if (!res.ok) {
                throw new Error(`Failed to load clip index (${res.status})`);
            }
            const data = await res.json();
            if (!Array.isArray(data)) return [];
            return data;
        })
        .catch(() => [])
        .finally(() => {
            pending = null;
        });

    cachedClips = await pending;
    return cachedClips;
}

export async function getCtoBhaiyaClip({ pattern, question }) {
    const clips = await loadCtoBhaiyaClips();
    const p = normalize(pattern);
    const q = normalize(question);

    return (
        clips.find((c) => normalize(c.pattern) === p && normalize(c.question) === q) ||
        null
    );
}
