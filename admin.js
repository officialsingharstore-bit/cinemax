import storage from './api/storage.js';
import { auth, onAuthStateChanged, db, collection, getDocs } from './api/firebase.js';

class AdminDashboard {
    constructor() {
        this.init();
    }

    async init() {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                // In a real app, check for 'admin' role here
                await this.loadStats();
                await this.loadRecentActivity();
            } else {
                window.location.href = 'index.html';
            }
        });
    }

    async loadStats() {
        // Mocking some stats but fetching user count if possible
        const usersSnap = await getDocs(collection(db, 'users'));
        document.querySelector('.stat-value').textContent = usersSnap.size;
    }

    async loadRecentActivity() {
        const reviewsSnap = await getDocs(collection(db, 'reviews'));
        const tbody = document.querySelector('tbody');
        
        if (reviewsSnap.size > 0) {
            tbody.innerHTML = reviewsSnap.docs.slice(0, 5).map(doc => {
                const data = doc.data();
                return `
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <td style="padding: 1rem;">${data.userName}</td>
                        <td style="padding: 1rem;">Reviewed</td>
                        <td style="padding: 1rem;">ID: ${data.itemId}</td>
                        <td style="padding: 1rem;"><span class="badge" style="background: green;">Live</span></td>
                    </tr>
                `;
            }).join('');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AdminDashboard();
});
