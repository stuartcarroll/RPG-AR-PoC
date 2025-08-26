# RPG AR Experience

An AR.js-based image tracking proof of concept that overlays video content when detecting "The Adoration of the Shepherds" painting by Guido Reni.

## Live Demo

Visit: [https://rpgar.stuc.dev](https://rpgar.stuc.dev)

## QR Code Access

Open `generate_qr.html` in your browser to generate and download a QR code that links to the AR experience.

## How It Works

1. User visits the website on their mobile device
2. Clicks the "The Adoration of the Shepherds, Guido Reni" button
3. Grants camera permission
4. Points camera at the target painting (paint1.jpg)
5. Video overlay (vid1.mp4) appears and tracks the image

## File Structure

```
├── index.html              # Main AR experience page
├── js/
│   └── ar-app.js           # AR functionality and mobile optimizations
├── markers/
│   ├── paint1.fset         # AR.js feature set file
│   ├── paint1.fset3        # 3D feature set file
│   ├── paint1.iset         # Image set file
│   └── paint1.jpg          # Processed marker image
├── paint1.jpg              # Original target image
├── vid1.mp4               # Overlay video
├── generate_qr.html        # QR code generator
├── create_marker.py        # NFT marker generator script
├── CNAME                   # GitHub Pages custom domain
└── project.md             # Project requirements
```

## Installation Instructions

### Normal Web Server

1. Upload all files to your web server's public directory
2. Ensure HTTPS is enabled (required for camera access)
3. Update the domain references if using a different URL

### Wix Installation

1. **Enable Developer Mode:**
   - Go to Settings → Advanced → Developer Tools
   - Enable "Developer Mode"

2. **Upload Files:**
   - Create a new folder called `ar` in your site files
   - Upload `index.html`, `js/ar-app.js`, and the `markers/` folder
   - Upload `vid1.mp4` to your media library

3. **Create AR Page:**
   - Add a new page to your site
   - Add an HTML iframe element
   - Set the iframe source to point to your uploaded `index.html`

4. **HTTPS Requirement:**
   - Ensure your Wix site uses HTTPS (usually enabled by default)

### GitHub Pages (Current Setup)

1. Fork or clone this repository
2. Enable GitHub Pages in repository settings
3. Set custom domain in Pages settings (optional)
4. Files are automatically served at your GitHub Pages URL

## Configuration

### Changing Target Image and Video

**Image Location:** `paint1.jpg` (line 1 of project structure)
**Video Location:** `vid1.mp4` (line 1 of project structure)

To use different assets:

1. **Replace Target Image:**
   - Replace `paint1.jpg` with your new image
   - Run `python create_marker.py` to generate new marker files
   - Ensure image is high quality with good contrast and detail

2. **Replace Overlay Video:**
   - Replace `vid1.mp4` with your new video
   - Recommended formats: MP4 (H.264 codec)
   - Recommended dimensions: 720p or 1080p
   - Keep file size reasonable for mobile loading

3. **Update References:**
   - Video reference is in `index.html` at line 72: `src="vid1.mp4"`
   - Marker reference is in `index.html` at line 50: `url="markers/paint1"`

### Video Settings

Video element configuration in `index.html` (lines 65-73):
- `loop="true"` - Video loops continuously
- `muted="true"` - Required for autoplay on mobile
- `webkit-playsinline playsinline` - Prevents fullscreen on iOS

### AR Settings

AR.js configuration in `index.html` (line 44):
- `trackingMethod: best` - Uses optimal tracking algorithm
- `sourceType: webcam` - Uses device camera
- `debugUIEnabled: false` - Hides debug interface

## Replicating with Another Image

1. **Prepare Your Image:**
   - Use high-resolution image (minimum 640px)
   - Ensure good contrast and distinctive features
   - Avoid very dark, very bright, or repetitive patterns
   - Save as JPG format

2. **Replace Files:**
   ```bash
   # Replace the target image
   cp your-new-image.jpg paint1.jpg
   
   # Generate new marker files
   python create_marker.py
   ```

3. **Replace Video:**
   ```bash
   # Replace the overlay video
   cp your-new-video.mp4 vid1.mp4
   ```

4. **Update Button Text (Optional):**
   - Edit `index.html` line 63
   - Change button text to describe your new image

5. **Test:**
   - Deploy to web server with HTTPS
   - Test on mobile device
   - Ensure camera can detect your image reliably

## Technical Requirements

- **HTTPS:** Required for camera access on mobile devices
- **Modern Browser:** Chrome, Firefox, Safari (iOS 11+, Android 7+)
- **Camera:** Rear-facing camera recommended for better tracking
- **Lighting:** Good lighting conditions improve tracking accuracy

## Troubleshooting

### Video Not Playing
- Ensure video file is accessible via HTTPS
- Check video codec (H.264 recommended)
- Verify `muted` attribute is set

### Image Not Tracking
- Ensure good lighting conditions
- Check if image has sufficient contrast and detail
- Try regenerating marker files with `create_marker.py`
- Ensure marker files (.fset, .fset3, .iset) are accessible

### Camera Not Working
- Verify HTTPS is enabled
- Check browser permissions for camera access
- Ensure site is not blocked in browser settings

## Browser Support

- **iOS Safari:** 11.3+
- **Android Chrome:** 67+
- **Android Firefox:** 60+
- **Desktop Chrome:** 67+ (for testing)

## Performance Tips

1. **Optimize Video Size:** Use compressed MP4 files
2. **Image Quality:** Use high-quality marker images
3. **Lighting:** Ensure good lighting for tracking
4. **Device Position:** Hold device steady for better tracking