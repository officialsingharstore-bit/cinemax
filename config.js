const CONFIG = {
    TMDB: {
        API_KEY: '12ea7e67340e036f4aaf042ee4854e9f',
        ACCESS_TOKEN: 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxMmVhN2U2NzM0MGUwMzZmNGFhZjA0MmVlNDg1NGU5ZiIsIm5iZiI6MTc4MDU3MTcyNi4wMzgsInN1YiI6IjZhMjE1ZTRlNzBjNjc4ZjkyZDI2ZDZlNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.VlFHOlguOxCTHaKpQ8zCoUfoxpk3iCrzBC00ZQPPJ3w',
        BASE_URL: 'https://api.themoviedb.org/3',
        IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
    },
    TRAKT: {
        CLIENT_ID: '834a4d1ca20dbb2374a39b7ac2af9817c897ff846a6b35f3cf782ae3d7442af0',
        CLIENT_SECRET: '3786f77b396ecbef84c32c96f76096faaafb7cd713b6903880947fc9d0b9c1ae',
        BASE_URL: 'https://api.trakt.tv',
        REDIRECT_URI: window.location.origin + '/auth/trakt/callback',
    },
    FIREBASE: {
        apiKey: "AIzaSyCZyLAaAo9gM4KGJCZ6p8rMRasJb2fL80Y",
        authDomain: "cinemax-ebfb9.firebaseapp.com",
        databaseURL: "https://cinemax-ebfb9-default-rtdb.firebaseio.com",
        projectId: "cinemax-ebfb9",
        storageBucket: "cinemax-ebfb9.firebasestorage.app",
        messagingSenderId: "906983644379",
        appId: "1:906983644379:web:de911576e64d947cfd40fe",
        measurementId: "G-WT7L2B89GS"
    }
};

export default CONFIG;
