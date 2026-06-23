import { pool } from './db';

async function seedSmtpCredentials() {
    console.log('Seeding SMTP credentials from Uniformes Jasana...');
    try {
        const smtpHost = 'mail.uniformesjasana.com';
        const smtpPort = 465;
        const smtpSecure = true;
        const smtpUser = 'equipo@uniformesjasana.com';
        const smtpPass = '+)RapytSmV2a}FkO';
        const smtpFrom = '"Uniformes Jasana" <equipo@uniformesjasana.com>';

        const { rows } = await pool.query('SELECT id FROM company_settings LIMIT 1');
        if (rows.length > 0) {
            await pool.query(`
                UPDATE company_settings 
                SET smtp_host = $1, smtp_port = $2, smtp_secure = $3, smtp_user = $4, smtp_pass = $5, smtp_from = $6 
                WHERE id = $7
            `, [smtpHost, smtpPort, smtpSecure, smtpUser, smtpPass, smtpFrom, rows[0].id]);
            console.log('SMTP credentials successfully saved in existing company settings!');
        } else {
            await pool.query(`
                INSERT INTO company_settings (smtp_host, smtp_port, smtp_secure, smtp_user, smtp_pass, smtp_from) 
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [smtpHost, smtpPort, smtpSecure, smtpUser, smtpPass, smtpFrom]);
            console.log('SMTP credentials successfully created in new company settings!');
        }
    } catch (error) {
        console.error('Error seeding SMTP credentials:', error);
    } finally {
        await pool.end();
        process.exit();
    }
}

seedSmtpCredentials();
