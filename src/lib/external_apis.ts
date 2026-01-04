
// 2. CONFIGURATION DES SERVICES (APIs)

// Hardcoded Fallbacks per User Request (Brute Force)
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || "AIzaSyCzV2W9A0uabnVtjHGdf6feRxonSqOv3eE";
const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY || "dc668dbe93mshd9339ebeb16c41cp1f00ffjsn71738a938f5e";

// Cache map to avoid hitting API limits during session
const videoCache = new Map<string, string>();
const gifCache = new Map<string, string>();

/**
 * UTILITY: Cleans exercise name for Search Optimization
 * - Converts to Lowercase
 * - Removes special characters (accents, parentheses)
 */
const cleanForSearch = (name: string): string => {
    return name
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^a-z0-9\s]/g, "") // Remove special chars
        .trim();
};

/**
 * Searches YouTube - FAIL SAFE CASCADE
 * 1. Clean Name
 * 2. Try Exact: "[Name] perfect form"
 * 3. Try Broad: "[Name] fitness guide"
 */
export const fetchExerciseVideo = async (exerciseName: string): Promise<string | null> => {
    const cleanedName = cleanForSearch(exerciseName);

    if (videoCache.has(cleanedName)) return videoCache.get(cleanedName) || null;

    if (!YOUTUBE_API_KEY) {
        console.warn("YouTube API Key is missing");
        return null;
    }

    const performSearch = async (query: string) => {
        try {
            const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${encodeURIComponent(query)}&type=video&key=${YOUTUBE_API_KEY}`);
            if (!response.ok) return null;
            const data = await response.json();
            if (data.items && data.items.length > 0) {
                return data.items[0].id.videoId;
            }
            return null;
        } catch (e: any) {
            console.error("YouTube Search Error Full Details:", e, JSON.stringify(e));
            if (e?.result?.error?.message) console.error("API Message:", e.result.error.message);
            return null;
        }
    };

    // Attempt 1: Precise
    let videoId = await performSearch(`${cleanedName} perfect form`);

    // Attempt 2: Broad Fallback
    if (!videoId) {
        console.log(`YouTube: Precise search failed for ${cleanedName}, trying broad...`);
        videoId = await performSearch(`${cleanedName} fitness guide`);
    }

    if (videoId) {
        const videoUrl = `https://www.youtube.com/embed/${videoId}`;
        videoCache.set(cleanedName, videoUrl);
        return videoUrl;
    }

    return null; // UI handles null
};

/**
 * Fetches GIF from ExerciseDB - FAIL SAFE CASCADE
 * 1. Clean Name
 * 2. Try ExerciseDB API (2s Timeout)
 * 3. FALLBACK: Pollinations.ai (Instant Generation)
 *    Prompt: "fitness illustration of [Name], neon green style, anatomical guide"
 */
/**
 * Fetches Exercise Image using Wikimedia Commons (Open Source)
 * - Translates FR -> EN
 * - Searches Wikimedia for "File:[EnglishName] exercise"
 * - Fallback to Giphy if nothing found
 */
export const fetchExerciseGif = async (exerciseName: string): Promise<string> => {
    // 1. Translation Dictionary (FR -> EN)
    const translations: Record<string, string> = {
        "tractions": "pull up",
        "traction": "pull up",
        "pompes": "push up",
        "pompe": "push up",
        "squats": "squat",
        "squat": "squat",
        "fentes": "lunge",
        "fentes avants": "lunge",
        "fentes arrières": "lunge",
        "planche": "plank",
        "gainage": "plank",
        "abdominaux": "crunches",
        "abdos": "crunches",
        "burpees": "burpee",
        "step-ups": "step up",
        "step up": "step up",
        "dips": "dips",
        "mountain climbers": "mountain climber",
        "développé couché": "bench press",
        "développé militaire": "overhead press",
        "soulevé de terre": "deadlift",
        "rowing barre": "bent over row",
        "hip thrust": "hip thrust",
        "fentes bulgares": "bulgarian split squat"
    };

    const cleanName = (name: string) => {
        let cleaned = name.toLowerCase().trim();
        if (translations[cleaned]) return translations[cleaned];

        // Fuzzy
        if (cleaned.includes("pompes")) return "push up";
        if (cleaned.includes("tractions")) return "pull up";
        if (cleaned.includes("squat")) return "squat";

        // Clean
        cleaned = cleaned.replace(/-/g, " ").replace(/[()]/g, "").trim();

        // Singularize (simple)
        if (cleaned.endsWith('s') && !cleaned.endsWith('ss')) cleaned = cleaned.slice(0, -1);

        return cleaned;
    };

    const failSafeUrl = "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJueGZ3bmZ3bmZ3/3o7TKMGpxx8y90/giphy.gif"; // Generique neon fallback
    const finalQuery = cleanName(exerciseName);

    if (gifCache.has(finalQuery)) return gifCache.get(finalQuery) || failSafeUrl;

    console.log(`Wikimedia: Searching for "${finalQuery}"...`);

    try {
        // Construct Wikimedia Query
        const searchTerms = [
            `File:${finalQuery} exercise`,
            `File:${finalQuery} fitness`,
            `File:${finalQuery}`
        ];

        for (const q of searchTerms) {
            const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=pageimages|imageinfo&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrlimit=1&piprop=thumbnail&pithumbsize=500&origin=*`;

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                if (data.query && data.query.pages) {
                    const pages = Object.values(data.query.pages);
                    if (pages.length > 0) {
                        const page: any = pages[0];
                        if (page.thumbnail && page.thumbnail.source) {
                            const imgUrl = page.thumbnail.source.replace('http://', 'https://');
                            console.log(`Wikimedia: Found for ${finalQuery} -> ${imgUrl}`);
                            gifCache.set(finalQuery, imgUrl);
                            return imgUrl;
                        }
                    }
                }
            }
        }
    } catch (e) {
        console.warn("Wikimedia Fetch Error:", e);
    }

    console.warn(`Wikimedia: No result for ${finalQuery}, using fallback.`);
    return failSafeUrl;
};

/**
 * Generates TikTok Deep Link
 */
export const getTikTokUrl = (exerciseName: string): string => {
    const cleaned = cleanForSearch(exerciseName);
    return `https://www.tiktok.com/search?q=${encodeURIComponent(cleaned + " tuto")}`;
};
