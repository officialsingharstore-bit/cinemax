import tmdb from '../api/tmdb.js';
import '../auth.js';
import PremiumPlayer from '../components/video-player.js';
import storage from '../api/storage.js';
import { auth } from '../api/firebase.js';

class DetailPage {
    constructor() {
        this.params = new URLSearchParams(window.location.search);
        this.id = this.params.get('id');
        this.type = this.params.get('type') || 'movie';
        this.init();
    }

    async init() {
        if (!this.id) {
            window.location.href = 'index.html';
            return;
        }

        const data = await tmdb.getDetails(this.type, this.id);
        if (!data) return;

        this.renderHero(data);
        this.renderCast(data.credits.cast);
        this.renderSimilar(data.similar.results);

        if (this.type === 'tv') {
            this.setupTVFeatures(data);
        }

        this.setupPlayer(data);
        this.setupUserActions(data);
        this.loadReviews();
    }

    async loadReviews() {
        const reviewList = document.getElementById('reviewList');
        const reviews = await storage.getReviews(this.id);
        
        if (reviews.length > 0) {
            reviewList.innerHTML = reviews.map(r => `
                <div style="background: rgba(255,255,255,0.02); padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem; border: 1px solid var(--glass-border);">
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                        <img src="${r.userPhoto || 'https://i.pravatar.cc/40'}" style="width: 40px; height: 40px; border-radius: 50%;">
                        <div>
                            <div style="font-weight: 600;">${r.userName}</div>
                            <div style="font-size: 0.8rem; color: var(--text-secondary);">${new Date(r.createdAt.seconds * 1000).toLocaleDateString()}</div>
                        </div>
                    </div>
                    <p style="color: var(--text-secondary);">${r.review}</p>
                </div>
            `).join('');
        }
    }

    setupUserActions(data) {
        const watchlistBtn = document.getElementById('watchlistBtn');
        const favoriteBtn = document.getElementById('favoriteBtn');
        const submitReviewBtn = document.getElementById('submitReviewBtn');
        const reviewText = document.getElementById('reviewText');

        submitReviewBtn.onclick = async () => {
            if (!auth.currentUser) {
                alert('Please login to post a review');
                return;
            }
            const text = reviewText.value.trim();
            if (!text) return;

            await storage.addReview(this.id, text);
            reviewText.value = '';
            this.loadReviews();
        };

        watchlistBtn.onclick = async () => {
            if (!auth.currentUser) {
                alert('Please login to add to watchlist');
                return;
            }
            const item = {
                id: data.id,
                title: data.title || data.name,
                poster_path: data.poster_path,
                type: this.type,
                vote_average: data.vote_average
            };
            await storage.addToWatchlist(item);
            watchlistBtn.innerHTML = '<i class="fas fa-check"></i> In Watchlist';
            watchlistBtn.classList.add('active');
        };

        favoriteBtn.onclick = async () => {
            if (!auth.currentUser) {
                alert('Please login to favorite');
                return;
            }
            const item = {
                id: data.id,
                title: data.title || data.name,
                poster_path: data.poster_path,
                type: this.type,
                vote_average: data.vote_average
            };
            await storage.addToFavorites(item);
            favoriteBtn.style.color = 'var(--primary-color)';
        };
    }

    renderHero(data) {
        document.getElementById('titleName').textContent = data.title || data.name;
        document.getElementById('overview').textContent = data.overview;
        document.getElementById('voteAverage').textContent = data.vote_average.toFixed(1);
        document.getElementById('releaseYear').textContent = (data.release_date || data.first_air_date || '').split('-')[0];
        document.getElementById('runtime').textContent = this.type === 'movie' ? `${data.runtime} min` : `${data.number_of_seasons} Seasons`;
        document.getElementById('genres').textContent = data.genres.map(g => g.name).join(' • ');
        document.getElementById('backdrop').src = tmdb.getImageUrl(data.backdrop_path);
        
        if (this.type === 'tv' && data.seasons.length > 0) {
            this.currentSeason = data.seasons[0].season_number;
        }

        document.title = `${data.title || data.name} | CinemaX`;
    }

