const sharp = require('sharp');
const axios = require('axios');

// Enhanced feature extraction with multiple computer vision techniques
const extractAdvancedFeatures = async (imageBuffer) => {
    try {
        // Resize to standard size for consistent processing across all feature extraction
        const processedBuffer = await sharp(imageBuffer)
            .resize(224, 224)
            .raw()
            .toBuffer();

        const processedWidth = 224;
        const processedHeight = 224;

        // Extract multiple types of features using the standardized processedBuffer
        const features = {
            colorHistogram: await extractColorHistogram(processedBuffer, processedWidth, processedHeight),
            edgeFeatures: await extractEdgeFeatures(processedBuffer, processedWidth, processedHeight),
            textureFeatures: await extractTextureFeatures(processedBuffer, processedWidth, processedHeight),
            shapeFeatures: await extractShapeFeatures(processedBuffer, processedWidth, processedHeight),
            dominantColors: await extractDominantColors(processedBuffer, processedWidth, processedHeight),
            brightness: await extractBrightnessFeatures(processedBuffer, processedWidth, processedHeight),
            contrast: await extractContrastFeatures(processedBuffer, processedWidth, processedHeight)
        };

        // Combine all features into a single vector
        return combineFeatures(features);
    } catch (error) {
        console.error('Error extracting advanced features:', error);
        throw error;
    }
};

// Enhanced color histogram with better binning - uses processed buffer
const extractColorHistogram = async (processedBuffer, width, height) => {
    try {
        // Sample from the processed buffer for histogram calculation
        const sampleSize = 128;
        const sampleBuffer = await sharp(processedBuffer, { raw: { width, height, channels: 3 } })
            .resize(sampleSize, sampleSize)
            .raw()
            .toBuffer();

        // Use HSV color space for better perceptual similarity
        const pixels = [];
        for (let i = 0; i < sampleBuffer.length; i += 3) {
            const r = sampleBuffer[i] / 255;
            const g = sampleBuffer[i + 1] / 255;
            const b = sampleBuffer[i + 2] / 255;
            
            // Convert RGB to HSV
            const hsv = rgbToHsv(r, g, b);
            pixels.push(hsv);
        }

        // Create HSV histogram (16x8x8 bins)
        const hBins = 16, sBins = 8, vBins = 8;
        const histogram = new Array(hBins * sBins * vBins).fill(0);

        pixels.forEach(([h, s, v]) => {
            const hBin = Math.min(Math.floor(h * hBins), hBins - 1);
            const sBin = Math.min(Math.floor(s * sBins), sBins - 1);
            const vBin = Math.min(Math.floor(v * vBins), vBins - 1);
            const index = hBin * sBins * vBins + sBin * vBins + vBin;
            histogram[index]++;
        });

        // Normalize
        const total = pixels.length;
        return histogram.map(count => count / total);
    } catch (error) {
        console.error('Error extracting color histogram:', error);
        return new Array(1024).fill(0);
    }
};

// Extract edge features using Sobel operator - uses processed buffer
const extractEdgeFeatures = async (processedBuffer, width, height) => {
    try {
        // Convert processed buffer to grayscale and resize for edge detection
        const edgeSize = 64;
        const grayBuffer = await sharp(processedBuffer, { raw: { width, height, channels: 3 } })
            .resize(edgeSize, edgeSize)
            .grayscale()
            .raw()
            .toBuffer();

        const edgeWidth = edgeSize, edgeHeight = edgeSize;
        const edgeStrength = new Array(edgeWidth * edgeHeight).fill(0);

        // Sobel kernels
        const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
        const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

        // Apply Sobel operator
        for (let y = 1; y < edgeHeight - 1; y++) {
            for (let x = 1; x < edgeWidth - 1; x++) {
                let gx = 0, gy = 0;
                
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const pixel = grayBuffer[(y + ky) * edgeWidth + (x + kx)];
                        const kernelIndex = (ky + 1) * 3 + (kx + 1);
                        gx += pixel * sobelX[kernelIndex];
                        gy += pixel * sobelY[kernelIndex];
                    }
                }
                
                edgeStrength[y * edgeWidth + x] = Math.sqrt(gx * gx + gy * gy);
            }
        }

        // Create edge histogram
        const bins = 16;
        const maxEdge = Math.max(...edgeStrength);
        const edgeHist = new Array(bins).fill(0);
        
        if (maxEdge > 0) {
            edgeStrength.forEach(strength => {
                const bin = Math.min(Math.floor((strength / maxEdge) * bins), bins - 1);
                edgeHist[bin]++;
            });
        }

        // Normalize
        const total = edgeStrength.length;
        return edgeHist.map(count => count / total);
    } catch (error) {
        console.error('Error extracting edge features:', error);
        return new Array(16).fill(0);
    }
};

