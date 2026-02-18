
const mongoose = require('mongoose');
const Product = require('../models/Product');
const { extractFeaturesFromUrl, extractAdvancedFeatures } = require('../utils/imageProcessor');
const dotenv = require('dotenv');

dotenv.config();

const enhancedSampleProducts = [
    // Electronics & Tech (15 items)
    { name: 'iPhone 15 Pro', category: 'Electronics', price: 999, imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500', description: 'Latest smartphone with advanced features' },
    { name: 'MacBook Air', category: 'Electronics', price: 1299, imageUrl: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500', description: 'Lightweight laptop for productivity' },
    { name: 'iPad Pro', category: 'Electronics', price: 799, imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500', description: 'Professional tablet for creative work' },
    { name: 'AirPods Pro', category: 'Electronics', price: 249, imageUrl: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=500', description: 'Wireless earbuds with noise cancellation' },
    { name: 'Apple Watch', category: 'Electronics', price: 399, imageUrl: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500', description: 'Smart watch for health and fitness' },
    { name: 'Wireless Headphones', category: 'Electronics', price: 199, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', description: 'Over-ear wireless headphones' },
    { name: 'Gaming Mouse', category: 'Electronics', price: 79, imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500', description: 'High-precision gaming mouse' },
    { name: 'Mechanical Keyboard', category: 'Electronics', price: 129, imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500', description: 'RGB mechanical gaming keyboard' },
    { name: 'Smartphone Charger', category: 'Electronics', price: 25, imageUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500', description: 'Fast charging USB-C cable' },
    { name: 'Portable Speaker', category: 'Electronics', price: 89, imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500', description: 'Bluetooth portable speaker' },
    { name: 'Gaming Controller', category: 'Electronics', price: 65, imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500', description: 'Wireless gaming controller' },
    { name: 'Computer Monitor', category: 'Electronics', price: 280, imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500', description: '24-inch LED monitor' },
    { name: 'Webcam', category: 'Electronics', price: 85, imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500', description: '1080p HD webcam' },
    { name: 'Power Bank', category: 'Electronics', price: 45, imageUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500', description: '10000mAh portable charger' },
    { name: 'Phone Case', category: 'Electronics', price: 25, imageUrl: 'https://images.unsplash.com/photo-1601593346740-925612772716?w=500', description: 'Protective phone case' },
    
    // Shoes & Footwear (8 items)
    { name: 'Nike Air Max 270', category: 'Shoes', price: 150, imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', description: 'Comfortable running shoes' },
    { name: 'Adidas Ultraboost', category: 'Shoes', price: 180, imageUrl: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=500', description: 'Premium running sneakers' },
    { name: 'Converse Chuck Taylor', category: 'Shoes', price: 65, imageUrl: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=500', description: 'Classic canvas sneakers' },
    { name: 'Leather Dress Shoes', category: 'Shoes', price: 200, imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500', description: 'Formal leather oxfords' },
    { name: 'Combat Boots', category: 'Shoes', price: 160, imageUrl: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=500', description: 'Durable military-style boots' },
    { name: 'Flip Flops', category: 'Shoes', price: 25, imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500', description: 'Casual beach sandals' },
    { name: 'High Heels', category: 'Shoes', price: 120, imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500', description: 'Elegant formal heels' },
    { name: 'Hiking Boots', category: 'Shoes', price: 185, imageUrl: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=500', description: 'Waterproof hiking boots' },
    
    // Fashion & Clothing (12 items)
    { name: 'Denim Jacket', category: 'Fashion', price: 89, imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500', description: 'Classic blue denim jacket' },
    { name: 'White T-Shirt', category: 'Fashion', price: 25, imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', description: 'Basic cotton white tee' },
    { name: 'Black Hoodie', category: 'Fashion', price: 65, imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500', description: 'Comfortable pullover hoodie' },
    { name: 'Blue Jeans', category: 'Fashion', price: 75, imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500', description: 'Classic straight-leg jeans' },
    { name: 'Formal Shirt', category: 'Fashion', price: 68, imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500', description: 'Crisp white dress shirt' },
    { name: 'Leather Jacket', category: 'Fashion', price: 220, imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500', description: 'Premium black leather jacket' },
    { name: 'Summer Dress', category: 'Fashion', price: 85, imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500', description: 'Floral summer dress' },
    { name: 'Wool Sweater', category: 'Fashion', price: 95, imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500', description: 'Cozy wool knit sweater' },
    { name: 'Track Pants', category: 'Fashion', price: 45, imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500', description: 'Athletic jogger pants' },
    { name: 'Winter Coat', category: 'Fashion', price: 180, imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500', description: 'Warm winter puffer coat' },
    { name: 'Swimwear', category: 'Fashion', price: 45, imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500', description: 'One-piece swimsuit' },
    { name: 'Winter Scarf', category: 'Fashion', price: 38, imageUrl: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=500', description: 'Wool winter scarf' },
    
    // Accessories & Personal Items (10 items)
    { name: 'Ray-Ban Sunglasses', category: 'Accessories', price: 180, imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500', description: 'Classic aviator sunglasses' },
    { name: 'Rolex Watch', category: 'Accessories', price: 350, imageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500', description: 'Luxury analog wristwatch' },
    { name: 'Travel Backpack', category: 'Accessories', price: 85, imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', description: 'Durable travel backpack' },
    { name: 'Baseball Cap', category: 'Accessories', price: 32, imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500', description: 'Adjustable baseball cap' },
    { name: 'Leather Wallet', category: 'Accessories', price: 75, imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500', description: 'Genuine leather bifold wallet' },
    { name: 'Designer Handbag', category: 'Accessories', price: 145, imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500', description: 'Luxury designer handbag' },
    { name: 'Silk Scarf', category: 'Accessories', price: 48, imageUrl: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=500', description: 'Premium silk scarf' },
    { name: 'Leather Belt', category: 'Accessories', price: 42, imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', description: 'Classic brown leather belt' },
    { name: 'Gold Ring', category: 'Accessories', price: 220, imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500', description: '14k gold wedding ring' },
    { name: 'Pearl Necklace', category: 'Accessories', price: 185, imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500', description: 'Elegant pearl necklace' },
    
    // Home & Kitchen Items (12 items)
    { name: 'Coffee Maker', category: 'Kitchen', price: 159, imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=500', description: 'Automatic drip coffee maker' },
    { name: 'Blender', category: 'Kitchen', price: 89, imageUrl: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=500', description: 'High-speed smoothie blender' },
    { name: 'Toaster', category: 'Kitchen', price: 45, imageUrl: 'https://images.unsplash.com/photo-1574781330855-d0d7853d7d0d?w=500', description: '2-slice stainless steel toaster' },
    { name: 'Microwave Oven', category: 'Kitchen', price: 120, imageUrl: 'https://images.unsplash.com/photo-1574781330855-d0d7853d7d0d?w=500', description: 'Compact microwave oven' },
    { name: 'Non-stick Pan', category: 'Kitchen', price: 38, imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500', description: 'Non-stick frying pan' },
    { name: 'Chef Knife', category: 'Kitchen', price: 65, imageUrl: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=500', description: 'Professional chef knife' },
    { name: 'Cutting Board', category: 'Kitchen', price: 28, imageUrl: 'https://images.unsplash.com/photo-1594736797933-d0c9a3633c4b?w=500', description: 'Bamboo cutting board' },
    { name: 'Wine Glasses Set', category: 'Kitchen', price: 45, imageUrl: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=500', description: 'Set of 4 wine glasses' },
    { name: 'Coffee Mug', category: 'Kitchen', price: 18, imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=500', description: 'Ceramic coffee mug' },
    { name: 'Dinner Plates Set', category: 'Kitchen', price: 55, imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500', description: 'Set of 6 ceramic dinner plates' },
    { name: 'Food Storage Containers', category: 'Kitchen', price: 35, imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500', description: 'Set of glass food containers' },
    { name: 'Water Filter', category: 'Kitchen', price: 65, imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500', description: 'Countertop water filter' },
    
    // Home Decor & Furniture (8 items)
    { name: 'Table Lamp', category: 'Home', price: 95, imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500', description: 'Modern LED table lamp' },
    { name: 'Throw Pillow', category: 'Home', price: 35, imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500', description: 'Decorative throw pillow' },
    { name: 'Wall Clock', category: 'Home', price: 52, imageUrl: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=500', description: 'Minimalist wall clock' },
    { name: 'Picture Frame', category: 'Home', price: 28, imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500', description: 'Wooden photo frame' },
    { name: 'Ceramic Vase', category: 'Home', price: 48, imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=500', description: 'Decorative ceramic vase' },
    { name: 'Scented Candle', category: 'Home', price: 24, imageUrl: 'https://images.unsplash.com/photo-1602874801006-94c8746073a0?w=500', description: 'Vanilla scented candle' },
    { name: 'Desk Chair', category: 'Home', price: 199, imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500', description: 'Ergonomic office chair' },
    { name: 'Coffee Table', category: 'Home', price: 285, imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500', description: 'Modern glass coffee table' },
    
    // Personal Care & Beauty (10 items)
    { name: 'Electric Toothbrush', category: 'Personal Care', price: 85, imageUrl: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=500', description: 'Rechargeable electric toothbrush' },
    { name: 'Hair Dryer', category: 'Personal Care', price: 75, imageUrl: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=500', description: 'Professional hair dryer' },
    { name: 'Perfume', category: 'Beauty', price: 95, imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=500', description: 'Designer fragrance bottle' },
    { name: 'Lipstick', category: 'Beauty', price: 28, imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500', description: 'Matte finish lipstick' },
    { name: 'Shaving Razor', category: 'Personal Care', price: 45, imageUrl: 'https://images.unsplash.com/photo-1503652601-557d07733ddc?w=500', description: 'Safety razor with blades' },
    { name: 'Moisturizer', category: 'Beauty', price: 38, imageUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500', description: 'Daily face moisturizer' },
    { name: 'Shampoo Bottle', category: 'Personal Care', price: 22, imageUrl: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500', description: 'Organic shampoo bottle' },
    { name: 'Bath Towel', category: 'Personal Care', price: 32, imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500', description: 'Soft cotton bath towel' },
    { name: 'Sunscreen', category: 'Beauty', price: 18, imageUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500', description: 'SPF 50 sunscreen lotion' },
    { name: 'Hand Sanitizer', category: 'Personal Care', price: 6, imageUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500', description: 'Antibacterial hand sanitizer' },
    
    // Sports & Fitness (8 items)
    { name: 'Basketball', category: 'Sports', price: 29, imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500', description: 'Official size basketball' },
    { name: 'Tennis Racket', category: 'Sports', price: 135, imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500', description: 'Professional tennis racket' },
    { name: 'Yoga Mat', category: 'Sports', price: 45, imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500', description: 'Non-slip yoga exercise mat' },
    { name: 'Dumbbells Set', category: 'Sports', price: 120, imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500', description: 'Adjustable dumbbells set' },
    { name: 'Water Bottle', category: 'Sports', price: 25, imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500', description: 'Stainless steel water bottle' },
    { name: 'Soccer Ball', category: 'Sports', price: 35, imageUrl: 'https://images.unsplash.com/photo-1614632537190-23e4b8f0296d?w=500', description: 'FIFA approved soccer ball' },
    { name: 'Fitness Tracker', category: 'Sports', price: 120, imageUrl: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500', description: 'Heart rate fitness tracker' },
    { name: 'Resistance Bands', category: 'Sports', price: 25, imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500', description: 'Set of resistance bands' },
    
    // Books & Office (8 items)
    { name: 'Programming Book', category: 'Books', price: 42, imageUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500', description: 'Learn Python programming' },
    { name: 'Notebook', category: 'Office', price: 15, imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500', description: 'Spiral bound notebook' },
    { name: 'Pen Set', category: 'Office', price: 28, imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500', description: 'Premium ballpoint pen set' },
    { name: 'Calculator', category: 'Office', price: 35, imageUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500', description: 'Scientific calculator' },
    { name: 'Stapler', category: 'Office', price: 18, imageUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500', description: 'Heavy-duty office stapler' },
    { name: 'Desk Organizer', category: 'Office', price: 32, imageUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500', description: 'Bamboo desk organizer' },
    { name: 'Sticky Notes', category: 'Office', price: 8, imageUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500', description: 'Colorful sticky note pads' },
    { name: 'Fountain Pen', category: 'Office', price: 45, imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500', description: 'Elegant fountain pen' },
    
    // Food & Beverages (6 items)
    { name: 'Coffee Beans', category: 'Food', price: 18, imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500', description: 'Premium arabica coffee beans' },
    { name: 'Green Tea', category: 'Food', price: 12, imageUrl: 'https://images.unsplash.com/photo-1594631661960-35ceab24e5ac?w=500', description: 'Organic green tea bags' },
    { name: 'Honey Jar', category: 'Food', price: 14, imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500', description: 'Pure wildflower honey' },
    { name: 'Olive Oil', category: 'Food', price: 22, imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500', description: 'Extra virgin olive oil' },
    { name: 'Wine Bottle', category: 'Food', price: 35, imageUrl: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=500', description: 'Premium red wine' },
    { name: 'Travel Mug', category: 'Food', price: 28, imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=500', description: 'Insulated travel coffee mug' },
    
    // Automotive & Tools (6 items)
    { name: 'Car Phone Mount', category: 'Automotive', price: 25, imageUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500', description: 'Dashboard phone holder' },
    { name: 'Car Air Freshener', category: 'Automotive', price: 8, imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=500', description: 'Vanilla car air freshener' },
    { name: 'Screwdriver Set', category: 'Tools', price: 35, imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500', description: 'Multi-bit screwdriver set' },
    { name: 'Hammer', category: 'Tools', price: 28, imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500', description: 'Claw hammer with grip' },
    { name: 'Flashlight', category: 'Tools', price: 25, imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500', description: 'LED tactical flashlight' },
    { name: 'Measuring Tape', category: 'Tools', price: 18, imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500', description: '25ft measuring tape' },
    
    // Outdoor & Travel (6 items)
    { name: 'Camping Tent', category: 'Outdoor', price: 180, imageUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=500', description: '4-person camping tent' },
    { name: 'Sleeping Bag', category: 'Outdoor', price: 85, imageUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=500', description: 'Insulated sleeping bag' },
    { name: 'Hiking Backpack', category: 'Outdoor', price: 120, imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', description: '40L hiking backpack' },
    { name: 'Travel Suitcase', category: 'Travel', price: 150, imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', description: 'Hard-shell travel suitcase' },
    { name: 'Travel Pillow', category: 'Travel', price: 25, imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500', description: 'Memory foam travel pillow' },
    { name: 'Umbrella', category: 'Travel', price: 25, imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500', description: 'Compact folding umbrella' },
    
    // Miscellaneous (7 items)
    { name: 'Vacuum Cleaner', category: 'Cleaning', price: 199, imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500', description: 'Cordless stick vacuum' },
    { name: 'Laundry Detergent', category: 'Cleaning', price: 18, imageUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=500', description: 'Concentrated laundry detergent' },
    { name: 'Rubiks Cube', category: 'Toys', price: 15, imageUrl: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=500', description: 'Original 3x3 puzzle cube' },
    { name: 'Chess Set', category: 'Toys', price: 58, imageUrl: 'https://images.unsplash.com/photo-1528819622765-d6bcf132ac11?w=500', description: 'Wooden chess set with board' },
    { name: 'Playing Cards', category: 'Toys', price: 8, imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500', description: 'Standard deck of cards' },
    { name: 'Board Game', category: 'Toys', price: 45, imageUrl: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=500', description: 'Family strategy board game' },
    
    // Music & Entertainment (4 items)
    { name: 'Acoustic Guitar', category: 'Music', price: 250, imageUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=500', description: 'Steel-string acoustic guitar' },
    { name: 'Piano Keyboard', category: 'Music', price: 180, imageUrl: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=500', description: '61-key digital piano' },
    { name: 'Drum Sticks', category: 'Music', price: 15, imageUrl: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=500', description: 'Wooden drumsticks pair' },
    { name: 'VR Headset', category: 'Gaming', price: 299, imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500', description: 'Virtual reality headset' },
    
    // Garden & Pet Care (6 items)
    { name: 'Garden Gloves', category: 'Garden', price: 15, imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500', description: 'Waterproof gardening gloves' },
    { name: 'Watering Can', category: 'Garden', price: 28, imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500', description: 'Metal watering can' },
    { name: 'Plant Pot', category: 'Garden', price: 32, imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500', description: 'Ceramic plant pot with drainage' },
    { name: 'Dog Collar', category: 'Pet Supplies', price: 22, imageUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500', description: 'Adjustable dog collar' },
    { name: 'Cat Toy', category: 'Pet Supplies', price: 12, imageUrl: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=500', description: 'Interactive cat toy' },
    { name: 'Pet Food Bowl', category: 'Pet Supplies', price: 16, imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500', description: 'Stainless steel pet bowl' },
    
    // Art & Health (6 items)
    { name: 'Paint Brush Set', category: 'Art', price: 32, imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500', description: 'Professional artist brushes' },
    { name: 'Canvas Board', category: 'Art', price: 18, imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500', description: 'Blank canvas for painting' },
    { name: 'Colored Pencils', category: 'Art', price: 25, imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500', description: '48-color pencil set' },
    { name: 'Vitamins', category: 'Health', price: 25, imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', description: 'Daily multivitamin supplement' },
    { name: 'Thermometer', category: 'Health', price: 35, imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', description: 'Digital infrared thermometer' },
    { name: 'First Aid Kit', category: 'Health', price: 45, imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', description: 'Complete first aid kit' },
    
    // Bedroom & Baby (6 items)
    { name: 'Bed Sheets', category: 'Bedroom', price: 45, imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500', description: 'Cotton bed sheet set' },
    { name: 'Memory Foam Pillow', category: 'Bedroom', price: 55, imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500', description: 'Ergonomic memory foam pillow' },
    { name: 'Alarm Clock', category: 'Bedroom', price: 28, imageUrl: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=500', description: 'Digital alarm clock with radio' },
    { name: 'Baby Bottle', category: 'Baby', price: 18, imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500', description: 'BPA-free baby bottle' },
    { name: 'Stuffed Animal', category: 'Baby', price: 25, imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500', description: 'Soft teddy bear' },
    { name: 'Diaper Bag', category: 'Baby', price: 65, imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', description: 'Organized diaper bag' },
    
    // Party & Seasonal (8 items)
    { name: 'Birthday Candles', category: 'Party', price: 8, imageUrl: 'https://images.unsplash.com/photo-1602874801006-94c8746073a0?w=500', description: 'Colorful birthday candles' },
    { name: 'Party Balloons', category: 'Party', price: 12, imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=500', description: 'Pack of latex balloons' },
    { name: 'Gift Wrapping Paper', category: 'Party', price: 15, imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500', description: 'Decorative wrapping paper rolls' },
    { name: 'Winter Gloves', category: 'Winter', price: 28, imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500', description: 'Warm winter gloves' },
    { name: 'Summer Hat', category: 'Summer', price: 35, imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500', description: 'Wide-brim sun hat' },
    { name: 'Beach Towel', category: 'Summer', price: 25, imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500', description: 'Large beach towel' },
    { name: 'Cooler Box', category: 'Summer', price: 85, imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500', description: 'Insulated cooler box' },
    { name: 'Beach Ball', category: 'Summer', price: 8, imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=500', description: 'Inflatable beach ball' },
    
    // Bathroom & Daily Essentials (8 items)
    { name: 'Shower Curtain', category: 'Bathroom', price: 25, imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500', description: 'Waterproof shower curtain' },
    { name: 'Toilet Paper', category: 'Bathroom', price: 15, imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500', description: '12-pack toilet paper rolls' },
    { name: 'Soap Dispenser', category: 'Bathroom', price: 22, imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500', description: 'Automatic soap dispenser' },
    { name: 'Tissues Box', category: 'Daily Essentials', price: 8, imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500', description: 'Soft facial tissues' },
    { name: 'Face Mask', category: 'Daily Essentials', price: 15, imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500', description: 'Pack of disposable face masks' },
    { name: 'Trash Bags', category: 'Daily Essentials', price: 12, imageUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=500', description: 'Heavy-duty trash bags' },
    { name: 'Paper Towels', category: 'Daily Essentials', price: 18, imageUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=500', description: 'Absorbent paper towel rolls' },
    { name: 'Cleaning Spray', category: 'Cleaning', price: 12, imageUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=500', description: 'All-purpose cleaner spray' }
];

const enhancedSeedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🔗 Connected to MongoDB for enhanced AI seeding');
        
        // Clear existing products
        await Product.deleteMany({});
        console.log('🗑️  Cleared existing products');
        
        // Process each product with advanced AI features
        const processedProducts = [];
        const failedProducts = [];
        
        console.log(`🧠 Processing ${enhancedSampleProducts.length} products with advanced AI...`);
        console.log('📊 Extracting: Color histograms, Edge features, Texture patterns, Shape analysis, Dominant colors, Brightness/Contrast');
        
        for (let i = 0; i < enhancedSampleProducts.length; i++) {
            const product = enhancedSampleProducts[i];
            console.log(`\n⏳ Processing ${i + 1}/${enhancedSampleProducts.length}: ${product.name}`);
            console.log(`🏷️  Category: ${product.category} | 💰 Price: ${product.price}`);
            
            try {
                // Extract advanced AI features from image URL
                console.log(`🎨 Analyzing image with computer vision...`);
                const advancedFeatures = await extractFeaturesFromUrl(product.imageUrl);
                
                // Break down features into components (approximate based on our feature extraction)
                const featureLength = advancedFeatures.length;
                const colorHistStart = 0;
                const colorHistLength = Math.floor(featureLength * 0.3); // ~30% for color histogram
                const edgeStart = colorHistStart + colorHistLength;
                const edgeLength = Math.floor(featureLength * 0.15); // ~15% for edges
                const textureStart = edgeStart + edgeLength;
                const textureLength = Math.floor(featureLength * 0.15); // ~15% for texture
                const shapeStart = textureStart + textureLength;
                const shapeLength = 7; // Fixed 7 for shape features
                const dominantStart = shapeStart + shapeLength;
                const dominantLength = 15; // 5 colors × 3 RGB values
                const brightnessStart = dominantStart + dominantLength;
                const brightnessLength = 3;
                const contrastStart = brightnessStart + brightnessLength;
                
                // Extract individual feature components
                const visualFeatures = {
                    colorHistogram: advancedFeatures.slice(colorHistStart, colorHistStart + colorHistLength),
                    edgeFeatures: advancedFeatures.slice(edgeStart, edgeStart + edgeLength),
                    textureFeatures: advancedFeatures.slice(textureStart, textureStart + textureLength),
                    shapeFeatures: advancedFeatures.slice(shapeStart, shapeStart + shapeLength),
                    dominantColors: advancedFeatures.slice(dominantStart, dominantStart + dominantLength),
                    brightnessFeatures: advancedFeatures.slice(brightnessStart, brightnessStart + brightnessLength),
                    contrastFeatures: advancedFeatures.slice(contrastStart, contrastStart + 1)
                };
                
                // Calculate metadata
                const avgBrightness = visualFeatures.brightnessFeatures.length > 0 
                    ? visualFeatures.brightnessFeatures[0] : 0.5;
                const avgContrast = visualFeatures.contrastFeatures.length > 0 
                    ? visualFeatures.contrastFeatures[0] : 0.5;
                
                // Infer category confidence
                const categoryConfidence = inferCategoryConfidence(product.category, visualFeatures);
                
                // Create enhanced product data
                const productData = {
                    ...product,
                    cloudinaryId: `enhanced_sample_${i}`,
                    colorFeatures: advancedFeatures, // Store complete feature vector
                    visualFeatures: visualFeatures,
                    productMetadata: {
                        inferredCategory: product.category,
                        priceRange: getPriceRange(product.price),
                        dominantColorNames: extractColorNames(visualFeatures.dominantColors),
                        averageBrightness: avgBrightness,
                        averageContrast: avgContrast
                    },
                    searchTags: product.tags || [],
                    analysisQuality: {
                        imageProcessingSuccess: true,
                        featureExtractionScore: categoryConfidence,
                        lastAnalyzed: new Date()
                    }
                };
                
                processedProducts.push(productData);
                console.log(`✅ Successfully processed: ${product.name}`);
                console.log(`   🎯 Features: ${advancedFeatures.length} dimensions`);
                console.log(`   🌈 Dominant colors: ${productData.productMetadata.dominantColorNames.join(', ')}`);
                console.log(`   💡 Brightness: ${(avgBrightness * 100).toFixed(1)}%`);
                console.log(`   🔄 Analysis quality: ${(categoryConfidence * 100).toFixed(1)}%`);
                
                // Add delay to avoid overwhelming servers
                await new Promise(resolve => setTimeout(resolve, 500));
                
            } catch (error) {
                console.error(`❌ Error processing ${product.name}:`, error.message);
                failedProducts.push({ product: product.name, error: error.message });
                
                // Create basic product entry without advanced features
                const basicProductData = {
                    ...product,
                    cloudinaryId: `basic_sample_${i}`,
                    colorFeatures: new Array(1331).fill(0.001),
                    visualFeatures: {
                        colorHistogram: new Array(400).fill(0.001),
                        edgeFeatures: new Array(16).fill(0.001),
                        textureFeatures: new Array(256).fill(0.001),
                        shapeFeatures: new Array(7).fill(0.001),
                        dominantColors: new Array(15).fill(0.5),
                        brightnessFeatures: [0.5, 0.1, 0],
                        contrastFeatures: [0.3]
                    },
                    productMetadata: {
                        inferredCategory: product.category,
                        priceRange: getPriceRange(product.price),
                        dominantColorNames: ['unknown'],
                        averageBrightness: 0.5,
                        averageContrast: 0.3
                    },
                    searchTags: product.tags || [],
                    analysisQuality: {
                        imageProcessingSuccess: false,
                        featureExtractionScore: 0.1,
                        lastAnalyzed: new Date()
                    }
                };
                
                processedProducts.push(basicProductData);
                console.log(`⚠️  Added ${product.name} with basic features`);
            }
        }
        
        // Insert all processed products
        if (processedProducts.length > 0) {
            await Product.insertMany(processedProducts);
            console.log(`\n🎉 Enhanced AI seeding completed!`);
            console.log(`📊 Results Summary:`);
            console.log(`   ✅ Successfully processed: ${processedProducts.length} products`);
            console.log(`   ❌ Failed processing: ${failedProducts.length} products`);
            
            // Detailed analytics
            const successfulProducts = processedProducts.filter(p => p.analysisQuality.imageProcessingSuccess);
            const avgQuality = successfulProducts.length > 0 
                ? successfulProducts.reduce((sum, p) => sum + p.analysisQuality.featureExtractionScore, 0) / successfulProducts.length
                : 0;
            
            console.log(`   🧠 Advanced AI features: ${successfulProducts.length} products`);
            console.log(`   📈 Average analysis quality: ${(avgQuality * 100).toFixed(1)}%`);
            
            // Category breakdown
            console.log(`\n📂 Category Distribution:`);
            const categories = {};
            processedProducts.forEach(product => {
                categories[product.category] = (categories[product.category] || 0) + 1;
            });
            
            Object.entries(categories).forEach(([category, count]) => {
                const categoryProducts = processedProducts.filter(p => p.category === category);
                const successRate = categoryProducts.filter(p => p.analysisQuality.imageProcessingSuccess).length / count;
                console.log(`   ${category}: ${count} products (${(successRate * 100).toFixed(0)}% AI success)`);
            });
            
            // Price range breakdown
            console.log(`\n💰 Price Range Distribution:`);
            const priceRanges = {};
            processedProducts.forEach(product => {
                const range = product.productMetadata.priceRange;
                priceRanges[range] = (priceRanges[range] || 0) + 1;
            });
            
            Object.entries(priceRanges).forEach(([range, count]) => {
                console.log(`   ${range}: ${count} products`);
            });
            
            if (failedProducts.length > 0) {
                console.log(`\n⚠️  Failed Products (will use basic features):`);
                failedProducts.forEach(({ product, error }) => {
                    console.log(`   - ${product}: ${error}`);
                });
            }
            
            // Test the enhanced matching system
            console.log(`\n🧪 Testing enhanced AI matching system...`);
            await testEnhancedMatching();
            
        } else {
            console.log('❌ No products were successfully processed');
        }
        
    } catch (error) {
        console.error('💥 Enhanced seeding error:', error);
    } finally {
        mongoose.connection.close();
        console.log('🔐 Database connection closed');
    }
};

// Test the enhanced matching system
const testEnhancedMatching = async () => {
    try {
        const testProduct = await Product.findOne({ category: 'Electronics' });
        if (!testProduct) return;
        
        const similarProducts = await Product.findSimilarByFeatures(
            testProduct.colorFeatures,
            { limit: 5, minSimilarity: 0.1 }
        );
        
        console.log(`   🔍 Test search for "${testProduct.name}":`);
        console.log(`   📋 Found ${similarProducts.length} similar products`);
        
        if (similarProducts.length > 0) {
            console.log(`   🥇 Top match: "${similarProducts[0].name}" (${(similarProducts[0].similarity * 100).toFixed(1)}% similar)`);
            console.log(`   🎯 Categories found: ${[...new Set(similarProducts.map(p => p.category))].join(', ')}`);
        }
        
    } catch (error) {
        console.error('   ❌ Test matching failed:', error.message);
    }
};

// Helper functions
const getPriceRange = (price) => {
    if (price < 30) return 'budget';
    if (price < 100) return 'mid-range';
    if (price < 300) return 'premium';
    return 'luxury';
};

const inferCategoryConfidence = (actualCategory, visualFeatures) => {
    // Calculate confidence based on how well the visual features match the category
    let confidence = 0.5; // Base confidence
    
    const avgBrightness = visualFeatures.brightnessFeatures.length > 0 
        ? visualFeatures.brightnessFeatures[0] : 0.5;
    const avgContrast = visualFeatures.contrastFeatures.length > 0 
        ? visualFeatures.contrastFeatures[0] : 0.5;
    
    // Category-specific heuristics
    switch (actualCategory.toLowerCase()) {
        case 'electronics':
            // Electronics tend to be bright and clean
            if (avgBrightness > 0.6 && avgContrast < 0.4) confidence += 0.3;
            break;
        case 'fashion':
        case 'shoes':
            // Fashion items have varied brightness and contrast
            if (avgBrightness > 0.3 && avgBrightness < 0.8) confidence += 0.2;
            break;
        case 'tools':
            // Tools often have high contrast (metal/dark handles)
            if (avgContrast > 0.5) confidence += 0.3;
            break;
        case 'kitchen':
            // Kitchen items vary but often metallic or white
            if (avgBrightness > 0.5 || avgContrast > 0.4) confidence += 0.2;
            break;
        default:
            confidence += 0.1;
    }
    
    return Math.min(1.0, confidence);
};

const extractColorNames = (dominantColors) => {
    if (!dominantColors || dominantColors.length < 15) return ['unknown'];
    
    const colorNames = [];
    
    // Process each RGB color (5 colors × 3 values each)
    for (let i = 0; i < 15; i += 3) {
        const r = dominantColors[i] * 255;
        const g = dominantColors[i + 1] * 255;
        const b = dominantColors[i + 2] * 255;
        
        const colorName = getColorName(r, g, b);
        if (colorName && !colorNames.includes(colorName)) {
            colorNames.push(colorName);
        }
    }
    
    return colorNames.length > 0 ? colorNames : ['mixed'];
};

const getColorName = (r, g, b) => {
    // Simple color name mapping based on RGB values
    const brightness = (r + g + b) / 3;
    
    if (brightness < 50) return 'black';
    if (brightness > 200) return 'white';
    
    if (r > g + 50 && r > b + 50) return 'red';
    if (g > r + 50 && g > b + 50) return 'green';
    if (b > r + 50 && b > g + 50) return 'blue';
    if (r > 150 && g > 150 && b < 100) return 'yellow';
    if (r > 150 && g < 100 && b > 150) return 'purple';
    if (r < 100 && g > 150 && b > 150) return 'cyan';
    if (r > 150 && g > 100 && b < 100) return 'orange';
    if (r > 100 && g > 100 && b > 100) return 'gray';
    if (r > 139 && g > 69 && b > 19 && r < 160 && g < 90 && b < 40) return 'brown';
    
    return 'mixed';
};

// Function to update existing products with advanced features
const upgradeExistingProducts = async () => {
    console.log('🔄 Upgrading existing products with advanced AI features...');
    
    try {
        const products = await Product.find({});
        console.log(`📦 Found ${products.length} existing products to upgrade`);
        
        let upgraded = 0;
        let failed = 0;
        
        for (const product of products) {
            try {
                console.log(`⏳ Upgrading: ${product.name}`);
                
                // Extract advanced features
                const advancedFeatures = await extractFeaturesFromUrl(product.imageUrl);
                
                // Update product with new features
                await Product.findByIdAndUpdate(product._id, {
                    colorFeatures: advancedFeatures,
                    'analysisQuality.imageProcessingSuccess': true,
                    'analysisQuality.featureExtractionScore': 0.9,
                    'analysisQuality.lastAnalyzed': new Date()
                });
                
                upgraded++;
                console.log(`✅ Upgraded: ${product.name}`);
                
                // Rate limiting
                await new Promise(resolve => setTimeout(resolve, 300));
                
            } catch (error) {
                failed++;
                console.error(`❌ Failed to upgrade ${product.name}:`, error.message);
            }
        }
        
        console.log(`\n📊 Upgrade Results:`);
        console.log(`   ✅ Successfully upgraded: ${upgraded} products`);
        console.log(`   ❌ Failed to upgrade: ${failed} products`);
        
    } catch (error) {
        console.error('💥 Upgrade process error:', error);
    }
};

// Run seeding if this file is executed directly
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.includes('--upgrade')) {
        console.log('🔄 Starting product upgrade process...');
        upgradeExistingProducts();
    } else {
        console.log('🌱 Starting enhanced AI database seeding process...');
        enhancedSeedDatabase();
    }
}

module.exports = { 
    enhancedSeedDatabase, 
    upgradeExistingProducts, 
    enhancedSampleProducts 
};