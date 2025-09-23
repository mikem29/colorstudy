import mysql from 'mysql2/promise';
import { json } from '@sveltejs/kit';

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'm29user',
  password: 'm29Pa55word',
  database: 'colorstudy'
};

export async function GET({ params }) {
  try {
    const { id } = params;

    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(
      'SELECT id, file_path, uploaded_at, SUBSTRING_INDEX(file_path, \'/\', -1) as filename, artboard_width_inches, artboard_height_inches, image_x, image_y, image_width, image_height FROM images WHERE id = ?',
      [id]
    );

    await connection.end();

    if (rows.length > 0) {
      const data = {
        ...rows[0],
        original_name: rows[0].filename,
        upload_date: rows[0].uploaded_at
      };
      return json({ status: 'success', data });
    } else {
      return json({ status: 'error', message: 'Palette not found.' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching palette:', error);
    return json({ status: 'error', message: 'Failed to fetch palette.' }, { status: 500 });
  }
}

export async function PATCH({ params, request }) {
  try {
    const { id } = params;
    const updates = await request.json();

    const connection = await mysql.createConnection(dbConfig);

    // Build dynamic update query based on provided fields
    const updateFields = [];
    const values = [];

    if (updates.image_x !== undefined) {
      updateFields.push('image_x = ?');
      values.push(updates.image_x);
    }
    if (updates.image_y !== undefined) {
      updateFields.push('image_y = ?');
      values.push(updates.image_y);
    }
    if (updates.image_width !== undefined) {
      updateFields.push('image_width = ?');
      values.push(updates.image_width);
    }
    if (updates.image_height !== undefined) {
      updateFields.push('image_height = ?');
      values.push(updates.image_height);
    }

    if (updateFields.length === 0) {
      await connection.end();
      return json({ status: 'error', message: 'No valid update fields provided.' }, { status: 400 });
    }

    values.push(id);

    const [result] = await connection.execute(
      `UPDATE images SET ${updateFields.join(', ')} WHERE id = ?`,
      values
    );

    await connection.end();

    if (result.affectedRows > 0) {
      return json({ status: 'success', message: 'Image updated successfully.' });
    } else {
      return json({ status: 'error', message: 'Image not found.' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error updating image:', error);
    return json({ status: 'error', message: 'Failed to update image.' }, { status: 500 });
  }
}

export async function DELETE({ params }) {
  try {
    const { id } = params;

    const connection = await mysql.createConnection(dbConfig);

    // Start transaction to ensure both deletions succeed or fail together
    await connection.beginTransaction();

    try {
      // Delete associated swatches first (foreign key relationship)
      await connection.execute('DELETE FROM swatches WHERE image_id = ?', [id]);

      // Delete the image record
      const [result] = await connection.execute('DELETE FROM images WHERE id = ?', [id]);

      if (result.affectedRows > 0) {
        await connection.commit();
        await connection.end();
        return json({ status: 'success', message: 'Palette deleted successfully.' });
      } else {
        await connection.rollback();
        await connection.end();
        return json({ status: 'error', message: 'Palette not found.' }, { status: 404 });
      }
    } catch (error) {
      await connection.rollback();
      await connection.end();
      throw error;
    }
  } catch (error) {
    console.error('Error deleting palette:', error);
    return json({ status: 'error', message: 'Failed to delete palette.' }, { status: 500 });
  }
}