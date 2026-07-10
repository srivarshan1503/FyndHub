
const cron = require('node-cron');
const pool = require('./db');

// Cron job to delete posts older than 24 hours
function startCronJobs() {
    cron.schedule('* * * * *', async () => {
        try {
            console.log('Running auto-expiry job...')
            const query = `UPDATE posts 
                SET status = 'expired' 
                WHERE expires_at < NOW() 
                AND status = 'active'
                RETURNING id, title`;
            const result = await pool.query(query);
            if (result.rows.length > 0) {
                console.log(`Expired ${result.rows.length} posts:`, result.rows);
            }
        } catch (error) {
            console.log('Error deleting posts:', error);
        }
    })
}

module.exports = { startCronJobs }