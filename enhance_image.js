const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

async function enhanceImageForTracking() {
    try {
        console.log('Loading paint1.jpg for enhancement...');
        const image = await loadImage('./paint1.jpg');
        
        // Create canvas for processing
        const canvas = createCanvas(image.width, image.height);
        const ctx = canvas.getContext('2d');
        
        // Draw original image
        ctx.drawImage(image, 0, 0);
        
        // Get image data for processing
        const imageData = ctx.getImageData(0, 0, image.width, image.height);
        const data = imageData.data;
        
        // Enhance contrast and sharpness
        for (let i = 0; i < data.length; i += 4) {
            // Get RGB values
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];
            
            // Increase contrast
            const contrast = 1.5;
            r = Math.min(255, Math.max(0, (r - 128) * contrast + 128));
            g = Math.min(255, Math.max(0, (g - 128) * contrast + 128));
            b = Math.min(255, Math.max(0, (b - 128) * contrast + 128));
            
            // Apply changes
            data[i] = r;
            data[i + 1] = g;
            data[i + 2] = b;
        }
        
        // Put enhanced image data back
        ctx.putImageData(imageData, 0, 0);
        
        // Save enhanced image
        const buffer = canvas.toBuffer('image/jpeg', { quality: 0.95 });
        fs.writeFileSync('./paint1_enhanced.jpg', buffer);
        
        console.log('Enhanced image created: paint1_enhanced.jpg');
        
        // Now regenerate NFT markers with enhanced image
        await createBetterNFTMarker(canvas, image.width, image.height);
        
    } catch (error) {
        console.error('Error enhancing image:', error);
    }
}

async function createBetterNFTMarker(canvas, width, height) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // Use more sophisticated feature detection
    const features = [];
    const stepX = Math.floor(width / 30);  // More granular sampling
    const stepY = Math.floor(height / 30);
    
    for (let y = stepY; y < height - stepY; y += stepY) {
        for (let x = stepX; x < width - stepX; x += stepX) {
            const idx = (y * width + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            
            // Calculate gradients in 8 directions
            const gradients = [];
            for (let angle = 0; angle < 2 * Math.PI; angle += Math.PI / 4) {
                const dx = Math.round(Math.cos(angle) * 2);
                const dy = Math.round(Math.sin(angle) * 2);
                const nx = x + dx;
                const ny = y + dy;
                
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                    const nIdx = (ny * width + nx) * 4;
                    const nGray = 0.299 * data[nIdx] + 0.587 * data[nIdx + 1] + 0.114 * data[nIdx + 2];
                    gradients.push(Math.abs(nGray - gray));
                } else {
                    gradients.push(0);
                }
            }
            
            const maxGradient = Math.max(...gradients);
            
            if (maxGradient > 25) {  // Lower threshold for more features
                // Create more detailed descriptor
                const descriptor = [];
                for (let i = 0; i < 128; i++) {
                    const angle = (i / 128) * 2 * Math.PI;
                    const radius = 1 + (i % 8);  // Variable radius
                    const sx = Math.round(x + Math.cos(angle) * radius);
                    const sy = Math.round(y + Math.sin(angle) * radius);
                    
                    if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
                        const sIdx = (sy * width + sx) * 4;
                        const sGray = 0.299 * data[sIdx] + 0.587 * data[sIdx + 1] + 0.114 * data[sIdx + 2];
                        descriptor.push(Math.round(sGray / 8));  // More granular values
                    } else {
                        descriptor.push(0);
                    }
                }
                
                features.push({
                    x: x,
                    y: y,
                    scale: 1.0 + (maxGradient / 255),  // Variable scale based on gradient
                    orientation: gradients.indexOf(maxGradient) * Math.PI / 4,
                    descriptor: descriptor
                });
            }
        }
    }
    
    console.log(`Generated ${features.length} enhanced features`);
    
    // Update marker files
    const fsetData = {
        width: width,
        height: height,
        dpi: [72, 72],
        features: features
    };
    
    fs.writeFileSync('./markers/paint1.fset', JSON.stringify(fsetData, null, 2));
    
    // Create .iset with enhanced image
    const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 });
    const base64Data = buffer.toString('base64');
    
    const isetData = {
        images: [{
            width: width,
            height: height,
            data: base64Data,
            format: "jpeg"
        }]
    };
    
    fs.writeFileSync('./markers/paint1.iset', JSON.stringify(isetData, null, 2));
    
    console.log('Enhanced NFT marker files updated');
}

enhanceImageForTracking();