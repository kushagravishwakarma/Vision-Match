const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    imageUrl: {
        type: String,
        required: true
    },
    cloudinaryId: {
        type: String,
        required: true
    },
    // Enhanced feature storage
    colorFeatures: {
        type: [Number],
        default: []
    },
    // Additional feature vectors for better matching
    visualFeatures: {
        colorHistogram: {
            type: [Number],
            default: []
        },
        edgeFeatures: {
            type: [Number],
            default: []
        },
        textureFeatures: {
            type: [Number],
            default: []
        },
        shapeFeatures: {
            type: [Number],
            default: []
        },
        dominantColors: {
            type: [Number],
            default: []
        },
        brightnessFeatures: {
            type: [Number],
            default: []
        },
        contrastFeatures: {
            type: [Number],
            default: []
        }
    },
    // Metadata for improved matching
    productMetadata: {
        inferredCategory: {
            type: String,
            default: null
        },
        priceRange: {
            type: String,
            enum: ['budget', 'mid-range', 'premium', 'luxury'],
            default: 'mid-range'
        },
        dominantColorNames: {
            type: [String],
            default: []
        },
        averageBrightness: {
            type: Number,
            default: 0
        },
        averageContrast: {
            type: Number,
            default: 0
        }
    },
    description: {
        type: String,
        trim: true
    },
    // Enhanced search and matching metadata
    searchTags: {
        type: [String],
        default: []
    },
    // Quality metrics for the image analysis
    analysisQuality: {
        imageProcessingSuccess: {
            type: Boolean,
            default: true
        },
        featureExtractionScore: {
            type: Number,
            min: 0,
            max: 1,
            default: 1
        },
        lastAnalyzed: {
            type: Date,
            default: Date.now
        }
    }
}, {
    timestamps: true
});

// Enhanced indexes for better query performance
productSchema.index({ category: 1, 'productMetadata.priceRange': 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'productMetadata.dominantColorNames': 1 });
productSchema.index({ 'productMetadata.inferredCategory': 1 });
productSchema.index({ searchTags: 1 });

// Pre-save middleware to automatically calculate metadata
productSchema.pre('save', function(next) {
    // Calculate price range
    if (this.price < 30) this.productMetadata.priceRange = 'budget';
    else if (this.price < 100) this.productMetadata.priceRange = 'mid-range';
    else if (this.price < 300) this.productMetadata.priceRange = 'premium';
    else this.productMetadata.priceRange = 'luxury';
    
    // Generate search tags from name and category
    const nameTags = this.name.toLowerCase().split(/\s+/);
    const categoryTags = this.category.toLowerCase().split(/\s+/);
    this.searchTags = [...new Set([...nameTags, ...categoryTags])];
    
    next();
});

// Instance method to calculate feature completeness
productSchema.methods.getFeatureCompleteness = function() {
    const features = this.visualFeatures;
    let completeness = 0;
    let totalFeatures = 0;
    
    Object.keys(features).forEach(featureType => {
        totalFeatures++;
        if (features[featureType] && features[featureType].length > 0) {
            const nonZeroFeatures = features[featureType].filter(f => f !== 0).length;
            if (nonZeroFeatures > 0) completeness++;
        }
    });
    
    return totalFeatures > 0 ? completeness / totalFeatures : 0;
};

// Static method to find products by advanced criteria
productSchema.statics.findSimilarByFeatures = async function(features, options = {}) {
    const {
        limit = 10,
        minSimilarity = 0.15,
        categoryFilter = null,
        priceRange = null,
        excludeIds = []
    } = options;
    
    const query = {};
    if (categoryFilter) query.category = categoryFilter;
    if (priceRange) query['productMetadata.priceRange'] = priceRange;
    if (excludeIds.length > 0) query._id = { $nin: excludeIds };
    
    const products = await this.find(query);
    
    // Calculate similarities and sort
    const similarities = products.map(product => ({
        ...product.toObject(),
        similarity: calculateAdvancedSimilarity(features, product.colorFeatures)
    }));
    
    return similarities
        .filter(product => product.similarity >= minSimilarity)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);
};

// Virtual for getting color palette
productSchema.virtual('colorPalette').get(function() {
    if (!this.visualFeatures.dominantColors || this.visualFeatures.dominantColors.length < 15) {
        return [];
    }
    
    const colors = [];
    for (let i = 0; i < 15; i += 3) {
        const r = Math.round(this.visualFeatures.dominantColors[i] * 255);
        const g = Math.round(this.visualFeatures.dominantColors[i + 1] * 255);
        const b = Math.round(this.visualFeatures.dominantColors[i + 2] * 255);
        colors.push(`rgb(${r}, ${g}, ${b})`);
    }
    return colors;
});

// Ensure virtuals are included in JSON output
productSchema.set('toJSON', { virtuals: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;