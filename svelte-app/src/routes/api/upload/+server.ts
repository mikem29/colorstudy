import { json, error } from '@sveltejs/kit';
import { dev } from '$app/environment';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { pool } from '$lib/server/auth';
import type { RequestHandler } from './$types';

// Define upload directories based on environment
const UPLOAD_BASE = dev
  ? path.resolve(process.cwd(), 'static/uploads')
  : '/var/www/huemixy/static/uploads';

const uploadsDir = UPLOAD_BASE;
const thumbsDir = path.join(UPLOAD_BASE, 'thumbs');

export const POST: RequestHandler = async ({ request, locals }) => {
  // Check if user is authenticated
  if (!locals.user) {
    throw error(401, 'Authentication required');
  }

  try {
    // Ensure uploads and thumbnails directories exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    if (!fs.existsSync(thumbsDir)) {
      fs.mkdirSync(thumbsDir, { recursive: true });
    }

    const formData = await request.formData();
    const file = formData.get('image') as File;

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

    // No need to copy - we're already saving directly to static folder

    // Save to database with user association
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        'INSERT INTO images (file_path, user_id) VALUES (?, ?)',
        [`uploads/${filename}`, locals.user.id]
      );
    } finally {
      connection.release();
    }

    return json({
      status: 'success',
      message: 'File uploaded successfully.',
      filename: `uploads/${filename}`,
      originalName: file.name,
      size: file.size
    });

  } catch (err) {
    console.error('Upload error:', err);
    return json({ status: 'error', message: 'Upload failed.' }, { status: 500 });
  }
};