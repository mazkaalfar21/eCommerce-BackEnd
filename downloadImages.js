const https = require('https');
const fs = require('fs');
const path = require('path');

// Gambar sepatu dari Unsplash (free to use)
const images = [
  { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', name: 'nike-air-max-1.jpg' },
  { url: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800', name: 'nike-air-max-2.jpg' },
  { url: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800', name: 'adidas-1.jpg' },
  { url: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800', name: 'adidas-2.jpg' },
  { url: 'https://images.unsplash.com/photo-1465453869711-7e174808ace9?w=800', name: 'puma-1.jpg' },
  { url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800', name: 'puma-2.jpg' },
  { url: 'https://images.unsplash.com/photo-1584735175097-719d848f8449?w=800', name: 'newbalance-1.jpg' },
  { url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800', name: 'newbalance-2.jpg' },
  { url: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800', name: 'vans-1.jpg' },
  { url: 'https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=800', name: 'vans-2.jpg' },
  { url: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800', name: 'nike-air-force-1.jpg' },
  { url: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800', name: 'adidas-nmd.jpg' },
];

const uploadDir = path.join(__dirname, 'uploads', 'produk');

// Pastikan folder exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filepath = path.join(uploadDir, filename);
    const file = fs.createWriteStream(filepath);

    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✅ Downloaded: ${filename}`);
        resolve(filepath);
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      console.error(`❌ Error downloading ${filename}:`, err.message);
      reject(err);
    });
  });
}

async function downloadAll() {
  console.log('🚀 Downloading shoe images from Unsplash...\n');
  
  for (const img of images) {
    try {
      await downloadImage(img.url, img.name);
    } catch (err) {
      console.error(`Failed: ${img.name}`);
    }
  }

  console.log('\n✅ All images downloaded to:', uploadDir);
  console.log('\n📝 Update database dengan query SQL ini di phpMyAdmin:\n');
  console.log(`UPDATE produks SET gambar = '/uploads/produk/nike-air-max-1.jpg' WHERE id = 1;`);
  console.log(`UPDATE produks SET gambar = '/uploads/produk/nike-air-max-2.jpg' WHERE id = 2;`);
  console.log(`UPDATE produks SET gambar = '/uploads/produk/adidas-1.jpg' WHERE id = 3;`);
  console.log(`UPDATE produks SET gambar = '/uploads/produk/adidas-2.jpg' WHERE id = 4;`);
  console.log(`UPDATE produks SET gambar = '/uploads/produk/puma-1.jpg' WHERE id = 5;`);
  console.log(`UPDATE produks SET gambar = '/uploads/produk/puma-2.jpg' WHERE id = 6;`);
  console.log(`UPDATE produks SET gambar = '/uploads/produk/newbalance-1.jpg' WHERE id = 7;`);
  console.log(`UPDATE produks SET gambar = '/uploads/produk/newbalance-2.jpg' WHERE id = 8;`);
  console.log(`UPDATE produks SET gambar = '/uploads/produk/vans-1.jpg' WHERE id = 9;`);
  console.log(`UPDATE produks SET gambar = '/uploads/produk/vans-2.jpg' WHERE id = 10;`);
  console.log(`UPDATE produks SET gambar = '/uploads/produk/nike-air-force-1.jpg' WHERE id = 11;`);
  console.log(`UPDATE produks SET gambar = '/uploads/produk/adidas-nmd.jpg' WHERE id = 12;`);
}

downloadAll();
