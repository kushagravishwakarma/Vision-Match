const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Product = require('../models/Product');
const { 
    extractAdvancedFeatures,
    extractFeaturesFromUrl, 
    findAdvancedSimilarProducts,
    calculateAdvancedSimilarity
} = require('../utils/imageProcessor');

const router = express.Router();

// Debug environment variables
console.log('Environment variables check:');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Not set');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not set');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not set');

// Configure Cloudinary with explicit error checking
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('❌ Cloudinary configuration missing! Please check your .env file');
    console.log('Required variables: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
} else {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    console.log('✅ Cloudinary configured successfully');
}

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Enhanced upload endpoint with advanced AI matching
router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        console.log('📝 Enhanced upload request received');
        console.log('File:', req.file ? `Present (${req.file.size} bytes)` : 'Not present');
        console.log('URL:', req.body.imageUrl ? 'Present' : 'Not present');

        let uploadedImageUrl;
        let imageFeatures;
        let analysisQuality = { success: true, score: 1.0 };

        // Handle file upload
        if (req.file) {
            console.log('🔄 Processing file upload with advanced AI...');
            
            // Check Cloudinary config again
            if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
                throw new Error('Cloudinary configuration is missing. Please check your .env file.');
            }

            // Upload to Cloudinary
            const uploadResult = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        resource_type: 'image',
                        folder: 'uploads',
                        transformation: [
                            { width: 800, height: 800, crop: 'limit' },
                            { quality: 'auto' },
                            { format: 'auto' }
                        ]
                    },
                    (error, result) => {
                        if (error) {
                            console.error('Cloudinary upload error:', error);
                            reject(error);
                        } else {
                            console.log('✅ Cloudinary upload successful');
                            resolve(result);
                        }
                    }
                ).end(req.file.buffer);
            });

            uploadedImageUrl = uploadResult.secure_url;
            console.log('📸 Image uploaded to:', uploadedImageUrl);
            
            // Extract advanced features from uploaded image
            console.log('🧠 Extracting advanced AI features...');
            try {
                imageFeatures = await extractAdvancedFeatures(req.file.buffer);
                console.log(`✨ Extracted ${imageFeatures.length} feature dimensions`);
            } catch (featureError) {
                console.warn('⚠️ Feature extraction partially failed, using fallback');
                analysisQuality.success = false;
                analysisQuality.score = 0.5;
                imageFeatures = new Array(1331).fill(0.001);
            }
        }
        // Handle URL upload
        else if (req.body.imageUrl) {
            console.log('🔗 Processing URL upload with advanced AI...');
            uploadedImageUrl = req.body.imageUrl;
            
            // Extract advanced features from URL image
            console.log('🧠 Extracting advanced AI features from URL...');
            try {
                imageFeatures = await extractFeaturesFromUrl(req.body.imageUrl);
                console.log(`✨ Extracted ${imageFeatures.length} feature dimensions`);
            } catch (featureError) {
                console.warn('⚠️ Feature extraction from URL failed, using fallback');
                analysisQuality.success = false;
                analysisQuality.score = 0.3;
                imageFeatures = new Array(1331).fill(0.001);
            }
        }
        else {
            return res.status(400).json({ error: 'No image file or URL provided' });
        }

        console.log('🔍 Finding similar products with advanced AI matching...');
        
        // Get all products from database
        const allProducts = await Product.find({});
        console.log(`📦 Found ${allProducts.length} products in database`);
        
        if (allProducts.length === 0) {
            return res.status(404).json({ 
                error: 'No products found in database. Please seed the database first.' 
            });
        }

        // Enhanced similarity search with multiple strategies
        const searchStrategies = [
            // Strategy 1: Direct advanced similarity
            {
                name: 'AI Visual Similarity',
                products: findAdvancedSimilarProducts(imageFeatures, allProducts, 8)
            },
            // Strategy 2: Category-aware search
            {
                name: 'Category-Enhanced',
                products: findCategoryAwareSimilarProducts(imageFeatures, allProducts, 6)
            },
            // Strategy 3: Price-range aware search
            {
                name: 'Price-Range Similar',
                products: findPriceAwareSimilarProducts(imageFeatures, allProducts, 4)
            }
        ];

        // Combine and deduplicate results
        const combinedResults = combineSearchResults(searchStrategies);
        const topResults = combinedResults.slice(0, 12); // Return top 12 results

        // Calculate additional metadata
        const analysisMetadata = {
            totalProductsAnalyzed: allProducts.length,
            featureDimensions: imageFeatures.length,
            averageSimilarity: topResults.length > 0 
                ? topResults.reduce((sum, p) => sum + p.similarity, 0) / topResults.length 
                : 0,
            analysisQuality: analysisQuality,
            searchStrategies: searchStrategies.map(s => ({
                name: s.name,
                resultsFound: s.products.length
            })),
            confidence: calculateSearchConfidence(topResults)
        };

        console.log(`✨ Enhanced AI search complete: Found ${topResults.length} highly similar products`);
        console.log(`🎯 Average similarity score: ${analysisMetadata.averageSimilarity.toFixed(3)}`);
        console.log(`🔬 Search confidence: ${analysisMetadata.confidence.toFixed(3)}`);

        res.json({
            success: true,
            uploadedImageUrl: uploadedImageUrl,
            similarProducts: topResults,
            metadata: analysisMetadata,
            message: `AI found ${topResults.length} visually similar products with ${(analysisMetadata.confidence * 100).toFixed(1)}% confidence`
        });

    } catch (error) {
        console.error('❌ Enhanced upload error:', error);
        res.status(500).json({ 
            error: 'Failed to process image with AI',
            details: error.message,
            suggestion: 'Try uploading a clearer image or check if the image URL is accessible'
        });
    }
});

