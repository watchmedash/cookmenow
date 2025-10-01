// Music Player JavaScript
class MusicPlayer {
    constructor() {
        this.currentSong = null;
        this.songs = [];
        this.currentIndex = 0;
        this.isPlaying = false;
        this.isShuffled = false;
        this.repeatMode = 0; // 0: off, 1: all, 2: one
        this.volume = 0.7;
        this.currentTime = 0;
        this.duration = 0;
        this.favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        this.recentlyPlayed = JSON.parse(localStorage.getItem('recentlyPlayed')) || [];
        this.playlists = JSON.parse(localStorage.getItem('playlists')) || [];

        this.audio = document.getElementById('audio-player');
        this.isDragging = false;
        this.isVolumeDragging = false;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupAudioEvents();
        this.loadStoredData();
        this.updateUI();
    }

    setupEventListeners() {
        // Menu navigation
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.switchView(e.currentTarget.dataset.view);
            });
        });

        // File upload
        document.getElementById('file-upload').addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files);
        });

        // Search
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        // Player controls
        document.getElementById('play-btn').addEventListener('click', () => this.togglePlay());
        document.getElementById('prev-btn').addEventListener('click', () => this.previousSong());
        document.getElementById('next-btn').addEventListener('click', () => this.nextSong());
        document.getElementById('shuffle-btn').addEventListener('click', () => this.toggleShuffle());
        document.getElementById('repeat-btn').addEventListener('click', () => this.toggleRepeat());
        document.getElementById('favorite-current').addEventListener('click', () => this.toggleFavorite());

        // Progress bar
        this.setupProgressBar();

        // Volume control
        this.setupVolumeControl();

        // Additional controls
        document.getElementById('shuffle-all').addEventListener('click', () => this.shuffleAll());
        document.getElementById('fullscreen-btn').addEventListener('click', () => this.toggleVisualizer());

        // Context menu
        this.setupContextMenu();

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    setupAudioEvents() {
        this.audio.addEventListener('loadedmetadata', () => {
            this.duration = this.audio.duration;
            this.updateTimeDisplay();
        });

        this.audio.addEventListener('timeupdate', () => {
            if (!this.isDragging) {
                this.currentTime = this.audio.currentTime;
                this.updateProgress();
                this.updateTimeDisplay();
            }
        });

        this.audio.addEventListener('ended', () => {
            this.handleSongEnd();
        });

        this.audio.addEventListener('play', () => {
            this.isPlaying = true;
            this.updatePlayButton();
        });

        this.audio.addEventListener('pause', () => {
            this.isPlaying = false;
            this.updatePlayButton();
        });

        this.audio.addEventListener('error', (e) => {
            console.error('Audio error:', e);
            this.showNotification('Error playing audio file', 'error');
        });
    }

    setupProgressBar() {
        const progressContainer = document.querySelector('.progress-container');
        const progressTrack = document.querySelector('.progress-track');
        const progressHandle = document.getElementById('progress-handle');

        let startDrag = (e) => {
            this.isDragging = true;
            progressContainer.classList.add('dragging');
            this.updateProgressFromEvent(e);
            document.addEventListener('mousemove', this.updateProgressFromEvent.bind(this));
            document.addEventListener('mouseup', endDrag);
        };

        let endDrag = () => {
            if (this.isDragging) {
                this.isDragging = false;
                progressContainer.classList.remove('dragging');
                document.removeEventListener('mousemove', this.updateProgressFromEvent.bind(this));
                document.removeEventListener('mouseup', endDrag);
            }
        };

        progressTrack.addEventListener('mousedown', startDrag);
        progressHandle.addEventListener('mousedown', startDrag);
        progressTrack.addEventListener('click', (e) => {
            if (!this.isDragging) {
                this.updateProgressFromEvent(e);
            }
        });
    }

    updateProgressFromEvent(e) {
        const progressTrack = document.querySelector('.progress-track');
        const rect = progressTrack.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));

        if (this.duration) {
            this.currentTime = percent * this.duration;
            this.audio.currentTime = this.currentTime;
            this.updateProgress();
            this.updateTimeDisplay();
        }
    }

    setupVolumeControl() {
        const volumeTrack = document.querySelector('.volume-track');
        const volumeHandle = document.getElementById('volume-handle');
        const volumeBtn = document.getElementById('volume-btn');

        // Set initial volume
        this.audio.volume = this.volume;
        this.updateVolumeDisplay();

        let startVolumeDrag = (e) => {
            this.isVolumeDragging = true;
            this.updateVolumeFromEvent(e);
            document.addEventListener('mousemove', this.updateVolumeFromEvent.bind(this));
            document.addEventListener('mouseup', endVolumeDrag);
        };

        let endVolumeDrag = () => {
            this.isVolumeDragging = false;
            document.removeEventListener('mousemove', this.updateVolumeFromEvent.bind(this));
            document.removeEventListener('mouseup', endVolumeDrag);
        };

        volumeTrack.addEventListener('mousedown', startVolumeDrag);
        volumeHandle.addEventListener('mousedown', startVolumeDrag);
        volumeTrack.addEventListener('click', (e) => {
            if (!this.isVolumeDragging) {
                this.updateVolumeFromEvent(e);
            }
        });

        // Volume button toggle
        volumeBtn.addEventListener('click', () => {
            this.toggleMute();
        });
    }

    updateVolumeFromEvent(e) {
        const volumeTrack = document.querySelector('.volume-track');
        const rect = volumeTrack.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));

        this.volume = percent;
        this.audio.volume = this.volume;
        this.updateVolumeDisplay();
    }

    setupContextMenu() {
        document.addEventListener('contextmenu', (e) => {
            const musicItem = e.target.closest('.music-item');
            if (musicItem) {
                e.preventDefault();
                this.showContextMenu(e, musicItem);
            }
        });

        document.addEventListener('click', () => {
            this.hideContextMenu();
        });

        // Context menu actions
        document.querySelectorAll('.context-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleContextAction(e.currentTarget.dataset.action);
            });
        });
    }

    async handleFileUpload(files) {
        const fileArray = Array.from(files);
        const audioFiles = fileArray.filter(file => file.type.startsWith('audio/'));

        if (audioFiles.length === 0) {
            this.showNotification('No audio files selected', 'error');
            return;
        }

        this.showNotification(`Adding ${audioFiles.length} songs...`, 'info');

        for (const file of audioFiles) {
            await this.addSong(file);
        }

        this.updateUI();
        this.showNotification(`Added ${audioFiles.length} songs to library`, 'success');
    }

    async addSong(file) {
        return new Promise((resolve) => {
            const song = {
                id: Date.now() + Math.random(),
                name: file.name.replace(/\.[^/.]+$/, ""),
                artist: 'Unknown Artist',
                album: 'Unknown Album',
                duration: 0,
                file: file,
                url: URL.createObjectURL(file),
                dateAdded: new Date().toISOString()
            };

            // Try to extract metadata
            const audio = new Audio(song.url);
            audio.addEventListener('loadedmetadata', () => {
                song.duration = audio.duration;
                resolve();
            });

            audio.addEventListener('error', () => {
                resolve(); // Continue even if metadata fails
            });

            // Extract basic info from filename
            const parts = song.name.split(' - ');
            if (parts.length >= 2) {
                song.artist = parts[0].trim();
                song.name = parts.slice(1).join(' - ').trim();
            }

            this.songs.push(song);
            this.saveToStorage('songs', this.songs);
        });
    }

    playSong(song, index = null) {
        if (index !== null) {
            this.currentIndex = index;
        } else {
            this.currentIndex = this.songs.findIndex(s => s.id === song.id);
        }

        this.currentSong = song;
        this.audio.src = song.url;

        // Update current song display
        document.getElementById('current-title').textContent = song.name;
        document.getElementById('current-artist').textContent = song.artist;

        // Update artwork (placeholder for now)
        const artworkImg = document.getElementById('current-artwork');
        artworkImg.style.display = 'none';
        document.querySelector('.song-artwork .default-artwork').style.display = 'flex';

        // Add to recently played
        this.addToRecentlyPlayed(song);

        // Update playing state in UI
        this.updatePlayingState();

        // Play the song
        this.audio.play().catch(e => {
            console.error('Error playing audio:', e);
            this.showNotification('Error playing audio file', 'error');
        });

        // Update favorite button
        this.updateFavoriteButton();
    }

    togglePlay() {
        if (!this.currentSong) {
            if (this.songs.length > 0) {
                this.playSong(this.songs[0], 0);
            }
            return;
        }

        if (this.isPlaying) {
            this.audio.pause();
        } else {
            this.audio.play();
        }
    }

    previousSong() {
        if (this.songs.length === 0) return;

        let newIndex;
        if (this.isShuffled) {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } else {
            newIndex = this.currentIndex - 1;
            if (newIndex < 0) {
                newIndex = this.songs.length - 1;
            }
        }

        this.playSong(this.songs[newIndex], newIndex);
    }

    nextSong() {
        if (this.songs.length === 0) return;

        let newIndex;
        if (this.isShuffled) {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } else {
            newIndex = this.currentIndex + 1;
            if (newIndex >= this.songs.length) {
                newIndex = 0;
            }
        }

        this.playSong(this.songs[newIndex], newIndex);
    }

    handleSongEnd() {
        if (this.repeatMode === 2) { // Repeat one
            this.audio.play();
        } else if (this.repeatMode === 1 || this.currentIndex < this.songs.length - 1) {
            this.nextSong();
        } else {
            this.isPlaying = false;
            this.updatePlayButton();
        }
    }

    toggleShuffle() {
        this.isShuffled = !this.isShuffled;
        const shuffleBtn = document.getElementById('shuffle-btn');
        shuffleBtn.classList.toggle('active', this.isShuffled);

        this.showNotification(`Shuffle ${this.isShuffled ? 'enabled' : 'disabled'}`, 'info');
    }

    toggleRepeat() {
        this.repeatMode = (this.repeatMode + 1) % 3;
        const repeatBtn = document.getElementById('repeat-btn');
        const icon = repeatBtn.querySelector('i');

        repeatBtn.classList.toggle('active', this.repeatMode > 0);

        if (this.repeatMode === 0) {
            icon.className = 'fas fa-redo';
            this.showNotification('Repeat off', 'info');
        } else if (this.repeatMode === 1) {
            icon.className = 'fas fa-redo';
            this.showNotification('Repeat all', 'info');
        } else {
            icon.className = 'fas fa-redo-alt';
            this.showNotification('Repeat one', 'info');
        }
    }

    toggleFavorite() {
        if (!this.currentSong) return;

        const songId = this.currentSong.id;
        const index = this.favorites.indexOf(songId);

        if (index > -1) {
            this.favorites.splice(index, 1);
            this.showNotification('Removed from favorites', 'info');
        } else {
            this.favorites.push(songId);
            this.showNotification('Added to favorites', 'success');
        }

        this.saveToStorage('favorites', this.favorites);
        this.updateFavoriteButton();
        this.updateUI();
    }

    toggleMute() {
        const volumeBtn = document.getElementById('volume-btn');
        const icon = volumeBtn.querySelector('i');

        if (this.audio.volume > 0) {
            this.previousVolume = this.audio.volume;
            this.audio.volume = 0;
            this.volume = 0;
            icon.className = 'fas fa-volume-mute';
        } else {
            this.volume = this.previousVolume || 0.7;
            this.audio.volume = this.volume;
            icon.className = 'fas fa-volume-up';
        }

        this.updateVolumeDisplay();
    }

    shuffleAll() {
        if (this.songs.length === 0) return;

        this.isShuffled = true;
        const randomIndex = Math.floor(Math.random() * this.songs.length);
        this.playSong(this.songs[randomIndex], randomIndex);

        document.getElementById('shuffle-btn').classList.add('active');
        this.showNotification('Shuffling all songs', 'info');
    }

    handleSearch(query) {
        const filteredSongs = this.songs.filter(song =>
            song.name.toLowerCase().includes(query.toLowerCase()) ||
            song.artist.toLowerCase().includes(query.toLowerCase()) ||
            song.album.toLowerCase().includes(query.toLowerCase())
        );

        this.renderSongs(filteredSongs);
    }

    switchView(viewName) {
        // Update menu active state
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.toggle('active', item.dataset.view === viewName);
        });

        // Hide all views
        document.querySelectorAll('.content-view').forEach(view => {
            view.classList.add('hidden');
        });

        // Show selected view
        document.getElementById(`${viewName}-view`).classList.remove('hidden');

        // Update view content
        this.updateViewContent(viewName);
    }

    updateViewContent(viewName) {
        switch (viewName) {
            case 'library':
                this.renderSongs(this.songs);
                break;
            case 'favorites':
                const favoriteSongs = this.songs.filter(song => 
                    this.favorites.includes(song.id)
                );
                this.renderFavorites(favoriteSongs);
                break;
            case 'recent':
                this.renderRecentlyPlayed();
                break;
            case 'playlists':
                this.renderPlaylists();
                break;
        }
    }

    renderSongs(songs) {
        const grid = document.getElementById('music-grid');

        if (songs.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-music"></i>
                    <h3>No songs found</h3>
                    <p>Upload your favorite songs to get started</p>
                    <label for="file-upload" class="upload-btn-large">
                        <i class="fas fa-plus"></i>
                        Add Music Files
                    </label>
                </div>
            `;
            return;
        }

        grid.innerHTML = songs.map((song, index) => `
            <div class="music-item ${this.currentSong && this.currentSong.id === song.id ? 'playing' : ''}" 
                 data-song-id="${song.id}" data-index="${index}">
                <div class="music-artwork">
                    <div class="default-artwork">
                        <i class="fas fa-music"></i>
                    </div>
                    <div class="play-overlay">
                        <i class="fas fa-play"></i>
                    </div>
                </div>
                <div class="music-info">
                    <h3>${song.name}</h3>
                    <p>${song.artist}</p>
                </div>
            </div>
        `).join('');

        // Add click listeners
        grid.querySelectorAll('.music-item').forEach(item => {
            item.addEventListener('click', () => {
                const songId = parseInt(item.dataset.songId);
                const song = this.songs.find(s => s.id === songId);
                const index = this.songs.indexOf(song);
                this.playSong(song, index);
            });
        });
    }

    renderFavorites(songs) {
        const list = document.getElementById('favorites-list');

        if (songs.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-heart"></i>
                    <h3>No favorites yet</h3>
                    <p>Heart songs to add them to your favorites</p>
                </div>
            `;
            return;
        }

        list.innerHTML = songs.map(song => `
            <div class="music-list-item ${this.currentSong && this.currentSong.id === song.id ? 'playing' : ''}"
                 data-song-id="${song.id}">
                <div class="music-artwork">
                    <div class="default-artwork">
                        <i class="fas fa-music"></i>
                    </div>
                </div>
                <div class="song-info">
                    <div class="song-title">${song.name}</div>
                    <div class="song-artist">${song.artist}</div>
                </div>
                <div class="song-duration">${this.formatTime(song.duration)}</div>
            </div>
        `).join('');

        // Add click listeners
        list.querySelectorAll('.music-list-item').forEach(item => {
            item.addEventListener('click', () => {
                const songId = parseInt(item.dataset.songId);
                const song = this.songs.find(s => s.id === songId);
                const index = this.songs.indexOf(song);
                this.playSong(song, index);
            });
        });
    }

    renderRecentlyPlayed() {
        const list = document.getElementById('recent-list');

        if (this.recentlyPlayed.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clock"></i>
                    <h3>No recent plays</h3>
                    <p>Songs you play will appear here</p>
                </div>
            `;
            return;
        }

        const recentSongs = this.recentlyPlayed
            .map(id => this.songs.find(s => s.id === id))
            .filter(song => song); // Remove any songs that no longer exist

        list.innerHTML = recentSongs.map(song => `
            <div class="music-list-item ${this.currentSong && this.currentSong.id === song.id ? 'playing' : ''}"
                 data-song-id="${song.id}">
                <div class="music-artwork">
                    <div class="default-artwork">
                        <i class="fas fa-music"></i>
                    </div>
                </div>
                <div class="song-info">
                    <div class="song-title">${song.name}</div>
                    <div class="song-artist">${song.artist}</div>
                </div>
                <div class="song-duration">${this.formatTime(song.duration)}</div>
            </div>
        `).join('');

        // Add click listeners
        list.querySelectorAll('.music-list-item').forEach(item => {
            item.addEventListener('click', () => {
                const songId = parseInt(item.dataset.songId);
                const song = this.songs.find(s => s.id === songId);
                const index = this.songs.indexOf(song);
                this.playSong(song, index);
            });
        });
    }

    renderPlaylists() {
        const grid = document.getElementById('playlists-grid');

        grid.innerHTML = `
            <div class="playlist-card create-playlist">
                <div class="playlist-icon">
                    <i class="fas fa-plus"></i>
                </div>
                <h3>Create Playlist</h3>
            </div>
        ` + this.playlists.map(playlist => `
            <div class="playlist-card" data-playlist-id="${playlist.id}">
                <div class="playlist-icon">
                    <i class="fas fa-music"></i>
                </div>
                <h3>${playlist.name}</h3>
                <p>${playlist.songs.length} songs</p>
            </div>
        `).join('');
    }

    // Utility functions
    updateProgress() {
        if (!this.duration) return;

        const percent = (this.currentTime / this.duration) * 100;
        document.getElementById('progress-fill').style.width = `${percent}%`;
        document.getElementById('progress-handle').style.left = `${percent}%`;
    }

    updateTimeDisplay() {
        document.getElementById('current-time').textContent = this.formatTime(this.currentTime);
        document.getElementById('total-time').textContent = this.formatTime(this.duration);
    }

    updateVolumeDisplay() {
        const percent = this.volume * 100;
        document.getElementById('volume-fill').style.width = `${percent}%`;
        document.getElementById('volume-handle').style.left = `${percent}%`;

        const volumeBtn = document.getElementById('volume-btn');
        const icon = volumeBtn.querySelector('i');

        if (this.volume === 0) {
            icon.className = 'fas fa-volume-mute';
        } else if (this.volume < 0.5) {
            icon.className = 'fas fa-volume-down';
        } else {
            icon.className = 'fas fa-volume-up';
        }
    }

    updatePlayButton() {
        const playBtn = document.getElementById('play-btn');
        const icon = playBtn.querySelector('i');
        icon.className = this.isPlaying ? 'fas fa-pause' : 'fas fa-play';
    }

    updateFavoriteButton() {
        if (!this.currentSong) return;

        const favoriteBtn = document.getElementById('favorite-current');
        const icon = favoriteBtn.querySelector('i');
        const isFavorite = this.favorites.includes(this.currentSong.id);

        favoriteBtn.classList.toggle('active', isFavorite);
        icon.className = isFavorite ? 'fas fa-heart' : 'far fa-heart';
    }

    updatePlayingState() {
        document.querySelectorAll('.music-item').forEach(item => {
            const songId = parseInt(item.dataset.songId);
            item.classList.toggle('playing', this.currentSong && songId === this.currentSong.id);
        });

        document.querySelectorAll('.music-list-item').forEach(item => {
            const songId = parseInt(item.dataset.songId);
            item.classList.toggle('playing', this.currentSong && songId === this.currentSong.id);
        });
    }

    addToRecentlyPlayed(song) {
        const index = this.recentlyPlayed.indexOf(song.id);
        if (index > -1) {
            this.recentlyPlayed.splice(index, 1);
        }

        this.recentlyPlayed.unshift(song.id);

        // Keep only the last 50 played songs
        if (this.recentlyPlayed.length > 50) {
            this.recentlyPlayed = this.recentlyPlayed.slice(0, 50);
        }

        this.saveToStorage('recentlyPlayed', this.recentlyPlayed);
    }

    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    showNotification(message, type = 'info') {
        // Create a simple notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            background: var(--surface-light);
            color: var(--text-primary);
            border-radius: 8px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        if (type === 'success') notification.style.borderLeft = '4px solid var(--success-color)';
        if (type === 'error') notification.style.borderLeft = '4px solid var(--error-color)';
        if (type === 'warning') notification.style.borderLeft = '4px solid var(--warning-color)';
        if (type === 'info') notification.style.borderLeft = '4px solid var(--primary-color)';

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    handleKeyboard(e) {
        // Prevent default if input is focused
        if (e.target.tagName === 'INPUT') return;

        switch (e.code) {
            case 'Space':
                e.preventDefault();
                this.togglePlay();
                break;
            case 'ArrowLeft':
                this.previousSong();
                break;
            case 'ArrowRight':
                this.nextSong();
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.volume = Math.min(1, this.volume + 0.1);
                this.audio.volume = this.volume;
                this.updateVolumeDisplay();
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.volume = Math.max(0, this.volume - 0.1);
                this.audio.volume = this.volume;
                this.updateVolumeDisplay();
                break;
        }
    }

    showContextMenu(e, musicItem) {
        const contextMenu = document.getElementById('context-menu');
        this.contextMenuTarget = musicItem;

        contextMenu.style.left = `${e.clientX}px`;
        contextMenu.style.top = `${e.clientY}px`;
        contextMenu.classList.remove('hidden');
    }

    hideContextMenu() {
        document.getElementById('context-menu').classList.add('hidden');
        this.contextMenuTarget = null;
    }

    handleContextAction(action) {
        if (!this.contextMenuTarget) return;

        const songId = parseInt(this.contextMenuTarget.dataset.songId);
        const song = this.songs.find(s => s.id === songId);

        switch (action) {
            case 'play':
                const index = this.songs.indexOf(song);
                this.playSong(song, index);
                break;
            case 'favorite':
                this.toggleFavorite();
                break;
            case 'remove':
                this.removeSong(songId);
                break;
        }

        this.hideContextMenu();
    }

    removeSong(songId) {
        this.songs = this.songs.filter(s => s.id !== songId);
        this.favorites = this.favorites.filter(id => id !== songId);
        this.recentlyPlayed = this.recentlyPlayed.filter(id => id !== songId);

        this.saveToStorage('songs', this.songs);
        this.saveToStorage('favorites', this.favorites);
        this.saveToStorage('recentlyPlayed', this.recentlyPlayed);

        this.updateUI();
        this.showNotification('Song removed', 'info');
    }

    toggleVisualizer() {
        const visualizer = document.getElementById('visualizer');
        visualizer.classList.toggle('hidden');

        if (!visualizer.classList.contains('hidden')) {
            this.initializeVisualizer();
        }
    }

    initializeVisualizer() {
        // Basic audio visualizer implementation
        const canvas = document.getElementById('visualizer');
        const ctx = canvas.getContext('2d');

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Simple bars visualization
        const drawVisualizer = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw some animated bars as placeholder
            const barCount = 64;
            const barWidth = canvas.width / barCount;

            for (let i = 0; i < barCount; i++) {
                const height = Math.random() * canvas.height * 0.7;
                const hue = (i / barCount) * 360 + Date.now() * 0.01;

                ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
                ctx.fillRect(i * barWidth, canvas.height - height, barWidth - 1, height);
            }

            if (!document.getElementById('visualizer').classList.contains('hidden')) {
                requestAnimationFrame(drawVisualizer);
            }
        };

        drawVisualizer();

        // Close visualizer on click
        canvas.addEventListener('click', () => {
            this.toggleVisualizer();
        });
    }

    // Storage methods
    saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error('Error saving to storage:', e);
        }
    }

    loadStoredData() {
        try {
            const storedSongs = localStorage.getItem('songs');
            if (storedSongs) {
                this.songs = JSON.parse(storedSongs);
            }
        } catch (e) {
            console.error('Error loading stored data:', e);
        }
    }

    updateUI() {
        this.updateViewContent('library');
        this.updatePlayingState();
    }
}

// Initialize the music player when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.musicPlayer = new MusicPlayer();
});

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }

    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);