// Extract texture features using Local Binary Pattern - uses processed buffer
const extractTextureFeatures = async (processedBuffer, width, height) => {
    try {
        const textureSize = 64;
        const grayBuffer = await sharp(processedBuffer, { raw: { width, height, channels: 3 } })
            .resize(textureSize, textureSize)
            .grayscale()
            .raw()
            .toBuffer();

        const textureWidth = textureSize, textureHeight = textureSize;
        const lbpHistogram = new Array(256).fill(0);

        // Simplified LBP calculation
        for (let y = 1; y < textureHeight - 1; y++) {
            for (let x = 1; x < textureWidth - 1; x++) {
                const center = grayBuffer[y * textureWidth + x];
                let lbpValue = 0;
                
                // 8 neighbors
                const neighbors = [
                    grayBuffer[(y-1) * textureWidth + (x-1)], // top-left
                    grayBuffer[(y-1) * textureWidth + x],     // top
                    grayBuffer[(y-1) * textureWidth + (x+1)], // top-right
                    grayBuffer[y * textureWidth + (x+1)],     // right
                    grayBuffer[(y+1) * textureWidth + (x+1)], // bottom-right
                    grayBuffer[(y+1) * textureWidth + x],     // bottom
                    grayBuffer[(y+1) * textureWidth + (x-1)], // bottom-left
                    grayBuffer[y * textureWidth + (x-1)]      // left
                ];

                // Calculate LBP value
                for (let i = 0; i < 8; i++) {
                    if (neighbors[i] >= center) {
                        lbpValue |= (1 << i);
                    }
                }
                
                lbpHistogram[lbpValue]++;
            }
        }

        // Normalize
        const total = (textureWidth - 2) * (textureHeight - 2);
        return lbpHistogram.map(count => count / total);
    } catch (error) {
        console.error('Error extracting texture features:', error);
        return new Array(256).fill(0);
    }
};

// Extract shape features using moments - uses processed buffer
const extractShapeFeatures = async (processedBuffer, width, height) => {
    try {
        // Convert processed buffer to binary image using threshold
        const shapeSize = 64;
        const grayBuffer = await sharp(processedBuffer, { raw: { width, height, channels: 3 } })
            .resize(shapeSize, shapeSize)
            .grayscale()
            .raw()
            .toBuffer();

        const shapeWidth = shapeSize, shapeHeight = shapeSize;
        const threshold = 128;
        
        // Calculate moments
        let m00 = 0, m10 = 0, m01 = 0, m20 = 0, m11 = 0, m02 = 0;
        
        for (let y = 0; y < shapeHeight; y++) {
            for (let x = 0; x < shapeWidth; x++) {
                const pixel = grayBuffer[y * shapeWidth + x] > threshold ? 1 : 0;
                m00 += pixel;
                m10 += x * pixel;
                m01 += y * pixel;
                m20 += x * x * pixel;
                m11 += x * y * pixel;
                m02 += y * y * pixel;
            }
        }

        if (m00 === 0) return [0, 0, 0, 0, 0, 0, 0];

        // Calculate central moments
        const xc = m10 / m00;
        const yc = m01 / m00;
        
        const mu20 = m20 / m00 - xc * xc;
        const mu11 = m11 / m00 - xc * yc;
        const mu02 = m02 / m00 - yc * yc;

        // Hu moments (invariant to translation, scale, rotation)
        const eta20 = mu20 / Math.pow(m00, 2);
        const eta11 = mu11 / Math.pow(m00, 2);
        const eta02 = mu02 / Math.pow(m00, 2);

        const hu1 = eta20 + eta02;
        const hu2 = Math.pow(eta20 - eta02, 2) + 4 * eta11 * eta11;
        
        // Compactness and aspect ratio
        const perimeter = calculatePerimeter(grayBuffer, shapeWidth, shapeHeight, threshold);
        const compactness = perimeter > 0 ? (4 * Math.PI * m00) / (perimeter * perimeter) : 0;
        const aspectRatio = mu20 > 0 && mu02 > 0 ? Math.sqrt(mu20 / mu02) : 1;

        return [hu1, hu2, compactness, aspectRatio, eta20, eta11, eta02];
    } catch (error) {
        console.error('Error extracting shape features:', error);
        return new Array(7).fill(0);
    }
};

