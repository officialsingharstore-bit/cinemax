import tmdb from './api/tmdb.js';
import SearchSystem from './pages/search.js';
import './auth.js';

class App {
    constructor() {
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.searchSystem = new SearchSystem();
        await this.loadHeroSection();
        await this.loadDiscoveryRows();
    }

    setupEventListeners() {
        window.addEventListener('scroll', () => {
            const navbar = document.getElementById('navbar');
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });

        // Provider Filters
        const providerBtns = document.querySelectorAll('#providers .btn');
        providerBtns.forEach(btn => {
            btn.onclick = () => {
                providerBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filterByProvider(btn.textContent.trim());
            };
        });
    }

    async filterByProvider(provider) {
        console.log(`Filtering by provider: ${provider}`);
        // In a real app, this would add with_watch_providers param to TMDB calls
        // For now, we'll just refresh discovery rows to simulate filtering
        await this.loadDiscoveryRows();
    }

    async loadHeroSection() {
        const trending = await tmdb.getTrending('movie', 'week');
        if (!trending || !trending.results.length) return;

        const movie = trending.results[0];
        const details = await tmdb.getDetails('movie', movie.id);

        const heroTitle = document.getElementById('heroTitle');
        const heroOverview = document.getElementById('heroOverview');
        const heroRating = document.getElementById('heroRating');
        const heroYear = document.getElementById('heroYear');
        const heroGenres = document.getElementById('heroGenres');
        const heroBackdrop = document.getElementById('heroBackdrop');

        heroTitle.textContent = movie.title || movie.name;
        heroOverview.textContent = movie.overview;
        heroRating.textContent = movie.vote_average.toFixed(1);
        heroYear.textContent = (movie.release_date || movie.first_air_date || '').split('-')[0];
        heroBackdrop.src = tmdb.getImageUrl(movie.backdrop_path);
        
        if (details && details.genres) {
            heroGenres.textContent = details.genres.slice(0, 3).map(g => g.name).join(' • ');
        }

        // Hero Buttons
        const heroPlayBtn = document.getElementById('heroPlayBtn');
        const heroTrailerBtn = document.getElementById('heroTrailerBtn');
        
        heroPlayBtn.onclick = () => this.navigateToDetail(movie.title ? 'movie' : 'tv', movie.id);
        heroTrailerBtn.onclick = () => this.navigateToDetail(movie.title ? 'movie' : 'tv', movie.id);
    }

    async loadDiscoveryRows() {
        this.renderRow('trendingMovies', await tmdb.getTrending('movie', 'day'));
        this.renderRow('topRatedTV', await tmdb.getTopRated('tv'));
        this.renderRow('upcomingMovies', await tmdb.getUpcoming());
    }

    renderRow(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container || !data || !data.results) return;

        container.innerHTML = data.results.slice(0, 12).map(item => `
            <div class="movie-card" data-id="${item.id}" data-type="${item.title ? 'movie' : 'tv'}">
                <img src="${tmdb.getImageUrl(item.poster_path, 'w500')}" alt="${item.title || item.name}" loading="lazy">
                <div class="card-overlay">
                    <div class="card-title">${item.title || item.name}</div>
                    <div class="card-meta">
                        <span>${(item.release_date || item.first_air_date || '').split('-')[0]}</span>
                        <span><i class="fas fa-star" style="color: var(--accent-color)"></i> ${item.vote_average.toFixed(1)}</span>
                    </div>
                </div>
            </div>
        `).join('');

        // Add event listeners to cards
        container.querySelectorAll('.movie-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.dataset.id;
                const type = card.dataset.type;
                this.navigateToDetail(type, id);
            });
        });
    }

    navigateToDetail(type, id) {
        window.location.href = `detail.html?id=${id}&type=${type}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new App();
});
