import UploadImgLogo from './assets/UploadImageLogo.png';
import './css/uploadImg.css';
import { useState } from 'react';

function UploadImg({ onUploadSuccess }) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(''); // '', 'success', 'error'
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [similarProducts, setSimilarProducts] = useState([]);
    const [uploadResult, setUploadResult] = useState(null);
    const [uploadedImagePreview, setUploadedImagePreview] = useState(null); // New state for image preview

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleFileSelect = (file) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            setUploadStatus('error');
            setTimeout(() => setUploadStatus(''), 3000);
            return;
        }

        setSelectedFile(file);
        setUploadStatus('success');
        
        // Create preview URL for the uploaded file
        const previewUrl = URL.createObjectURL(file);
        setUploadedImagePreview(previewUrl);
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setUploadStatus('');
        setIsLoading(false);
        setImageUrl('');
        setSimilarProducts([]);
        setUploadResult(null);
        
        // Clean up the preview URL to prevent memory leaks
        if (uploadedImagePreview) {
            URL.revokeObjectURL(uploadedImagePreview);
            setUploadedImagePreview(null);
        }
        
        // Clear the file input
        const fileInput = document.querySelector('.upload');
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const handleUrlChange = (e) => {
        setImageUrl(e.target.value);
    };

    const handleUrlSubmit = async (e) => {
        if (e.key === 'Enter' && imageUrl.trim()) {
            setIsLoading(true);
            setUploadStatus('');
            
            try {
                // Validate if URL is an image
                const response = await fetch(imageUrl, { 
                    method: 'HEAD',
                    mode: 'cors'
                });
                const contentType = response.headers.get('content-type');
                
                if (!contentType || !contentType.startsWith('image/')) {
                    throw new Error('Invalid image URL');
                }
                
                // Create a mock file object for URL images
                const mockFile = {
                    name: imageUrl.split('/').pop() || 'image-from-url',
                    size: parseInt(response.headers.get('content-length')) || 0,
                    type: contentType,
                    url: imageUrl
                };
                
                setSelectedFile(mockFile);
                setUploadStatus('success');
                setUploadedImagePreview(imageUrl); // Set preview to the URL directly
            } catch (error) {
                console.error('URL validation error:', error);
                setUploadStatus('error');
                setTimeout(() => setUploadStatus(''), 3000);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleSubmit = async () => {
        if (!selectedFile && !imageUrl.trim()) return;
        
        setIsLoading(true);
        setUploadStatus('');
        
        try {
            const formData = new FormData();
            
            if (selectedFile && !selectedFile.url) {
                // File upload
                formData.append('image', selectedFile);
            } else {
                // URL upload - use the imageUrl state instead of selectedFile
                formData.append('imageUrl', imageUrl.trim());
            }
            
            // FIXED: Corrected API endpoint URL with proper error handling
            const response = await fetch('http://localhost:5000/api/upload', {
                method: 'POST',
                body: formData,
                // Don't set Content-Type header - let browser set it for FormData
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('Upload successful:', result);
                
                setUploadResult(result);
                setSimilarProducts(result.similarProducts || []);
                setUploadStatus('success');
                
                // Store the uploaded image URL from the response for display
                if (result.uploadedImageUrl && !uploadedImagePreview) {
                    setUploadedImagePreview(result.uploadedImageUrl);
                }
                
                // Call parent component callback if provided
                if (onUploadSuccess) {
                    onUploadSuccess(result);
                }
            } else {
                const errorData = await response.json().catch(() => ({ error: 'Network error' }));
                throw new Error(errorData.error || `Server error: ${response.status}`);
            }
        } catch (error) {
            console.error('Upload error:', error);
            setUploadStatus('error');
            
            // Show more specific error message
            const errorMessage = error.message.includes('fetch') 
                ? 'Cannot connect to server. Make sure the backend is running on port 5000.'
                : error.message;
            
            // You could set an error message state here to display to user
            console.error('Detailed error:', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div 
                className={`Upload-Section ${isDragOver ? 'drag-over' : ''} ${uploadStatus ? `upload-${uploadStatus}` : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <img src={UploadImgLogo} alt="Upload" />
                
                <div className="upload-input-container">
                    <input 
                        type="file" 
                        accept="image/*" 
                        className="upload"
                        onChange={handleFileChange}
                        disabled={isLoading}
                    />
                    <div className="upload-button">
                        {isLoading && <div className="loading-spinner"></div>}
                        <div className="upload-text">
                            {isLoading ? 'Processing...' : 'Choose Image or Drag & Drop'}
                        </div>
                        <div className="upload-subtext">
                            {isLoading ? 'Please wait' : 'PNG, JPG, GIF up to 10MB'}
                        </div>
                    </div>
                </div>

                {selectedFile && (uploadStatus === 'success' || uploadStatus === '') && (
                    <div className="file-info">
                        <div className="file-details">
                            <div className="file-name">✓ {selectedFile.name}</div>
                            <div className="file-size">{formatFileSize(selectedFile.size)}</div>
                        </div>
                        <button 
                            className="remove-file-btn"
                            onClick={handleRemoveFile}
                            title="Remove file"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {uploadStatus === 'error' && (
                    <div className="file-info" style={{borderLeftColor: '#dc3545', backgroundColor: 'rgba(220, 53, 69, 0.1)'}}>
                        <div className="file-name" style={{color: '#dc3545'}}>✗ Please select a valid image file or check your connection</div>
                    </div>
                )}
                {uploadResult && (
                <div className="scroll-message">
                    <p>Scroll Down 👇</p>
                </div>
                )}
                
                <h1 className="or">OR</h1>
                
                <input 
                    type="text" 
                    placeholder="Paste Image URL" 
                    className="url"
                    value={imageUrl}
                    onChange={handleUrlChange}
                    onKeyDown={handleUrlSubmit}
                    disabled={isLoading}
                />

                <button 
                    className='submit-button'
                    onClick={handleSubmit}
                    disabled={(!selectedFile && !imageUrl.trim()) || isLoading}
                >
                    {isLoading ? 'Processing...' : 'Find Similar Products'}
                </button>
            </div>

            {/* Display uploaded image and results together */}
            {uploadResult && uploadedImagePreview && (
                <div className="results-section">
                    <h2>Search Results ({similarProducts.length} similar products found)</h2>
                    
                    {/* Uploaded Image Display */}
                    <div className="uploaded-image-section">
                        <h3>Your Uploaded Image</h3>
                        <div className="uploaded-image-container">
                            <img 
                                src={uploadedImagePreview} 
                                alt="User's search query"
                                className="uploaded-image-display"
                                onError={(e) => {
                                    console.error('Error loading uploaded image preview');
                                    e.target.style.display = 'none';
                                }}
                            />
                            <div className="uploaded-image-info">
                                <p className="uploaded-filename">
                                    📸 {selectedFile?.name || 'Image from URL'}
                                </p>
                                {uploadResult.metadata && (
                                    <div className="analysis-metadata">
                                        <span className="confidence-badge">
                                            🎯 {(uploadResult.metadata.confidence * 100).toFixed(0)}% Confidence
                                        </span>
                                        <span className="features-badge">
                                            🧠 {uploadResult.metadata.featureDimensions} AI Features
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Similar Products Grid */}
                    {similarProducts.length > 0 ? (
                        <>
                            <h3>Similar Products Found</h3>
                            <div className="products-grid">
                                {similarProducts.map((product, index) => (
                                    <div key={product._id || index} className="product-card">
                                        <img 
                                            src={product.imageUrl} 
                                            alt={product.name}
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/200x200?text=Image+Not+Found';
                                            }}
                                        />
                                        <h4>{product.name}</h4>
                                        <p className="category">{product.category}</p>
                                        <p className="description">{product.description}</p>
                                        <span className="price">${product.price}</span>
                                        {product.similarity && (
                                            <span className="similarity">
                                                {Math.round(product.similarity * 100)}% match
                                            </span>
                                        )}
                                        {product.matchStrategy && (
                                            <span className="match-strategy">
                                                {product.matchStrategy}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="no-results">
                            <h3>No Similar Products Found</h3>
                            <p>Try uploading a different image or check if the database has been seeded with products.</p>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

export default UploadImg;