// Category-aware similarity search
const findCategoryAwareSimilarProducts = (uploadedFeatures, products, limit) => {
    // Group products by category
    const categorizedProducts = {};
    products.forEach(product => {
        if (!categorizedProducts[product.category]) {
            categorizedProducts[product.category] = [];
        }
        categorizedProducts[product.category].push(product);
    });

    // Find best matches within each category
    const categoryResults = [];
    Object.entries(categorizedProducts).forEach(([category, categoryProducts]) => {
        const categoryMatches = findAdvancedSimilarProducts(uploadedFeatures, categoryProducts, 2);
        categoryResults.push(...categoryMatches.map(product => ({
            ...product,
            matchType: 'category-aware',
            category: category
        })));
    });

    return categoryResults
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);
};

// Price-range aware similarity search
const findPriceAwareSimilarProducts = (uploadedFeatures, products, limit) => {
    // Calculate average similarity to infer likely price range
    const similarities = products.map(product => ({
        ...product.toObject(),
        similarity: calculateAdvancedSimilarity(uploadedFeatures, product.colorFeatures)
    }));

    // Find the price range of the most similar products
    const topSimilar = similarities
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5);

    if (topSimilar.length === 0) return [];

    const avgPrice = topSimilar.reduce((sum, p) => sum + p.price, 0) / topSimilar.length;
    const priceRange = getPriceRange(avgPrice);

    // Find products in similar price range
    const priceFilteredProducts = products.filter(product => {
        const productPriceRange = getPriceRange(product.price);
        return productPriceRange === priceRange || 
               Math.abs(product.price - avgPrice) / avgPrice < 0.5; // Within 50% of average
    });

    return findAdvancedSimilarProducts(uploadedFeatures, priceFilteredProducts, limit)
        .map(product => ({
            ...product,
            matchType: 'price-aware',
            inferredPriceRange: priceRange
        }));
};

// Combine results from multiple search strategies
const combineSearchResults = (searchStrategies) => {
    const allResults = [];
    const seenIds = new Set();

    // Add results from each strategy with different weights
    const strategyWeights = {
        'AI Visual Similarity': 1.0,
        'Category-Enhanced': 0.8,
        'Price-Range Similar': 0.6
    };

    searchStrategies.forEach(strategy => {
        strategy.products.forEach(product => {
            if (!seenIds.has(product._id.toString())) {
                seenIds.add(product._id.toString());
                
                // Apply strategy weight to similarity score
                const weight = strategyWeights[strategy.name] || 0.5;
                const weightedSimilarity = product.similarity * weight;
                
                allResults.push({
                    ...product,
                    similarity: weightedSimilarity,
                    matchStrategy: strategy.name,
                    originalSimilarity: product.similarity
                });
            }
        });
    });

    return allResults.sort((a, b) => b.similarity - a.similarity);
};

