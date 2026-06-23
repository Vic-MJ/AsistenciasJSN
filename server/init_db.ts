import fs from 'fs';
import path from 'path';
import { pool } from './db';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const initDb = async () => {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(schema);
        await client.query('COMMIT');
        console.log('Database initialized successfully');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error initializing database:', error);
    } finally {
        client.release();
        pool.end();
    }
};

initDb();
