// backend/models/User.js
const db = require("../db");

function serialize(row) {
  if (!row) return null;
  const { is_admin, created_at, ...rest } = row;
  return { ...rest, isAdmin: !!is_admin, createdAt: created_at };
}

const User = {
  create({ name, email, password }) {
    const info = db
      .prepare(`INSERT INTO users (name, email, password) VALUES (?, ?, ?)`)
      .run(name, email, password);
    return User.findById(info.lastInsertRowid);
  },
  findById(id) {
    return serialize(db.prepare(`SELECT * FROM users WHERE id = ?`).get(id));
  },
  findByEmail(email) {
    return serialize(db.prepare(`SELECT * FROM users WHERE email = ?`).get(email));
  },
  update(id, fields) {
    const keys = Object.keys(fields);
    if (keys.length === 0) return User.findById(id);
    const setClause = keys.map((k) => `${k} = ?`).join(", ");
    db.prepare(`UPDATE users SET ${setClause} WHERE id = ?`).run(...keys.map((k) => fields[k]), id);
    return User.findById(id);
  },
};

// Raw (unserialized, includes password hash) lookup — used only by auth for password checks.
User.findRawByEmail = (email) => db.prepare(`SELECT * FROM users WHERE email = ?`).get(email);

module.exports = User;
