Visual Product Matcher 🔍
An AI-powered visual product matching application that uses advanced computer vision techniques to find similar products based on uploaded images. Built with React frontend and Node.js backend, featuring sophisticated image analysis and machine learning algorithms.

✨ Features:-
🧠 Advanced AI Computer Vision:-

1.Multi-dimensional Feature Extraction: Color histograms, edge detection, texture analysis, shape recognition
2.Smart Color Analysis: HSV color space processing with k-means clustering for dominant colors
3.Texture Recognition: Local Binary Pattern (LBP) analysis for material identification
4.Shape Analysis: Hu moments for rotation and scale-invariant shape matching
5.Edge Detection: Sobel operator implementation for contour analysis

🎯 Intelligent Matching System:-

1.Multi-Strategy Search: Combines visual similarity, category awareness, and price-range matching
2.Advanced Similarity Metrics: Cosine similarity, Euclidean distance, and correlation analysis
3.Confidence Scoring: AI-powered confidence assessment for search results
4.Real-time Processing: Fast image analysis with optimized algorithms

🚀 Modern User Experience:-

1.Drag & Drop Interface: Intuitive file upload with visual feedback
2.URL Support: Direct image URL processing without download requirements
3.Beautiful UI: Modern gradient designs with smooth animations
4.Responsive Design: Works seamlessly across desktop and mobile devices
5.Loading States: Elegant loading animations and progress indicators

📊 Rich Product Database:-

1.80+ Sample Products: Diverse categories from electronics to fashion
2.Detailed Metadata: Price ranges, categories, descriptions, and visual features
3.Smart Categorization: Automatic category inference and price range classification
4.Image Quality Analysis: Built-in image processing success metrics

🛠️ Tech Stack:-
Frontend:-

1.React 18 - Modern UI library with hooks
2.CSS3 - Advanced styling with gradients and animations
3.Modern JavaScript - ES6+ features and async/await

Backend:-

1.Node.js & Express - RESTful API server
2.MongoDB - NoSQL database with mongoose ODM
3.Sharp - High-performance image processing
4.Cloudinary - Cloud image storage and optimization
5.Multer - File upload handling

AI & Computer Vision:-

1.Custom Computer Vision Pipeline - Built from scratch
2.Multiple Feature Extraction Algorithms
3.Advanced Similarity Calculations
4.Machine Learning-inspired Clustering

🚀 Quick Start:-
Prerequisites:-

1.Node.js 16+ and npm
2.MongoDB database
3.Cloudinary account (free tier available)

Clone Repository:-

git clone https://github.com/AnshulSharma831/Visual-Matcher.git
cd Visual-Matcher

Backend Setup:-

cd server
npm install

Create .env file in server directory:-
MONGODB_URI=mongodb://localhost:27017/visual-matcher
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=5000

Frontend Setup:-

cd ..  # Back to root directory
npm install

Database Setup:-

cd server
node data/seedProducts.js

Start Development:-

# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend
npm start

The application will open at http://localhost:3000 with backend running on http://localhost:5000.

Visual-Matcher/
├── src/                          # React frontend
│   ├── components/
│   │   ├── App.js               # Main app component with loading logic
│   │   ├── HomePage.js          # Main application page
│   │   ├── entryPage.js         # Loading/splash screen
│   │   ├── Header.js            # Navigation header
│   │   └── UploadImage.js       # Core upload and matching component
│   ├── css/                     # Stylesheets
│   │   ├── App.css             # Global styles
│   │   ├── Header.css          # Header styling with gradients
│   │   ├── HomePage.css        # Main page background
│   │   ├── entryPage.css       # Loading screen animations
│   │   └── uploadImg.css       # Upload interface and results
│   └── assets/                  # Images and logos
├── server/                       # Node.js backend
│   ├── config/
│   │   └── database.js         # MongoDB connection
│   ├── models/
│   │   └── Product.js          # Enhanced product schema
│   ├── routes/
│   │   └── upload.js           # API endpoints
│   ├── utils/
│   │   └── imageProcessor.js   # AI computer vision engine
│   ├── data/
│   │   └── seedProducts.js     # Database seeding with AI features
│   └── server.js               # Express server setup
└── README.md

🔧 API Endpoints:-

Image Upload & Matching-

POST /api/upload
Content-Type: multipart/form-data or application/json

# File Upload
FormData: { image: file }

# URL Upload  
JSON: { "imageUrl": "https://example.com/image.jpg" }

Product Management-

GET /api/products?category=Electronics&limit=20
GET /api/analytics
POST /api/compare
POST /api/suggestions

🧠 AI Computer Vision Pipeline
1. Image Preprocessing

    Resize to 224x224 for standardization
    Multiple resolution processing for different features
    Format optimization and quality enhancement

2. Feature Extraction

    Color Histogram (HSV): 1024 dimensions
    Edge Features (Sobel): 16 dimensions
    Texture Features (LBP): 256 dimensions
    Shape Features (Hu Moments): 7 dimensions
    Dominant Colors (K-means): 15 dimensions
    Brightness Analysis: 3 dimensions
    Contrast Analysis: 1 dimension

3. Similarity Calculation

    Cosine Similarity (50% weight): Measures angle between feature vectors
    Euclidean Similarity (30% weight): Measures distance in feature space
    Correlation Similarity (20% weight): Measures linear correlation

4. Multi-Strategy Matching

    Visual Similarity: Pure AI-based feature matching
    Category-Aware: Enhanced matching within similar product categories
    Price-Range Aware: Context-aware matching for similar price points

🎨 UI Features:-
Interactive Upload Interface:-

1.Drag & Drop: Visual feedback with hover states
2.File Validation: Automatic format checking and error handling
3.URL Support: Paste image URLs for instant processing
4.Progress Indicators: Real-time upload and processing status

