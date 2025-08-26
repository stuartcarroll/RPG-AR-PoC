class ARApp {
    constructor() {
        this.isARStarted = false;
        this.video = null;
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupEventListeners();
        });
    }

    setupEventListeners() {
        const startButton = document.getElementById('start-button');
        startButton.addEventListener('click', () => this.startAR());

        // Handle AR events
        document.addEventListener('arjs-nft-loaded', (e) => {
            console.log('NFT marker loaded and tracking started');
            this.playVideo();
        });

        document.addEventListener('arjs-nft-lost', (e) => {
            console.log('NFT marker lost');
            this.pauseVideo();
        });
    }

    async startAR() {
        try {
            // Show loading screen
            document.getElementById('start-screen').style.display = 'none';
            document.getElementById('loading').style.display = 'block';

            // Request camera permission
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                } 
            });
            
            // Stop the stream as AR.js will handle it
            stream.getTracks().forEach(track => track.stop());

            // Small delay to ensure camera permission is granted
            setTimeout(() => {
                this.initializeAR();
            }, 500);

        } catch (error) {
            console.error('Camera access denied:', error);
            alert('Camera access is required for AR functionality. Please allow camera access and try again.');
            document.getElementById('loading').style.display = 'none';
            document.getElementById('start-screen').style.display = 'flex';
        }
    }

    initializeAR() {
        // Hide loading, show AR scene
        document.getElementById('loading').style.display = 'none';
        document.getElementById('ar-scene').style.display = 'block';

        // Get video element
        this.video = document.getElementById('ar-video');
        
        // Setup video controls
        if (this.video) {
            this.video.muted = true; // Ensure video can autoplay on mobile
        }

        this.isARStarted = true;
        
        // Add mobile optimizations
        this.setupMobileOptimizations();
    }

    playVideo() {
        if (this.video && this.video.paused) {
            const playPromise = this.video.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log('Video play failed:', error);
                });
            }
        }
    }

    pauseVideo() {
        if (this.video && !this.video.paused) {
            this.video.pause();
        }
    }

    setupMobileOptimizations() {
        // Prevent zoom on double tap
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (event) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);

        // Prevent scrolling
        document.body.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });

        document.body.addEventListener('touchend', (e) => {
            if (e.touches.length > 0) {
                e.preventDefault();
            }
        }, { passive: false });

        document.body.addEventListener('touchmove', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });

        // Lock orientation to portrait if supported
        if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('portrait-primary').catch(() => {
                console.log('Orientation lock not supported');
            });
        }

        // Handle visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseVideo();
            }
        });
    }
}

// Initialize the app
new ARApp();