import storage from '../api/storage.js';
import tmdb from '../api/tmdb.js';
import trakt from '../api/trakt.js';
import { auth, onAuthStateChanged } from '../api/firebase.js';
import '../auth.js';

class MyListPage {
    constructor() {
        this.watchlistGrid = document.getElementById('watchlistGrid');
        this.favoritesGrid = document.getElementById('favoritesGrid');
        this.init();
    }

    init() {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                this.loadUserData();
                this.setupTraktSync();
            } else {
                this.showLoginRequired();
            }
        });
    }

    setupTraktSync() {
        const connectBtn = document.getElementById('connectTraktBtn');
        const syncSection = document.getElementById('traktSyncSection');

        if (localStorage.getItem('trakt_access_token')) {
            connectBtn.innerHTML = '<i class="fas fa-check"></i> Trakt Connected';
            connectBtn.classList.remove('btn-primary');
            connectBtn.classList.add('btn-secondary');
            connectBtn.onclick = () => alert('Already connected to Trakt!');
        } else {
            connectBtn.onclick = () => {
                window.location.href = trakt.getAuthUrl();
            };
        }
    }

    async loadUserData() {
        const watchlist = await storage.getWatchlist();
        const favorites = await storage.getFavorites();

        this.renderList(this.watchlistGrid, watchlist);
        this.renderList(this.favoritesGrid, favorites);
    }

    renderList(container, items) {
        if (!items || items.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary);">Nothing here yet. Start adding titles!</p>';
            return;
        }

        container.innerHTML = items.map(item => `
            <div class="movie-card" data-id="${item.id}" data-type="${item.type}">
                <img src="${tmdb.getImageUrl(item.poster_path, 'w500')}" alt="${item.title}">
                <div class="card-overlay">
                    <div class="card-title">${item.title}</div>
                    <div class="card-meta">
                        <span>${item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}</span>
                        <button class="remove-btn" data-id="${item.id}" style="background: none; border: none; color: var(--primary-color); cursor: pointer;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        container.querySelectorAll('.movie-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.remove-btn')) {
                    this.removeItem(card.dataset.id);
                    return;
                }
                window.location.href = `detail.html?id=${card.dataset.id}&type=${card.dataset.type}`;
            });
        });
    }

    async removeItem(id) {
        if (confirm('Remove from watchlist?')) {
            await storage.removeFromWatchlist(id);
            this.loadUserData();
        }
    }

    showLoginRequired() {
        const msg = '<p style="color: var(--text-secondary);">Please <a href="#" id="inlineLogin" style="color: var(--primary-color);">login</a> to view your list.</p>';
        this.watchlistGrid.innerHTML = msg;
        this.favoritesGrid.innerHTML = '';
        
        document.getElementById('inlineLogin').onclick = (e) => {
            e.preventDefault();
            document.getElementById('userProfileBtn').click();
        };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MyListPage();
});
