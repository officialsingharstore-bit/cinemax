import CONFIG from '../config.js';

class TraktService {
    constructor() {
        this.clientId = CONFIG.TRAKT.CLIENT_ID;
        this.clientSecret = CONFIG.TRAKT.CLIENT_SECRET;
        this.baseUrl = CONFIG.TRAKT.BASE_URL;
        this.redirectUri = CONFIG.TRAKT.REDIRECT_URI;
        this.accessToken = localStorage.getItem('trakt_access_token');
    }

    getAuthUrl() {
        return `${this.baseUrl}/oauth/authorize?response_type=code&client_id=${this.clientId}&redirect_uri=${this.redirectUri}`;
    }

    async exchangeCodeForToken(code) {
        try {
            const response = await fetch(`${this.baseUrl}/oauth/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    code,
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    redirect_uri: this.redirectUri,
                    grant_type: 'authorization_code'
                })
            });
            const data = await response.json();
            if (data.access_token) {
                this.accessToken = data.access_token;
                localStorage.setItem('trakt_access_token', data.access_token);
                localStorage.setItem('trakt_refresh_token', data.refresh_token);
                return data;
            }
            return null;
        } catch (error) {
            console.error('Trakt Auth Error:', error);
            return null;
        }
    }

    async fetchFromTrakt(endpoint, method = 'GET', body = null) {
        const headers = {
            'Content-Type': 'application/json',
            'trakt-api-version': '2',
            'trakt-api-key': this.clientId
        };

        if (this.accessToken) {
            headers['Authorization'] = `Bearer ${this.accessToken}`;
        }

        try {
            const options = { method, headers };
            if (body) options.body = JSON.stringify(body);

            const response = await fetch(`${this.baseUrl}${endpoint}`, options);
            if (!response.ok) throw new Error('Trakt API request failed');
            return await response.json();
        } catch (error) {
            console.error('Trakt Fetch Error:', error);
            return null;
        }
    }

    getTrendingMovies() {
        return this.fetchFromTrakt('/movies/trending');
    }

    getTrendingShows() {
        return this.fetchFromTrakt('/shows/trending');
    }

    async syncWatchlist(items) {
        if (!this.accessToken) return null;
        return this.fetchFromTrakt('/sync/watchlist', 'POST', { movies: items.movies, shows: items.shows });
    }

    async getWatchlist(type = 'movies') {
        if (!this.accessToken) return null;
        return this.fetchFromTrakt(`/sync/watchlist/${type}`);
    }

    async addToHistory(item) {
        if (!this.accessToken) return null;
        return this.fetchFromTrakt('/sync/history', 'POST', item);
    }
}

export default new TraktService();
