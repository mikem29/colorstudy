import { json } from '@sveltejs/kit';
import { getConnection } from '$lib/server/db.js';

export async function GET({ params }) {
    const connection = await getConnection();

    try {
        const artboardId = params.id;

        // Get preferences or create default ones
        const [prefRows] = await connection.execute(
            'SELECT * FROM artboard_preferences WHERE artboard_id = ?',
            [artboardId]
        );

        let preferences;
        if (prefRows.length === 0) {
            // Create default preferences
            await connection.execute(
                'INSERT INTO artboard_preferences (artboard_id, show_connection_lines, show_color_format_on_swatch, calculate_mixes) VALUES (?, ?, ?, ?)',
                [artboardId, true, true, false]
            );
            preferences = {
                show_connection_lines: true,
                show_color_format_on_swatch: true,
                calculate_mixes: false
            };
        } else {
            preferences = {
                show_connection_lines: Boolean(prefRows[0].show_connection_lines),
                show_color_format_on_swatch: Boolean(prefRows[0].show_color_format_on_swatch),
                calculate_mixes: Boolean(prefRows[0].calculate_mixes)
            };
        }

        return json({
            status: 'success',
            data: preferences
        });

    } catch (error) {
        console.error('Error fetching preferences:', error);
        return json({ status: 'error', message: 'Failed to fetch preferences' }, { status: 500 });
    } finally {
        await connection.end();
    }
}

export async function PUT({ params, request }) {
    const connection = await getConnection();

    try {
        const artboardId = params.id;
        const { show_connection_lines, show_color_format_on_swatch, calculate_mixes } = await request.json();

        // Update preferences
        await connection.execute(
            'INSERT INTO artboard_preferences (artboard_id, show_connection_lines, show_color_format_on_swatch, calculate_mixes) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE show_connection_lines = COALESCE(VALUES(show_connection_lines), show_connection_lines), show_color_format_on_swatch = COALESCE(VALUES(show_color_format_on_swatch), show_color_format_on_swatch), calculate_mixes = COALESCE(VALUES(calculate_mixes), calculate_mixes), updated_at = NOW()',
            [artboardId, show_connection_lines || false, show_color_format_on_swatch || false, calculate_mixes || false]
        );

        return json({
            status: 'success',
            message: 'Preferences updated'
        });

    } catch (error) {
        console.error('Error updating preferences:', error);
        return json({ status: 'error', message: 'Failed to update preferences' }, { status: 500 });
    } finally {
        await connection.end();
    }
}