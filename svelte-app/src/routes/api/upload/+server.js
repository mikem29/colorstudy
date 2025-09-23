import { json } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory outside of Svelte deployment
const uploadsDir = path.join(__dirname, '../../../../../uploads');
const thumbsDir = path.join(__dirname, '../../../../../uploads/thumbs');

export async function POST({ request }) {
  try {
    // Ensure uploads and thumbnails directories exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    if (!fs.existsSync(thumbsDir)) {
      fs.mkdirSync(thumbsDir, { recursive: true });
    }

    const formData = await request.formData();
    const file = formData.get('image');

    if (!file || !file.size) {
      return json({ status: 'error', message: 'No file uploaded.' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return json({ status: 'error', message: 'Invalid file type. Only JPG, PNG, and GIF are allowed.' }, { status: 400 });
    }

    // Validate file size (15MB limit)
    const maxSize = 15 * 1024 * 1024; // 15MB
    if (file.size > maxSize) {
      return json({ status: 'error', message: 'File size exceeds 15MB limit.' }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const extension = path.extname(file.name);
    const filename = `${timestamp}_${randomString}${extension}`;
    const filePath = path.join(uploadsDir, filename);

    // Save file
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    // Generate thumbnail
    const thumbFilePath = path.join(thumbsDir, filename);
    await sharp(buffer)
      .resize(300, 200, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85 })
      .toFile(thumbFilePath);

    // Also copy to static directory for serving
    const staticUploadsDir = path.join(__dirname, '../../../../static/uploads');
    const staticThumbsDir = path.join(__dirname, '../../../../static/uploads/thumbs');

    if (!fs.existsSync(staticUploadsDir)) {
      fs.mkdirSync(staticUploadsDir, { recursive: true });
    }
    if (!fs.existsSync(staticThumbsDir)) {
      fs.mkdirSync(staticThumbsDir, { recursive: true });
    }

    const staticFilePath = path.join(staticUploadsDir, filename);
    const staticThumbPath = path.join(staticThumbsDir, filename);

    fs.copyFileSync(filePath, staticFilePath);
    fs.copyFileSync(thumbFilePath, staticThumbPath);

    return json({
      status: 'success',
      message: 'File uploaded successfully.',
      filename: `uploads/${filename}`,
      originalName: file.name,
      size: file.size
    });

  } catch (error) {
    console.error('Upload error:', error);
    return json({ status: 'error', message: 'Upload failed.' }, { status: 500 });
  }
}