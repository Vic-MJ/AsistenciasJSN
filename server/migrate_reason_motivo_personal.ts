import { pool } from './db';

const migrateReason = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        console.log('Finding and dropping existing check constraints on reason column in permissions table...');
        
        await client.query(`
            DO $$
            DECLARE
                r RECORD;
            BEGIN
                FOR r IN
                    SELECT tc.constraint_name
                    FROM information_schema.table_constraints tc
                    JOIN information_schema.constraint_column_usage ccu
                      ON tc.constraint_name = ccu.constraint_name
                      AND tc.table_schema = ccu.table_schema
                    WHERE tc.table_name = 'permissions'
                      AND tc.constraint_type = 'CHECK'
                      AND ccu.column_name = 'reason'
                LOOP
                    EXECUTE 'ALTER TABLE permissions DROP CONSTRAINT ' || quote_ident(r.constraint_name);
                END LOOP;
            END $$;
        `);

        console.log('Adding new permissions_reason_check constraint to include MOTIVO_PERSONAL...');
        
        await client.query(`
            ALTER TABLE permissions 
            ADD CONSTRAINT permissions_reason_check 
            CHECK (reason IN ('CITA_MEDICA', 'EMERGENCIA_FAMILIAR', 'TRAMITE_DOCUMENTOS', 'CITA_ESCOLAR', 'MOTIVO_PERSONAL', 'OTRO'));
        `);
        
        await client.query('COMMIT');
        console.log('Migration completed successfully. MOTIVO_PERSONAL check constraint added.');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error during migration:', error);
    } finally {
        client.release();
        pool.end();
    }
};

migrateReason();
