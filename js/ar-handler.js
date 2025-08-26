// AR Handler for Muralist Portfolio
class ARHandler {
    constructor() {
        this.currentArtwork = 'artwork1';
        this.markerFound = false;
        this.scene = null;
        this.marker = null;
        this.artworks = ['artwork1', 'artwork2', 'artwork3'];
        this.isInitialized = false;
        
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupAR());
        } else {
            this.setupAR();
        }
    }

    setupAR() {
        // Hide loading screen after a delay
        setTimeout(() => {
            const loading = document.getElementById('loading');
            if (loading) {
                loading.classList.add('hidden');
            }
        }, 3000);

        // Wait for A-Frame to be ready
        this.waitForAFrame().then(() => {
            this.setupScene();
            this.setupEventListeners();
            this.setupMarkerEvents();
            this.isInitialized = true;
            console.log('AR Handler initialized');
        });
    }

    waitForAFrame() {
        return new Promise((resolve) => {
            if (window.AFRAME && document.querySelector('a-scene')) {
                resolve();
            } else {
                setTimeout(() => this.waitForAFrame().then(resolve), 100);
            }
        });
    }

    setupScene() {
        this.scene = document.querySelector('a-scene');
        this.marker = document.querySelector('a-marker');
        
        if (!this.scene || !this.marker) {
            console.error('AR scene or marker not found');
            return;
        }

        // Ensure proper mobile camera configuration
        this.scene.setAttribute('arjs', 'sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3;');
        
        console.log('AR scene setup complete');
    }

    setupEventListeners() {
        // Artwork selection buttons
        const buttons = document.querySelectorAll('.artwork-btn');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const artworkId = button.getAttribute('data-artwork');
                this.switchArtwork(artworkId);
                
                // Add visual feedback
                this.updateActiveButton(button);
            });
            
            // Add touch feedback
            button.addEventListener('touchstart', (e) => {
                e.preventDefault();
                button.style.transform = 'scale(0.95)';
            });
            
            button.addEventListener('touchend', (e) => {
                e.preventDefault();
                setTimeout(() => {
                    button.style.transform = '';
                }, 150);
            });
        });

        // Handle orientation changes
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                if (this.scene && this.scene.resize) {
                    this.scene.resize();
                }
            }, 500);
        });

        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAR();
            } else {
                this.resumeAR();
            }
        });
    }

    setupMarkerEvents() {
        if (!this.marker) return;

        // Marker found
        this.marker.addEventListener('markerFound', () => {
            console.log('Marker found');
            this.markerFound = true;
            this.updateMarkerStatus('Marker detected!', 'found');
            
            // Ensure current artwork is visible
            this.showCurrentArtwork();
        });

        // Marker lost
        this.marker.addEventListener('markerLost', () => {
            console.log('Marker lost');
            this.markerFound = false;
            this.updateMarkerStatus('Searching for marker...', 'lost');
        });
    }

    switchArtwork(artworkId) {
        if (!this.artworks.includes(artworkId)) {
            console.error('Invalid artwork ID:', artworkId);
            return;
        }

        console.log('Switching to artwork:', artworkId);
        this.currentArtwork = artworkId;

        // Hide all artworks
        this.artworks.forEach(id => {
            const artwork = document.getElementById(id);
            if (artwork) {
                artwork.setAttribute('visible', 'false');
                // Add fade-out effect
                artwork.setAttribute('animation', 'property: scale; to: 0 0 0; dur: 200');
            }
        });

        // Show current artwork after a brief delay
        setTimeout(() => {
            this.showCurrentArtwork();
        }, 200);
    }

    showCurrentArtwork() {
        const currentArtworkElement = document.getElementById(this.currentArtwork);
        if (currentArtworkElement && this.markerFound) {
            currentArtworkElement.setAttribute('visible', 'true');
            // Add fade-in effect
            currentArtworkElement.setAttribute('animation', 'property: scale; to: 1 1 1; dur: 300');
            console.log('Showing artwork:', this.currentArtwork);
        }
    }

    updateActiveButton(activeButton) {
        // Remove active class from all buttons
        const buttons = document.querySelectorAll('.artwork-btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        activeButton.classList.add('active');
    }

    updateMarkerStatus(message, status) {
        const statusElement = document.getElementById('marker-status');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = status;
        }
    }

    pauseAR() {
        if (this.scene && this.scene.pause) {
            this.scene.pause();
        }
    }

    resumeAR() {
        if (this.scene && this.scene.play) {
            this.scene.play();
        }
    }

    // Public methods for external control
    getCurrentArtwork() {
        return this.currentArtwork;
    }

    isMarkerVisible() {
        return this.markerFound;
    }

    getAvailableArtworks() {
        return [...this.artworks];
    }
}

// Touch and mobile optimizations
class MobileOptimizer {
    constructor() {
        this.setupMobileOptimizations();
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

        // Prevent default touch behaviors
        document.addEventListener('touchmove', (e) => {
            if (e.target.tagName !== 'BUTTON') {
                e.preventDefault();
            }
        }, { passive: false });

        // Handle device orientation
        if (screen.orientation) {
            screen.orientation.addEventListener('change', () => {
                this.handleOrientationChange();
            });
        } else {
            window.addEventListener('orientationchange', () => {
                this.handleOrientationChange();
            });
        }
    }

    handleOrientationChange() {
        // Force reflow after orientation change
        setTimeout(() => {
            if (window.ARHandler && window.ARHandler.scene) {
                const scene = window.ARHandler.scene;
                scene.style.width = '100vw';
                scene.style.height = '100vh';
            }
        }, 500);
    }
}

// Performance monitor
class PerformanceMonitor {
    constructor() {
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 0;
        
        this.startMonitoring();
    }

    startMonitoring() {
        this.monitorFrame();
    }

    monitorFrame() {
        this.frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - this.lastTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = currentTime;
            
            // Log performance issues
            if (this.fps < 15) {
                console.warn('Low FPS detected:', this.fps);
            }
        }
        
        requestAnimationFrame(() => this.monitorFrame());
    }

    getFPS() {
        return this.fps;
    }
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Global AR handler instance
    window.ARHandler = new ARHandler();
    window.MobileOptimizer = new MobileOptimizer();
    
    // Optional performance monitoring (disable in production)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        window.PerformanceMonitor = new PerformanceMonitor();
    }
    
    console.log('AR Portfolio initialized');
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.ARHandler) {
        window.ARHandler.pauseAR();
    }
});

// Error handling
window.addEventListener('error', (event) => {
    console.error('AR Error:', event.error);
    
    // Show user-friendly error message
    const statusElement = document.getElementById('marker-status');
    if (statusElement && event.error.message.includes('camera')) {
        statusElement.textContent = 'Camera access required for AR';
        statusElement.className = 'error';
    }
});

// Camera permission handling
navigator.mediaDevices?.getUserMedia({ video: true })
    .then(() => {
        console.log('Camera permission granted');
    })
    .catch((error) => {
        console.error('Camera permission denied:', error);
        const statusElement = document.getElementById('marker-status');
        if (statusElement) {
            statusElement.textContent = 'Please allow camera access';
            statusElement.className = 'error';
        }
    });