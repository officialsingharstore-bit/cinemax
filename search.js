import tmdb from '../api/tmdb.js';

class SearchSystem {
    constructor() {
        this.searchInput = document.querySelector('.search-input');
        this.resultsContainer = document.getElementById('searchResults');
        this.timeout = null;
        this.init();
    }

    init() {
        if (!this.searchInput) return;

        this.searchInput.addEventListener('input', (e) => {
            clearTimeout(this.timeout);
            const query = e.target.value.trim();
            
            if (query.length > 2) {
                this.timeout = setTimeout(() => this.performSearch(query), 500);
            } else {
                this.clearResults();
            }
        });
    }

    async performSearch(query) {
        const results = await tmdb.search(query);
        if (!results || !results.results.length) {
            this.showNoResults();
            return;
        }

        this.renderResults(results.results);
    }

    renderResults(items) {
        // Create a search results overlay if it doesn't exist
        let overlay = document.getElementById('searchOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'searchOverlay';
            overlay.className = 'search-overlay';
            document.body.appendChild(overlay);
        }

        overlay.innerHTML = `
            <div class="search-results-container">
                <div class="section-title">Search Results</div>
                <div class="movie-grid">
                    ${items.map(item => `
                        <div class="movie-card" data-id="${item.id}" data-type="${item.title ? 'movie' : 'tv'}">
                            <img src="${tmdb.getImageUrl(item.poster_path, 'w500')}" alt="${item.title || item.name}">
                            <div class="card-overlay">
                                <div class="card-title">${item.title || item.name}</div>
                                <div class="card-meta">
                                    <span>${(item.release_date || item.first_air_date || '').split('-')[0]}</span>
                                    <span><i class="fas fa-star" style="color: var(--accent-color)"></i> ${item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <button class="close-search btn btn-secondary"><i class="fas fa-times"></i> Close</button>
            </div>
        `;

        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        overlay.querySelector('.close-search').onclick = () => this.clearResults();
        
        overlay.querySelectorAll('.movie-card').forEach(card => {
            card.onclick = () => {
                const id = card.dataset.id;
                const type = card.dataset.type;
                this.clearResults();
                window.location.href = `detail.html?id=${id}&type=${type}`;
            };
        });
    }

    clearResults() {
        const overlay = document.getElementById('searchOverlay');
        if (overlay) {
            overlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }

    showNoResults() {
        // Implementation for no results feedback
    }
}

export default SearchSystem;
