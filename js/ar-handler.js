// AR Handler for RPG AR Experience
class RPGARHandler {
    constructor() {
        this.trackingFound = false;
        this.scene = null;
        this.nftMarker = null;
        this.video = null;
        this.isInitialized = false;
        this.isARActive = false;
        
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupLanding());
        } else {
            this.setupLanding();
        }
    }

    setupLanding() {
        this.setupLandingEventListeners();
        console.log('RPG AR Landing initialized');
    }

    setupLandingEventListeners() {
        const paint1Btn = document.getElementById('paint1-btn');
        if (paint1Btn) {
            paint1Btn.addEventListener('click', () => {
                this.startARExperience();
            });
            
            // Touch feedback
            paint1Btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                paint1Btn.style.transform = 'translateY(-5px) scale(0.95)';
            });
            
            paint1Btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                setTimeout(() => {
                    paint1Btn.style.transform = '';
                }, 150);
            });
        }
    }

    async startARExperience() {
        try {
            // Show loading
            const loading = document.getElementById('loading');
            if (loading) {
                loading.style.display = 'flex';
            }

            // Request camera permission
            await this.requestCameraPermission();

            // Hide landing page and show AR container
            const landingPage = document.getElementById('landing-page');
            const arContainer = document.getElementById('ar-container');
            
            if (landingPage) landingPage.style.display = 'none';
            if (arContainer) arContainer.style.display = 'block';

            // Initialize AR
            this.isARActive = true;
            await this.setupAR();
            
        } catch (error) {
            console.error('Failed to start AR experience:', error);
            this.showError('Camera access required for AR experience');
        }
    }

    async requestCameraPermission() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            // Stop the stream immediately, we just needed permission
            stream.getTracks().forEach(track => track.stop());
            return true;
        } catch (error) {
            throw new Error('Camera permission denied');
        }
    }

    async setupAR() {
        // Wait for A-Frame to be ready
        await this.waitForAFrame();
        
        this.setupScene();
        this.setupAREventListeners();
        this.setupNFTEvents();
        this.isInitialized = true;
        
        // Hide loading after setup
        setTimeout(() => {
            const loading = document.getElementById('loading');
            if (loading) {
                loading.style.display = 'none';
            }
        }, 2000);
        
        console.log('AR Experience initialized');
    }

    waitForAFrame() {
        return new Promise((resolve) => {
            if (window.AFRAME && document.querySelector('#ar-container a-scene')) {
                resolve();
            } else {
                setTimeout(() => this.waitForAFrame().then(resolve), 100);
            }
        });
    }

    setupScene() {
        this.scene = document.querySelector('#ar-container a-scene');
        this.nftMarker = document.querySelector('a-nft');
        this.video = document.getElementById('paint1-video');
        
        if (!this.scene || !this.nftMarker) {
            console.error('AR scene or NFT marker not found');
            return;
        }

        // Ensure proper mobile camera configuration
        this.scene.setAttribute('arjs', 'sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3;');
        
        console.log('AR scene setup complete');
    }

    setupAREventListeners() {
        // Back button
        const backBtn = document.getElementById('back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.exitARExperience();
            });
        }

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
            if (document.hidden && this.isARActive) {
                this.pauseAR();
            } else if (this.isARActive) {
                this.resumeAR();
            }
        });
    }

    exitARExperience() {
        // Stop video
        if (this.video) {
            this.video.pause();
            this.video.currentTime = 0;
        }

        // Hide AR container and show landing page
        const landingPage = document.getElementById('landing-page');
        const arContainer = document.getElementById('ar-container');
        
        if (arContainer) arContainer.style.display = 'none';
        if (landingPage) landingPage.style.display = 'flex';

        this.isARActive = false;
        this.trackingFound = false;
        
        // Pause AR scene
        this.pauseAR();
    }

    setupNFTEvents() {
        if (!this.nftMarker) return;

        // NFT tracking found
        this.nftMarker.addEventListener('targetFound', () => {
            console.log('NFT target found');
            this.trackingFound = true;
            this.updateTrackingStatus('Target detected! Video playing...', 'found');
            
            // Start video
            this.startVideo();
        });

        // NFT tracking lost
        this.nftMarker.addEventListener('targetLost', () => {
            console.log('NFT target lost');
            this.trackingFound = false;
            this.updateTrackingStatus('Searching for target image...', 'lost');
            
            // Pause video
            this.pauseVideo();
        });
    }

    startVideo() {
        if (this.video && this.trackingFound) {
            this.video.play().catch(error => {
                console.warn('Video autoplay failed:', error);
                // Show backup 3D content if video fails
                this.showBackupContent();
            });
            
            // Make video overlay visible
            const videoOverlay = document.getElementById('video-overlay');
            if (videoOverlay) {
                videoOverlay.setAttribute('visible', 'true');
            }
        }
    }

    pauseVideo() {
        if (this.video) {
            this.video.pause();
        }
        
        // Hide video overlay
        const videoOverlay = document.getElementById('video-overlay');
        if (videoOverlay) {
            videoOverlay.setAttribute('visible', 'false');
        }
    }

    showBackupContent() {
        const backupContent = document.getElementById('backup-content');
        if (backupContent && this.trackingFound) {
            backupContent.setAttribute('visible', 'true');
        }
    }

    showError(message) {
        const trackingStatus = document.getElementById('tracking-status');
        if (trackingStatus) {
            trackingStatus.textContent = message;
            trackingStatus.className = 'lost';
        } else {
            alert(message);
        }
    }

    updateTrackingStatus(message, status) {
        const statusElement = document.getElementById('tracking-status');
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
    isTrackingActive() {
        return this.trackingFound;
    }

    isARRunning() {
        return this.isARActive;
    }

    getCurrentVideo() {
        return this.video;
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
    window.RPGARHandler = new RPGARHandler();
    window.MobileOptimizer = new MobileOptimizer();
    
    // Optional performance monitoring (disable in production)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        window.PerformanceMonitor = new PerformanceMonitor();
    }
    
    console.log('RPG AR Experience initialized');
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.RPGARHandler) {
        window.RPGARHandler.pauseAR();
        if (window.RPGARHandler.video) {
            window.RPGARHandler.video.pause();
        }
    }
});

// Error handling
window.addEventListener('error', (event) => {
    console.error('RPG AR Error:', event.error);
    
    // Show user-friendly error message
    const statusElement = document.getElementById('tracking-status');
    if (statusElement && event.error.message.includes('camera')) {
        statusElement.textContent = 'Camera access required for AR';
        statusElement.className = 'lost';
    }
});

// Camera permission will be handled when user clicks Paint1 button