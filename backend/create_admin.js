const bcrypt = require('bcryptjs');
const pool = require('./db');
(async () => {
  const email = process.argv[2] || 'admin@freemoney.local';
  const password = process.argv[3] || 'admin1234';
  try {
    const hashed = await bcrypt.hash(password, 10);
    await pool.query(
      `INSERT INTO users (email, password, role) VALUES ($1, $2, 'admin') ON CONFLICT (email) DO NOTHING`,
      [email, hashed]
    );
    console.log('✅ Admin created:', email);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating admin:', err);
    process.exit(1);
  }
})();
