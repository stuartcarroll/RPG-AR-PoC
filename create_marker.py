#!/usr/bin/env python3
"""
Simple NFT Marker Creator for AR.js
This script creates basic NFT marker files from an image.
For production use, consider using the official AR.js NFT Marker Creator.
"""

import base64
import json
import os
from PIL import Image
import numpy as np

def create_nft_marker(image_path, output_prefix):
    """Create NFT marker files from an image"""
    
    # Load and process image
    img = Image.open(image_path)
    
    # Convert to RGB if necessary
    if img.mode != 'RGB':
        img = img.convert('RGB')
    
    # Resize image for optimal tracking (max 1024px on longest side)
    max_size = 1024
    if max(img.size) > max_size:
        ratio = max_size / max(img.size)
        new_size = tuple(int(dim * ratio) for dim in img.size)
        img = img.resize(new_size, Image.Resampling.LANCZOS)
    
    # Save processed image
    processed_img_path = f"{output_prefix}.jpg"
    img.save(processed_img_path, "JPEG", quality=85)
    
    # Get image dimensions
    width, height = img.size
    
    # Create basic .fset file (feature set)
    fset_data = {
        "width": width,
        "height": height,
        "dpi": [72, 72],
        "features": []
    }
    
    # Convert image to numpy array for feature detection
    img_array = np.array(img)
    
    # Simple corner detection (basic implementation)
    # In production, this would use more sophisticated algorithms
    gray = np.dot(img_array[...,:3], [0.2989, 0.5870, 0.1140])
    
    # Create mock features for basic tracking
    step_x = width // 10
    step_y = height // 10
    
    for y in range(step_y, height - step_y, step_y):
        for x in range(step_x, width - step_x, step_x):
            if gray[y, x] > 128:  # Simple threshold
                feature = {
                    "x": float(x),
                    "y": float(y),
                    "scale": 1.0,
                    "orientation": 0.0,
                    "descriptor": [0] * 128  # Mock SIFT-like descriptor
                }
                fset_data["features"].append(feature)
    
    # Write .fset file
    with open(f"{output_prefix}.fset", 'w') as f:
        json.dump(fset_data, f)
    
    # Create .fset3 file (3D features - simplified)
    fset3_data = {
        "width": width,
        "height": height,
        "features3d": []
    }
    
    with open(f"{output_prefix}.fset3", 'w') as f:
        json.dump(fset3_data, f)
    
    # Create .iset file (image set - contains image data)
    with open(processed_img_path, 'rb') as img_file:
        img_data = img_file.read()
        img_b64 = base64.b64encode(img_data).decode('utf-8')
    
    iset_data = {
        "images": [
            {
                "width": width,
                "height": height,
                "data": img_b64,
                "format": "jpeg"
            }
        ]
    }
    
    with open(f"{output_prefix}.iset", 'w') as f:
        json.dump(iset_data, f)
    
    print(f"NFT marker files created:")
    print(f"  - {output_prefix}.fset")
    print(f"  - {output_prefix}.fset3") 
    print(f"  - {output_prefix}.iset")
    print(f"  - {processed_img_path}")

if __name__ == "__main__":
    input_image = "paint1.jpg"
    output_prefix = "markers/paint1"
    
    if os.path.exists(input_image):
        create_nft_marker(input_image, output_prefix)
    else:
        print(f"Error: {input_image} not found!")