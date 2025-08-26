const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

async function createNFTMarker() {
    try {
        console.log('Loading paint1.jpg...');
        const image = await loadImage('./paint1.jpg');
        
        // Create canvas for processing
        const canvas = createCanvas(image.width, image.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);
        
        // Get image data for analysis
        const imageData = ctx.getImageData(0, 0, image.width, image.height);
        const data = imageData.data;
        
        // Simple edge detection to find features
        const features = [];
        const stepX = Math.floor(image.width / 20);
        const stepY = Math.floor(image.height / 20);
        
        for (let y = stepY; y < image.height - stepY; y += stepY) {
            for (let x = stepX; x < image.width - stepX; x += stepX) {
                const idx = (y * image.width + x) * 4;
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];
                const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                
                // Calculate gradient to find edges
                const rightIdx = (y * image.width + (x + 1)) * 4;
                const bottomIdx = ((y + 1) * image.width + x) * 4;
                
                if (rightIdx < data.length && bottomIdx < data.length) {
                    const rightGray = 0.299 * data[rightIdx] + 0.587 * data[rightIdx + 1] + 0.114 * data[rightIdx + 2];
                    const bottomGray = 0.299 * data[bottomIdx] + 0.587 * data[bottomIdx + 1] + 0.114 * data[bottomIdx + 2];
                    
                    const gradX = Math.abs(rightGray - gray);
                    const gradY = Math.abs(bottomGray - gray);
                    const gradient = Math.sqrt(gradX * gradX + gradY * gradY);
                    
                    // If gradient is significant, this is likely a feature
                    if (gradient > 30) {
                        // Create a simple but unique descriptor based on local pixel patterns
                        const descriptor = [];
                        for (let i = 0; i < 128; i++) {
                            const angle = (i / 128) * 2 * Math.PI;
                            const rx = Math.floor(x + Math.cos(angle) * 5);
                            const ry = Math.floor(y + Math.sin(angle) * 5);
                            if (rx >= 0 && rx < image.width && ry >= 0 && ry < image.height) {
                                const pixelIdx = (ry * image.width + rx) * 4;
                                const pixelGray = 0.299 * data[pixelIdx] + 0.587 * data[pixelIdx + 1] + 0.114 * data[pixelIdx + 2];
                                descriptor.push(Math.floor(pixelGray / 16));
                            } else {
                                descriptor.push(0);
                            }
                        }
                        
                        features.push({
                            x: x,
                            y: y,
                            scale: 1.0,
                            orientation: Math.atan2(gradY, gradX),
                            descriptor: descriptor
                        });
                    }
                }
            }
        }
        
        console.log(`Found ${features.length} features`);
        
        // Create .fset file
        const fsetData = {
            width: image.width,
            height: image.height,
            dpi: [72, 72],
            features: features
        };
        
        fs.writeFileSync('./markers/paint1.fset', JSON.stringify(fsetData, null, 2));
        
        // Create .fset3 file
        const fset3Data = {
            width: image.width,
            height: image.height,
            features3d: []
        };
        
        fs.writeFileSync('./markers/paint1.fset3', JSON.stringify(fset3Data, null, 2));
        
        // Create .iset file with base64 image data
        const buffer = canvas.toBuffer('image/jpeg', { quality: 0.8 });
        const base64Data = buffer.toString('base64');
        
        const isetData = {
            images: [{
                width: image.width,
                height: image.height,
                data: base64Data,
                format: "jpeg"
            }]
        };
        
        fs.writeFileSync('./markers/paint1.iset', JSON.stringify(isetData, null, 2));
        
        console.log('NFT marker files created successfully:');
        console.log('- markers/paint1.fset');
        console.log('- markers/paint1.fset3');
        console.log('- markers/paint1.iset');
        
    } catch (error) {
        console.error('Error creating NFT markers:', error);
    }
}

createNFTMarker();