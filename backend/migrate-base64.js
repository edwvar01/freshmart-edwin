const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Product = require('./models/Product');

// Connect to MongoDB
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/freshmart';
console.log(`Connecting to: ${MONGO_URI}`);

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB. Starting migration...');
    const products = await Product.find({});
    let updatedCount = 0;

    for (const product of products) {
      if (product.image && product.image.includes('http://localhost:5000/uploads/')) {
        const filename = product.image.split('/uploads/')[1];
        const filepath = path.join(__dirname, 'uploads', filename);

        if (fs.existsSync(filepath)) {
          console.log(`Migrating image for product: ${product.name}`);
          const fileBuffer = fs.readFileSync(filepath);
          const ext = path.extname(filename).toLowerCase();
          let mimeType = 'image/jpeg';
          if (ext === '.png') mimeType = 'image/png';
          else if (ext === '.webp') mimeType = 'image/webp';
          else if (ext === '.gif') mimeType = 'image/gif';
          
          const base64Image = fileBuffer.toString('base64');
          product.image = `data:${mimeType};base64,${base64Image}`;
          await product.save();
          updatedCount++;
        } else {
          console.log(`File not found for product ${product.name}: ${filepath}`);
        }
      }
    }

    console.log(`Migration complete. Updated ${updatedCount} products.`);
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Migration failed:', err);
    mongoose.connection.close();
  });