// Calculate search confidence based on result quality
const calculateSearchConfidence = (results) => {
    if (results.length === 0) return 0;
    
    const topSimilarity = results[0].similarity;
    const avgSimilarity = results.reduce((sum, p) => sum + p.similarity, 0) / results.length;
    const similarityVariance = results.reduce((sum, p) => sum + Math.pow(p.similarity - avgSimilarity, 2), 0) / results.length;
    
    // Higher confidence when:
    // - Top result has high similarity
    // - Results have consistent similarity scores (low variance)
    // - Multiple good results found
    const topScore = Math.min(topSimilarity * 2, 1); // Cap at 1.0
    const consistencyScore = Math.max(0, 1 - similarityVariance * 10);
    const quantityScore = Math.min(results.length / 10, 1);
    
    return (topScore * 0.5 + consistencyScore * 0.3 + quantityScore * 0.2);
};

// Helper function for price range calculation
const getPriceRange = (price) => {
    if (price < 30) return 'budget';
    if (price < 100) return 'mid-range';
    if (price < 300) return 'premium';
    return 'luxury';
};

// GET /api/products - Enhanced product listing with analytics
router.get('/products', async (req, res) => {
    try {
        const { category, priceRange, limit = 50 } = req.query;
        
        // Build query
        const query = {};
        if (category) query.category = new RegExp(category, 'i');
        if (priceRange) query['productMetadata.priceRange'] = priceRange;
        
        const products = await Product.find(query).limit(parseInt(limit));
        
        // Calculate analytics
        const analytics = {
            totalProducts: await Product.countDocuments(),
            categoriesAvailable: await Product.distinct('category'),
            priceRanges: await Product.aggregate([
                {
                    $group: {
                        _id: '$productMetadata.priceRange',
                        count: { $sum: 1 },
                        avgPrice: { $avg: '$price' },
                        minPrice: { $min: '$price' },
                        maxPrice: { $max: '$price' }
                    }
                }
            ]),
            featureQuality: await Product.aggregate([
                {
                    $project: {
                        hasAdvancedFeatures: {
                            $cond: {
                                if: { $gt: [{ $size: '$colorFeatures' }, 100] },
                                then: 1,
                                else: 0
                            }
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        productsWithAdvancedFeatures: { $sum: '$hasAdvancedFeatures' },
                        totalProducts: { $sum: 1 }
                    }
                }
            ])
        };

        res.json({
            success: true,
            products: products,
            count: products.length,
            analytics: analytics,
            query: { category, priceRange, limit }
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ 
            error: 'Failed to fetch products',
            details: error.message 
        });
    }
});

// New endpoint: Advanced product comparison
router.post('/compare', async (req, res) => {
    try {
        const { productIds } = req.body;
        
        if (!productIds || !Array.isArray(productIds) || productIds.length < 2) {
            return res.status(400).json({ 
                error: 'Please provide at least 2 product IDs to compare' 
            });
        }

        const products = await Product.find({ _id: { $in: productIds } });
        
        if (products.length !== productIds.length) {
            return res.status(404).json({ 
                error: 'Some products not found' 
            });
        }

        // Calculate pairwise similarities
        const comparisons = [];
        for (let i = 0; i < products.length; i++) {
            for (let j = i + 1; j < products.length; j++) {
                const similarity = calculateAdvancedSimilarity(
                    products[i].colorFeatures, 
                    products[j].colorFeatures
                );
                
                comparisons.push({
                    product1: {
                        id: products[i]._id,
                        name: products[i].name,
                        category: products[i].category
                    },
                    product2: {
                        id: products[j]._id,
                        name: products[j].name,
                        category: products[j].category
                    },
                    visualSimilarity: similarity,
                    categoryMatch: products[i].category === products[j].category,
                    priceRatio: Math.min(products[i].price, products[j].price) / Math.max(products[i].price, products[j].price)
                });
            }
        }

        res.json({
            success: true,
            products: products,
            comparisons: comparisons,
            overallSimilarity: comparisons.reduce((sum, comp) => sum + comp.visualSimilarity, 0) / comparisons.length
        });

    } catch (error) {
        console.error('Error comparing products:', error);
        res.status(500).json({ 
            error: 'Failed to compare products',
            details: error.message 
        });
    }
});

// New endpoint: Search suggestions based on partial image analysis
router.post('/suggestions', upload.single('image'), async (req, res) => {
    try {
        let imageFeatures;
        
        if (req.file) {
            imageFeatures = await extractAdvancedFeatures(req.file.buffer);
        } else if (req.body.imageUrl) {
            imageFeatures = await extractFeaturesFromUrl(req.body.imageUrl);
        } else {
            return res.status(400).json({ error: 'No image provided' });
        }

        // Get quick suggestions without full processing
        const allProducts = await Product.find({}).select('name category price imageUrl colorFeatures');
        const quickMatches = findAdvancedSimilarProducts(imageFeatures, allProducts, 5);
        
        // Extract suggested categories and price ranges
        const suggestedCategories = [...new Set(quickMatches.map(p => p.category))];
        const suggestedPriceRanges = [...new Set(quickMatches.map(p => getPriceRange(p.price)))];
        
        res.json({
            success: true,
            suggestions: {
                categories: suggestedCategories,
                priceRanges: suggestedPriceRanges,
                quickMatches: quickMatches.slice(0, 3),
                confidence: calculateSearchConfidence(quickMatches)
            }
        });

    } catch (error) {
        console.error('Error generating suggestions:', error);
        res.status(500).json({ 
            error: 'Failed to generate suggestions',
            details: error.message 
        });
    }
});

// Enhanced analytics endpoint
router.get('/analytics', async (req, res) => {
    try {
        const analytics = await Product.aggregate([
            {
                $facet: {
                    categoryStats: [
                        {
                            $group: {
                                _id: '$category',
                                count: { $sum: 1 },
                                avgPrice: { $avg: '$price' },
                                avgFeatureQuality: { $avg: '$analysisQuality.featureExtractionScore' }
                            }
                        }
                    ],
                    priceDistribution: [
                        {
                            $bucket: {
                                groupBy: '$price',
                                boundaries: [0, 30, 100, 300, 1000, 10000],
                                default: 'expensive',
                                output: {
                                    count: { $sum: 1 },
                                    avgSimilarityScore: { $avg: '$analysisQuality.featureExtractionScore' }
                                }
                            }
                        }
                    ],
                    overallStats: [
                        {
                            $group: {
                                _id: null,
                                totalProducts: { $sum: 1 },
                                avgPrice: { $avg: '$price' },
                                avgFeatureQuality: { $avg: '$analysisQuality.featureExtractionScore' },
                                lastUpdated: { $max: '$updatedAt' }
                            }
                        }
                    ]
                }
            }
        ]);

        res.json({
            success: true,
            analytics: analytics[0],
            systemInfo: {
                aiEnhanced: true,
                featureTypes: ['color', 'edge', 'texture', 'shape', 'brightness', 'contrast'],
                supportedFormats: ['JPEG', 'PNG', 'WebP', 'GIF'],
                maxFileSize: '10MB'
            }
        });

    } catch (error) {
        console.error('Error generating analytics:', error);
        res.status(500).json({ 
            error: 'Failed to generate analytics',
            details: error.message 
        });
    }
});

// GET /api/upload - Enhanced info endpoint
router.get('/upload', (req, res) => {
    res.json({
        message: 'Enhanced AI-powered upload endpoint is ready',
        features: [
            'Advanced computer vision with multiple feature types',
            'Color histogram analysis in HSV color space',
            'Edge detection using Sobel operators',
            'Texture analysis with Local Binary Patterns',
            'Shape analysis with Hu moments',
            'Dominant color extraction with k-means clustering',
            'Brightness and contrast analysis',
            'Multi-strategy similarity matching',
            'Category-aware and price-aware search',
            'Confidence scoring for results'
        ],
        endpoints: {
            'POST /api/upload': 'Upload image file or URL to find similar products (Enhanced AI)',
            'GET /api/products': 'Get all products with analytics',
            'POST /api/compare': 'Compare multiple products visually',
            'POST /api/suggestions': 'Get quick suggestions from partial image analysis',
            'GET /api/analytics': 'Get database and AI performance analytics'
        },
        usage: {
            fileUpload: 'Send multipart/form-data with "image" field',
            urlUpload: 'Send JSON with "imageUrl" field',
            maxFileSize: '10MB',
            supportedFormats: ['JPEG', 'PNG', 'WebP', 'GIF']
        }
    });
});

module.exports = router;