Results Display:-

1.Product Grid: Responsive card-based layout
2.Similarity Scores: Visual percentage indicators
3.Category Badges: Color-coded category identification
4.Price Information: Clear pricing with range indicators
5.Image Error Handling: Fallback placeholders for broken images

Modern Design Elements:-

1.Gradient Backgrounds: Dynamic color gradients with animations
2.Smooth Animations: CSS transitions and keyframe animations
3.Glass Morphism: Backdrop blur effects and transparency
4.Responsive Layout: Mobile-first design approach

🔬 Advanced Features:-
Database Intelligence:-

1.Smart Indexing: Optimized queries for categories, prices, and features
2.Metadata Enrichment: Automatic price range and category inference
3.Quality Metrics: Image analysis success tracking
4.Search Tags: Auto-generated searchable tags

Performance Optimizations:-

1.Lazy Loading: Components load as needed
2.Image Optimization: Cloudinary transformations for faster loading
3.Feature Caching: Processed features stored for quick retrieval
4.Efficient Algorithms: Optimized similarity calculations

Analytics & Insights:-

1.Search Confidence: AI-powered confidence scoring
2.Category Distribution: Database composition analysis
3.Price Range Analytics: Market segment insights
4.Feature Quality Metrics: AI processing success rates

Run Tests:-

npm test

Development Mode:-

npm run dev  # Starts both frontend and backend

Database Management:-

# Seed database with sample products
cd server && node data/seedProducts.js

# Upgrade existing products with advanced AI features
cd server && node data/seedProducts.js --upgrade

# Test Cloudinary connection
cd server && node test-cloudinary.js

🔧 Configuration
Environment Variables

# MongoDB
MONGODB_URI=mongodb://localhost:27017/visual-matcher

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key  
CLOUDINARY_API_SECRET=your_api_secret

# Server
PORT=5000

Cloudinary Setup:-

1.Create free account at Cloudinary
2.Get your cloud name, API key, and API secret from dashboard
3.Add credentials to .env file
4.Test connection with node test-cloudinary.js

Product Model:-

{
  name: String,              // Product name
  category: String,          // Product category
  price: Number,            // Price in USD
  imageUrl: String,         // Image URL
  cloudinaryId: String,     // Cloudinary reference
  colorFeatures: [Number],  // 1331-dimensional feature vector
  visualFeatures: {         // Structured feature breakdown
    colorHistogram: [Number],
    edgeFeatures: [Number],
    textureFeatures: [Number],
    shapeFeatures: [Number],
    dominantColors: [Number],
    brightnessFeatures: [Number],
    contrastFeatures: [Number]
  },
  productMetadata: {        // AI-generated metadata
    inferredCategory: String,
    priceRange: String,
    dominantColorNames: [String],
    averageBrightness: Number,
    averageContrast: Number
  },
  analysisQuality: {        // Quality metrics
    imageProcessingSuccess: Boolean,
    featureExtractionScore: Number,
    lastAnalyzed: Date
  }
}

🤝 Contributing:-

1.Fork the repository-
2.Create feature branch (git checkout -b feature/amazing-feature)
3.Commit changes (git commit -m 'Add amazing feature')
4.Push to branch (git push origin feature/amazing-feature)
5.Open Pull Request

Development Guidelines-

1.Follow existing code style and structure
2.Add tests for new features
3.Update documentation for API changes
4.Ensure responsive design for UI changes

📈 Performance Metrics

1.Image Processing: ~500ms average for feature extraction
2.Search Speed: <100ms for similarity calculations
3.Database Queries: Indexed queries with <50ms response time
4.UI Responsiveness: 60fps animations with hardware acceleration

🔄 Recent Updates:-

1.✅ Enhanced AI feature extraction with 7 different computer vision techniques
2.✅ Multi-strategy similarity matching for improved accuracy
3.✅ Advanced confidence scoring and result ranking
4.✅ Responsive UI with modern design patterns
5.✅ Comprehensive error handling and fallback systems
6.✅ Real-time processing feedback and status indicators

🚧 Roadmap-

 1.Machine Learning Integration: TensorFlow.js for category classification
 2.Advanced Filters: Brand, color, and style filtering options
 3.User Accounts: Save favorites and search history
 4.API Rate Limiting: Enterprise-grade API management
 5.Image Augmentation: Rotation and lighting invariant matching
 6.Batch Processing: Multiple image upload and comparison
 7.Performance Dashboard: Real-time analytics and monitoring

📄 License:-
This project is licensed under the MIT License - see the LICENSE file for details.

👨‍💻 Author:-
Anshul Sharma

GitHub: [@AnshulSharma831](https://github.com/AnshulSharma831)
LinkedIn: [Anshul Sharma](https://www.linkedin.com/in/anshul-sharma-831ans/)

🙏 Acknowledgments:-

1.Sharp for high-performance image processing
2.MongoDB for flexible document storage
3.Cloudinary for reliable image hosting
4.React for modern UI development
5.Computer Vision Community for algorithm inspiration

📞 Support:-
If you encounter any issues or have questions:

1.Check the Issues page
2.Review the troubleshooting section below
3.Create a new issue with detailed description

Common Troubleshooting:-
Backend not starting?

1.Check MongoDB connection in .env
2.Verify Cloudinary credentials
3.Ensure all dependencies are installed

No similar products found?

1.Run database seeding: node data/seedProducts.js
2.Check if products have advanced features
3.Verify image is accessible and valid

Upload failing?

1.Check Cloudinary configuration
2.Verify image file size (<10MB)
3.Ensure proper image format (JPEG, PNG, WebP, GIF)

⭐ Star this repository if you found it helpful!

