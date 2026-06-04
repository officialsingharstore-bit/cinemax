import CONFIG from '../config.js';

class TMDBService {
    constructor() {
        this.apiKey = CONFIG.TMDB.API_KEY;
        this.baseUrl = CONFIG.TMDB.BASE_URL;
        this.imageBaseUrl = CONFIG.TMDB.IMAGE_BASE_URL;
    }

    async fetchFromTMDB(endpoint, params = {}) {
        const urlParams = new URLSearchParams({
            api_key: this.apiKey,
            ...params
        });
        const url = `${this.baseUrl}${endpoint}?${urlParams.toString()}`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('TMDB Fetch Error:', error);
            return null;
        }
    }

    getTrending(type = 'all', timeWindow = 'day') {
        return this.fetchFromTMDB(`/trending/${type}/${timeWindow}`);
    }

    getPopular(type = 'movie') {
        return this.fetchFromTMDB(`/${type}/popular`);
    }

    getTopRated(type = 'movie') {
        return this.fetchFromTMDB(`/${type}/top_rated`);
    }

    getUpcoming() {
        return this.fetchFromTMDB('/movie/upcoming');
    }

    getNowPlaying() {
        return this.fetchFromTMDB('/movie/now_playing');
    }

    getDetails(type, id) {
        return this.fetchFromTMDB(`/${type}/${id}`, {
            append_to_response: 'videos,credits,reviews,similar,recommendations'
        });
    }

    search(query, type = 'multi') {
        return this.fetchFromTMDB(`/search/${type}`, { query });
    }

    getSeasons(tvId, seasonNumber) {
        return this.fetchFromTMDB(`/tv/${tvId}/season/${seasonNumber}`);
    }

    getImageUrl(path, size = 'original') {
        if (!path) return 'https://via.placeholder.com/500x750?text=No+Image';
        return `${this.imageBaseUrl}/${size}${path}`;
    }
}

export default new TMDBService();
