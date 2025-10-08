import { error } from '@sveltejs/kit';
import PDFDocument from 'pdfkit';
import { getPool } from '$lib/server/db';
import type { RequestHandler } from './$types';

const pool = getPool();

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
        'SELECT name FROM artboards WHERE id = ? AND user_id = ?',
        [artboardId, locals.user.id]
      );
      artboard = (artboards as any[])[0];
      if (!artboard) {
        throw error(403, 'Access denied');
      }
    } finally {
      connection.release();
    }

    const { imageData, width, height } = await request.json();

    if (!imageData || !width || !height) {
      throw error(400, 'Missing required data');
    }

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

    // Collect PDF chunks in memory
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => {});

    // Add image to PDF
    doc.image(imageBuffer, 0, 0, {
      width: pdfWidth,
      height: pdfHeight
    });

    doc.end();

    // Wait for PDF to be generated
    await new Promise((resolve, reject) => {
      doc.on('end', resolve);
      doc.on('error', reject);
    });

    // Combine chunks
    const pdfBuffer = Buffer.concat(chunks);

    // Generate filename for download
    const filename = `${artboard.name || 'artboard'}_${artboardId}.pdf`;

    // Return PDF as download
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString()
      }
    });

  } catch (err) {
    console.error('PDF generation error:', err);
    throw error(500, 'PDF generation failed');
  }
};
