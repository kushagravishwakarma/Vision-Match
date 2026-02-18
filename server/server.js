// Load environment variables FIRST - before any other imports
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 5000;

// Debug: Check if environment variables are loaded
console.log('🔧 Server starting...');
console.log('📍 Port:', PORT);
console.log('🗃️  MongoDB URI:', process.env.MONGODB_URI ? 'Loaded' : 'Missing');
console.log('☁️  Cloudinary Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME ? 'Loaded' : 'Missing');

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Add request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api', uploadRoutes);

// Basic route for testing
app.get('/', (req, res) => {
    res.json({ 
        message: 'Visual Product Matcher API is running!',
        status: 'OK',
        endpoints: {
            'GET /': 'API status',
            'GET /api/products': 'Get all products',
            'POST /api/upload': 'Upload image and find similar products',
            'GET /api/upload': 'Upload endpoint info'
        }
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
});