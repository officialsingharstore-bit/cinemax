class PremiumPlayer {
    constructor(container, options = {}) {
        this.container = container;
        this.options = options; // { type, id, season, episode, title }
        this.init();
    }

    init() {
        this.render();
    }

    render() {
        const servers = {
            'Server 1 (Stable)': this.options.type === 'movie' 
                ? `https://vidsrc.me/embed/movie?tmdb=${this.options.id}` 
                : `https://vidsrc.me/embed/tv?tmdb=${this.options.id}&sea=${this.options.season || 1}&epi=${this.options.episode || 1}`,
            'Server 2 (Multi-Audio)': this.options.type === 'movie' 
                ? `https://vidsrc.to/embed/movie/${this.options.id}` 
                : `https://vidsrc.to/embed/tv/${this.options.id}/${this.options.season || 1}/${this.options.episode || 1}`,
            'Server 3 (HD)': `https://embed.smashystream.com/playere.php?tmdb=${this.options.id}`
        };

        this.container.innerHTML = `
            <div class="video-player" style="background: #000; width: 100%; height: 100%; position: relative; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
                <div id="playerLoading" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #000; display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 5;">
                    <i class="fas fa-film fa-spin" style="font-size: 3rem; color: var(--primary-color);"></i>
                    <p style="margin-top: 1.5rem; letter-spacing: 2px; font-weight: 600;">LOADING CINEMATIC CONTENT...</p>
                </div>
                
                <iframe id="mainPlayerFrame" 
                        src="${servers['Server 1 (Stable)']}" 
                        style="width: 100%; height: 100%; border: none; position: relative; z-index: 1;" 
                        allowfullscreen 
                        allow="autoplay; encrypted-media">
                </iframe>
                
                <div class="player-controls-overlay" style="position: absolute; top: 20px; right: 20px; z-index: 10; display: flex; flex-direction: column; gap: 10px;">
                    <div style="background: rgba(0,0,0,0.8); padding: 5px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
                        <span style="font-size: 0.6rem; color: #888; margin-left: 5px; display: block; margin-bottom: 5px;">SWITCH SERVER</span>
                        <div class="server-switcher" style="display: flex; gap: 5px;">
                            ${Object.keys(servers).map(name => `
                                <button class="btn btn-secondary btn-sm server-btn" data-url="${servers[name]}" style="font-size: 0.65rem; padding: 4px 8px; border: none;">
                                    ${name.split(' (')[0]}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <div style="position: absolute; bottom: 20px; left: 20px; z-index: 10; pointer-events: none; text-shadow: 0 2px 10px rgba(0,0,0,1);">
                    <h2 style="font-size: 1.5rem; font-weight: 800;">${this.options.title}</h2>
                    <div style="display: flex; gap: 10px; margin-top: 5px; align-items: center;">
                        <span class="badge" style="background: var(--primary-color);">4K UHD</span>
                        <span class="badge">DOLBY VISION</span>
                        <span style="font-size: 0.8rem; color: #ccc;"><i class="fas fa-globe"></i> Multi-Audio Available</span>
                    </div>
                </div>
            </div>
        `;

        const frame = this.container.querySelector('#mainPlayerFrame');
        const loading = this.container.querySelector('#playerLoading');
        
        frame.onload = () => {
            setTimeout(() => loading.style.display = 'none', 1000);
        };

        this.container.querySelectorAll('.server-btn').forEach(btn => {
            btn.onclick = () => {
                loading.style.display = 'flex';
                frame.src = btn.dataset.url;
            };
        });
    }
}

export default PremiumPlayer;