    renderCast(cast) {
        const grid = document.getElementById('castGrid');
        grid.innerHTML = cast.slice(0, 12).map(person => `
            <div class="cast-card">
                <div class="movie-card" style="aspect-ratio: 2/3;">
                    <img src="${tmdb.getImageUrl(person.profile_path, 'w500')}" alt="${person.name}">
                    <div class="card-overlay" style="opacity: 1; transform: translateY(0); background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);">
                        <div class="card-title" style="font-size: 0.9rem;">${person.name}</div>
                        <div class="card-meta" style="font-size: 0.7rem;">${person.character}</div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderSimilar(similar) {
        const grid = document.getElementById('similarGrid');
        grid.innerHTML = similar.slice(0, 12).map(item => `
            <div class="movie-card" data-id="${item.id}" data-type="${item.title ? 'movie' : 'tv'}">
                <img src="${tmdb.getImageUrl(item.poster_path, 'w500')}" alt="${item.title || item.name}">
                <div class="card-overlay">
                    <div class="card-title">${item.title || item.name}</div>
                    <div class="card-meta">
                        <span>${(item.release_date || item.first_air_date || '').split('-')[0]}</span>
                        <span><i class="fas fa-star" style="color: var(--accent-color)"></i> ${item.vote_average.toFixed(1)}</span>
                    </div>
                </div>
            </div>
        `).join('');

        grid.querySelectorAll('.movie-card').forEach(card => {
            card.onclick = () => {
                window.location.href = `detail.html?id=${card.dataset.id}&type=${card.dataset.type}`;
            };
        });
    }

    setupTVFeatures(data) {
        const seasonSection = document.getElementById('seasonSection');
        const selector = document.getElementById('seasonSelector');
        seasonSection.style.display = 'block';

        selector.innerHTML = data.seasons.map(s => `<option value="${s.season_number}">${s.name}</option>`).join('');
        selector.onchange = (e) => this.loadEpisodes(e.target.value);

        // Load first season by default
        if (data.seasons.length) {
            this.loadEpisodes(data.seasons[0].season_number);
        }
    }

    async loadEpisodes(seasonNumber) {
        const episodesGrid = document.getElementById('episodeGrid');
        episodesGrid.innerHTML = '<p>Loading episodes...</p>';
        
        const seasonData = await tmdb.getSeasons(this.id, seasonNumber);
        if (!seasonData) return;

        episodesGrid.innerHTML = seasonData.episodes.map(ep => `
            <div class="movie-card episode-card" data-episode="${ep.episode_number}" style="aspect-ratio: 16/9;">
                <img src="${tmdb.getImageUrl(ep.still_path, 'w500')}" alt="${ep.name}">
                <div class="card-overlay" style="opacity: 1; transform: translateY(0); background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);">
                    <div class="card-title">${ep.episode_number}. ${ep.name}</div>
                    <div class="card-meta">${ep.runtime || '-'} min</div>
                </div>
            </div>
        `).join('');

        episodesGrid.querySelectorAll('.episode-card').forEach(card => {
            card.onclick = () => {
                const epNum = card.dataset.episode;
                this.playEpisode(seasonNumber, epNum);
            };
        });
    }

    playEpisode(season, episode) {
        const modal = document.getElementById('videoModal');
        const container = document.getElementById('playerContainer');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        new PremiumPlayer(container, {
            type: 'tv',
            id: this.id,
            title: document.getElementById('titleName').textContent,
            season: season,
            episode: episode
        });
    }

    setupPlayer(data) {
        const modal = document.getElementById('videoModal');
        const container = document.getElementById('playerContainer');
        const playBtn = document.getElementById('playBtn');
        const trailerBtn = document.getElementById('trailerBtn');
        const closeBtn = document.getElementById('closePlayer');

        const showPlayer = (videoId = null) => {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // If it's a trailer, use TMDB video ID
            if (videoId) {
                container.innerHTML = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}?autoplay=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
            } else {
                new PremiumPlayer(container, {
                    type: this.type,
                    id: this.id,
                    title: data.title || data.name,
                    season: this.currentSeason || 1,
                    episode: 1
                });
            }
        };

        playBtn.onclick = () => showPlayer();
        
        trailerBtn.onclick = () => {
            const trailer = data.videos.results.find(v => v.type === 'Trailer') || data.videos.results[0];
            if (trailer) showPlayer(trailer.key);
            else alert('Trailer not available');
        };

        closeBtn.onclick = () => {
            modal.classList.remove('active');
            container.innerHTML = '';
            document.body.style.overflow = 'auto';
        };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DetailPage();
});
