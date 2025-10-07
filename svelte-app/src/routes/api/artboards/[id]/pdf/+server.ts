import { json, error } from '@sveltejs/kit';
import { dev } from '$app/environment';
import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { getPool } from '$lib/server/db';
import type { RequestHandler } from './$types';

const pool = getPool();

// Define upload directories based on environment
const UPLOAD_BASE = dev
  ? path.resolve(process.cwd(), 'uploads')
  : '/var/www/huemixy/user-uploads';

const pdfsDir = path.join(UPLOAD_BASE, 'pdfs');

export const POST: RequestHandler = async ({ request, locals, params }) => {
  // Check if user is authenticated
  if (!locals.user) {
    throw error(401, 'Authentication required');
  }

  const artboardId = params.id;

  try {
    // Verify user owns this artboard
    const connection = await pool.getConnection();
    let artboard;
    try {
      const [artboards] = await connection.execute(
        'SELECT * FROM artboards WHERE id = ? AND user_id = ?',
        [artboardId, locals.user.id]
      );
      artboard = (artboards as any[])[0];
      if (!artboard) {
        throw error(403, 'Access denied');
      }
    } finally {
      connection.release();
    }

    // Ensure PDFs directory exists
    if (!fs.existsSync(pdfsDir)) {
      fs.mkdirSync(pdfsDir, { recursive: true });
    }

    const { imageData, width, height } = await request.json();

    if (!imageData || !width || !height) {
      return json({ status: 'error', message: 'Missing required data' }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const filename = `artboard_${artboardId}_${timestamp}_${randomString}.pdf`;
    const filePath = path.join(pdfsDir, filename);

    // Convert base64 image data to buffer
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Create PDF with exact artboard dimensions (in inches converted to points)
    const pdfWidth = width * 72; // Convert inches to points (72 points = 1 inch)
    const pdfHeight = height * 72;

    const doc = new PDFDocument({
      size: [pdfWidth, pdfHeight],
      margins: { top: 0, bottom: 0, left: 0, right: 0 }
    });

    // Create write stream
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // Add image to PDF
    doc.image(imageBuffer, 0, 0, {
      width: pdfWidth,
      height: pdfHeight
    });

    doc.end();

    // Wait for PDF to be written
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    return json({
      status: 'success',
      message: 'PDF generated successfully',
      filename: `pdfs/${filename}`,
      url: `/uploads/pdfs/${filename}`
    });

  } catch (err) {
    console.error('PDF generation error:', err);
    return json({ status: 'error', message: 'PDF generation failed' }, { status: 500 });
  }
};
