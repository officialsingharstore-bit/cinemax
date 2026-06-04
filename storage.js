import { db, collection, addDoc, getDocs, query, where, deleteDoc, doc, setDoc } from './firebase.js';
import { auth } from './firebase.js';

class StorageService {
    async addToWatchlist(item) {
        if (!auth.currentUser) return { error: 'Login required' };
        
        const userWatchlistRef = doc(db, 'users', auth.currentUser.uid, 'watchlist', item.id.toString());
        await setDoc(userWatchlistRef, {
            ...item,
            addedAt: new Date()
        });
        return { success: true };
    }

    async removeFromWatchlist(itemId) {
        if (!auth.currentUser) return;
        const itemRef = doc(db, 'users', auth.currentUser.uid, 'watchlist', itemId.toString());
        await deleteDoc(itemRef);
    }

    async getWatchlist() {
        if (!auth.currentUser) return [];
        const q = query(collection(db, 'users', auth.currentUser.uid, 'watchlist'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data());
    }

    async addToFavorites(item) {
        if (!auth.currentUser) return;
        const itemRef = doc(db, 'users', auth.currentUser.uid, 'favorites', item.id.toString());
        await setDoc(itemRef, {
            ...item,
            addedAt: new Date()
        });
    }

    async getFavorites() {
        if (!auth.currentUser) return [];
        const q = query(collection(db, 'users', auth.currentUser.uid, 'favorites'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data());
    }

    async addReview(itemId, review) {
        if (!auth.currentUser) return;
        const reviewRef = doc(db, 'reviews', `${auth.currentUser.uid}_${itemId}`);
        await setDoc(reviewRef, {
            userId: auth.currentUser.uid,
            userName: auth.currentUser.displayName,
            userPhoto: auth.currentUser.photoURL,
            itemId,
            review,
            createdAt: new Date()
        });
    }

    async getReviews(itemId) {
        const q = query(collection(db, 'reviews'), where('itemId', '==', itemId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data());
    }
}

export default new StorageService();
