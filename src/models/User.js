const pool = require('../config/db');

const User = {
  async create({ username, email, password }) {
    const result = await pool.query(
      `INSERT INTO users (username, email, password)
       VALUES ($1, $2, $3) RETURNING id, username, email`,
      [username, email, password]
    );
    return result.rows[0];
  },

  async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await pool.query(
      'SELECT id, username, email, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  async updateRefreshToken(id, token) {
    await pool.query(
      'UPDATE users SET refresh_token = $1 WHERE id = $2',
      [token, id]
    );
  },
};

module.exports = User;