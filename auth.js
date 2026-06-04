import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged, db, doc, setDoc } from './api/firebase.js';

class AuthManager {
    constructor() {
        this.user = null;
        this.init();
    }

    init() {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                this.user = user;
                this.updateUIForLoggedInUser(user);
                this.syncUserToFirestore(user);
            } else {
                this.user = null;
                this.updateUIForLoggedOutUser();
            }
        });

        const profileBtn = document.getElementById('userProfileBtn');
        if (profileBtn) {
            profileBtn.onclick = () => {
                if (this.user) {
                    // Show profile dropdown or navigate to profile page
                    if (confirm('Logout?')) this.logout();
                } else {
                    this.login();
                }
            };
        }
    }

    async login() {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            console.log('User logged in:', result.user);
        } catch (error) {
            console.error('Login Error:', error);
        }
    }

    async logout() {
        try {
            await signOut(auth);
            console.log('User logged out');
        } catch (error) {
            console.error('Logout Error:', error);
        }
    }

    async syncUserToFirestore(user) {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            lastLogin: new Date()
        }, { merge: true });
    }

    updateUIForLoggedInUser(user) {
        const profileBtn = document.getElementById('userProfileBtn');
        if (profileBtn) {
            const img = profileBtn.querySelector('img');
            if (img) img.src = user.photoURL || 'https://i.pravatar.cc/40';
        }
    }

    updateUIForLoggedOutUser() {
        const profileBtn = document.getElementById('userProfileBtn');
        if (profileBtn) {
            const img = profileBtn.querySelector('img');
            if (img) img.src = 'https://i.pravatar.cc/40?img=0'; // Generic avatar
        }
    }
}

export default new AuthManager();