// Extract dominant colors using k-means clustering - uses processed buffer
const extractDominantColors = async (processedBuffer, width, height) => {
    try {
        const colorSize = 32;
        const resizedBuffer = await sharp(processedBuffer, { raw: { width, height, channels: 3 } })
            .resize(colorSize, colorSize)
            .raw()
            .toBuffer();

        const pixels = [];
        for (let i = 0; i < resizedBuffer.length; i += 3) {
            pixels.push([
                resizedBuffer[i],
                resizedBuffer[i + 1],
                resizedBuffer[i + 2]
            ]);
        }

        // Simple k-means for 5 dominant colors
        const k = 5;
        const maxIterations = 10;
        
        // Initialize centroids randomly
        let centroids = [];
        for (let i = 0; i < k; i++) {
            const randomPixel = pixels[Math.floor(Math.random() * pixels.length)];
            centroids.push([...randomPixel]);
        }

        // K-means iterations
        for (let iter = 0; iter < maxIterations; iter++) {
            const clusters = Array(k).fill().map(() => []);
            
            // Assign pixels to nearest centroid
            pixels.forEach(pixel => {
                let minDist = Infinity;
                let closestCluster = 0;
                
                centroids.forEach((centroid, index) => {
                    const dist = euclideanDistance(pixel, centroid);
                    if (dist < minDist) {
                        minDist = dist;
                        closestCluster = index;
                    }
                });
                
                clusters[closestCluster].push(pixel);
            });

            // Update centroids
            centroids = clusters.map(cluster => {
                if (cluster.length === 0) return [0, 0, 0];
                
                const sum = cluster.reduce((acc, pixel) => [
                    acc[0] + pixel[0],
                    acc[1] + pixel[1],
                    acc[2] + pixel[2]
                ], [0, 0, 0]);
                
                return [
                    sum[0] / cluster.length,
                    sum[1] / cluster.length,
                    sum[2] / cluster.length
                ];
            });
        }

        // Return normalized dominant colors
        return centroids.flat().map(val => val / 255);
    } catch (error) {
        console.error('Error extracting dominant colors:', error);
        return new Array(15).fill(0);
    }
};

// Extract brightness features - uses processed buffer
const extractBrightnessFeatures = async (processedBuffer, width, height) => {
    try {
        const brightnessSize = 64;
        const grayBuffer = await sharp(processedBuffer, { raw: { width, height, channels: 3 } })
            .resize(brightnessSize, brightnessSize)
            .grayscale()
            .raw()
            .toBuffer();

        const pixels = Array.from(grayBuffer);
        const mean = pixels.reduce((sum, pixel) => sum + pixel, 0) / pixels.length;
        const variance = pixels.reduce((sum, pixel) => sum + Math.pow(pixel - mean, 2), 0) / pixels.length;
        const skewness = variance > 0 ? 
            pixels.reduce((sum, pixel) => sum + Math.pow(pixel - mean, 3), 0) / (pixels.length * Math.pow(variance, 1.5)) : 0;

        return [mean / 255, variance / (255 * 255), skewness];
    } catch (error) {
        console.error('Error extracting brightness features:', error);
        return [0, 0, 0];
    }
};

// Extract contrast features - uses processed buffer
const extractContrastFeatures = async (processedBuffer, width, height) => {
    try {
        const contrastSize = 64;
        const grayBuffer = await sharp(processedBuffer, { raw: { width, height, channels: 3 } })
            .resize(contrastSize, contrastSize)
            .grayscale()
            .raw()
            .toBuffer();

        const contrastWidth = contrastSize, contrastHeight = contrastSize;
        let totalContrast = 0;
        let contrastCount = 0;

        // Calculate local contrast
        for (let y = 1; y < contrastHeight - 1; y++) {
            for (let x = 1; x < contrastWidth - 1; x++) {
                const center = grayBuffer[y * contrastWidth + x];
                const neighbors = [
                    grayBuffer[(y-1) * contrastWidth + x],     // top
                    grayBuffer[y * contrastWidth + (x+1)],     // right
                    grayBuffer[(y+1) * contrastWidth + x],     // bottom
                    grayBuffer[y * contrastWidth + (x-1)]      // left
                ];

                const localContrast = neighbors.reduce((sum, neighbor) => {
                    return sum + Math.abs(center - neighbor);
                }, 0) / 4;

                totalContrast += localContrast;
                contrastCount++;
            }
        }

        const avgContrast = contrastCount > 0 ? totalContrast / contrastCount : 0;
        return [avgContrast / 255];
    } catch (error) {
        console.error('Error extracting contrast features:', error);
        return [0];
    }
};

// Combine all features into a weighted vector
const combineFeatures = (features) => {
    const combined = [];
    
    // Weight different features based on importance for product similarity
    const weights = {
        colorHistogram: 0.3,    // Color is very important for products
        dominantColors: 0.25,   // Dominant colors are also crucial
        edgeFeatures: 0.15,     // Shape/edges matter for product recognition
        textureFeatures: 0.15,  // Texture helps distinguish materials
        shapeFeatures: 0.1,     // Basic shape information
        brightness: 0.03,       // Less important but still useful
        contrast: 0.02          // Least important for product matching
    };

    // Apply weights and combine
    Object.entries(features).forEach(([featureType, featureVector]) => {
        const weight = weights[featureType] || 0.1;
        const weightedFeatures = featureVector.map(val => val * weight);
        combined.push(...weightedFeatures);
    });

    return combined;
};

// Enhanced similarity calculation with multiple metrics
const calculateAdvancedSimilarity = (features1, features2) => {
    if (!features1 || !features2 || features1.length !== features2.length) {
        return 0;
    }

    // Calculate multiple similarity metrics
    const cosineSim = calculateCosineSimilarity(features1, features2);
    const euclideanSim = calculateEuclideanSimilarity(features1, features2);
    const correlationSim = calculateCorrelationSimilarity(features1, features2);

    // Weighted combination of similarity metrics
    const finalSimilarity = (
        cosineSim * 0.5 +
        euclideanSim * 0.3 +
        correlationSim * 0.2
    );

    return Math.max(0, Math.min(1, finalSimilarity));
};

// Cosine similarity
const calculateCosineSimilarity = (features1, features2) => {
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < features1.length; i++) {
        dotProduct += features1[i] * features2[i];
        norm1 += features1[i] * features1[i];
        norm2 += features2[i] * features2[i];
    }

    if (norm1 === 0 || norm2 === 0) return 0;
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
};

// Euclidean similarity (converted to similarity from distance)
const calculateEuclideanSimilarity = (features1, features2) => {
    let squaredSum = 0;
    for (let i = 0; i < features1.length; i++) {
        squaredSum += Math.pow(features1[i] - features2[i], 2);
    }
    const distance = Math.sqrt(squaredSum);
    return 1 / (1 + distance); // Convert distance to similarity
};

// Correlation similarity
const calculateCorrelationSimilarity = (features1, features2) => {
    const n = features1.length;
    const mean1 = features1.reduce((sum, val) => sum + val, 0) / n;
    const mean2 = features2.reduce((sum, val) => sum + val, 0) / n;
    
    let numerator = 0;
    let sum1Sq = 0;
    let sum2Sq = 0;
    
    for (let i = 0; i < n; i++) {
        const diff1 = features1[i] - mean1;
        const diff2 = features2[i] - mean2;
        numerator += diff1 * diff2;
        sum1Sq += diff1 * diff1;
        sum2Sq += diff2 * diff2;
    }
    
    const denominator = Math.sqrt(sum1Sq * sum2Sq);
    return denominator === 0 ? 0 : Math.abs(numerator / denominator);
};

// Enhanced product matching with category weighting
const findAdvancedSimilarProducts = (uploadedFeatures, products, limit = 10, categoryBoost = 0.1) => {
    const similarities = products.map(product => {
        let baseSimilarity = calculateAdvancedSimilarity(uploadedFeatures, product.colorFeatures);
        
        // Apply category-based boosting (if we can infer category from features)
        const inferredCategory = inferCategoryFromFeatures(uploadedFeatures);
        if (inferredCategory && product.category.toLowerCase() === inferredCategory.toLowerCase()) {
            baseSimilarity += categoryBoost;
        }

        // Price range consideration (similar-priced items might be more relevant)
        const priceWeight = calculatePriceRelevance(product.price, products);
        
        return {
            ...product.toObject(),
            similarity: Math.min(1, baseSimilarity + priceWeight * 0.05),
            baseSimilarity: baseSimilarity,
            categoryMatch: inferredCategory === product.category,
            priceRange: getPriceRange(product.price)
        };
    });

    // Enhanced sorting with multiple criteria
    return similarities
        .sort((a, b) => {
            // Primary sort by similarity
            if (Math.abs(b.similarity - a.similarity) > 0.05) {
                return b.similarity - a.similarity;
            }
            // Secondary sort by category match
            if (a.categoryMatch !== b.categoryMatch) {
                return b.categoryMatch - a.categoryMatch;
            }
            // Tertiary sort by price (prefer similar price ranges)
            return Math.abs(a.price - 100) - Math.abs(b.price - 100);
        })
        .slice(0, limit)
        .filter(product => product.similarity > 0.15); // Higher threshold for better matches
};

// Helper functions
const rgbToHsv = (r, g, b) => {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    
    let h = 0;
    if (diff !== 0) {
        if (max === r) h = ((g - b) / diff) % 6;
        else if (max === g) h = (b - r) / diff + 2;
        else h = (r - g) / diff + 4;
    }
    h = h / 6;
    if (h < 0) h += 1;
    
    const s = max === 0 ? 0 : diff / max;
    const v = max;
    
    return [h, s, v];
};

const euclideanDistance = (point1, point2) => {
    return Math.sqrt(
        Math.pow(point1[0] - point2[0], 2) +
        Math.pow(point1[1] - point2[1], 2) +
        Math.pow(point1[2] - point2[2], 2)
    );
};

const calculatePerimeter = (binaryBuffer, width, height, threshold) => {
    let perimeter = 0;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const current = binaryBuffer[y * width + x] > threshold;
            if (current) {
                // Check if it's a boundary pixel
                const neighbors = [
                    y > 0 ? binaryBuffer[(y-1) * width + x] > threshold : false,
                    x < width-1 ? binaryBuffer[y * width + (x+1)] > threshold : false,
                    y < height-1 ? binaryBuffer[(y+1) * width + x] > threshold : false,
                    x > 0 ? binaryBuffer[y * width + (x-1)] > threshold : false
                ];
                
                if (neighbors.some(neighbor => !neighbor)) {
                    perimeter++;
                }
            }
        }
    }
    return perimeter;
};

const inferCategoryFromFeatures = (features) => {
    // Simple heuristic-based category inference
    // This is a simplified approach - in practice, you'd use ML classification
    
    if (!features || features.length === 0) return null;
    
    // Analyze feature patterns to guess category
    const avgBrightness = features[features.length - 3] || 0;
    const avgContrast = features[features.length - 1] || 0;
    
    // Very basic heuristics
    if (avgBrightness > 0.8 && avgContrast < 0.3) return 'Electronics';
    if (avgBrightness < 0.4) return 'Fashion';
    if (avgContrast > 0.6) return 'Tools';
    
    return null; // No clear category inference
};

const calculatePriceRelevance = (productPrice, allProducts) => {
    const prices = allProducts.map(p => p.price);
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const priceDeviation = Math.abs(productPrice - avgPrice) / avgPrice;
    return Math.max(0, 1 - priceDeviation); // Higher score for prices closer to average
};

const getPriceRange = (price) => {
    if (price < 30) return 'budget';
    if (price < 100) return 'mid-range';
    if (price < 300) return 'premium';
    return 'luxury';
};

// Updated main extraction function for URLs
const extractFeaturesFromUrl = async (imageUrl) => {
    try {
        console.log(`🌐 Downloading image from: ${imageUrl}`);
        const response = await axios({
            method: 'GET',
            url: imageUrl,
            responseType: 'arraybuffer',
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        const imageBuffer = Buffer.from(response.data);
        console.log(`📊 Extracting advanced features...`);
        return await extractAdvancedFeatures(imageBuffer);
    } catch (error) {
        console.error('❌ Error downloading/processing image from URL:', error.message);
        // Return default features instead of throwing
        console.log('🔄 Returning default features...');
        return new Array(1331).fill(0.001); // Default feature vector
    }
};

// Backward compatibility - keep the old function name
const extractColorFeatures = extractAdvancedFeatures;

// Enhanced similarity calculation - backward compatible
const calculateSimilarity = calculateAdvancedSimilarity;

// Enhanced product finding - backward compatible
const findSimilarProducts = findAdvancedSimilarProducts;

module.exports = {
    extractColorFeatures,
    extractAdvancedFeatures,
    extractFeaturesFromUrl,
    calculateSimilarity,
    calculateAdvancedSimilarity,
    findSimilarProducts,
    findAdvancedSimilarProducts
};