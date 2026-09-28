// backend/models/Product.js
const db = require("../db");

const Product = {
  findById(id) {
    return db.prepare(`SELECT * FROM products WHERE id = ?`).get(id) || null;
  },
  findByIds(ids) {
    if (!ids.length) return [];
    const placeholders = ids.map(() => "?").join(",");
    return db.prepare(`SELECT * FROM products WHERE id IN (${placeholders})`).all(...ids);
  },
  // Simple substring search, optionally scoped by category/gender/max price/color — enough for
  // the product grid and the buying agent's search_products tool alike. `query` matches name OR
  // category OR color so a free-text term like "dresses" or "blue" finds things even when
  // the model didn't (or a human wouldn't) separately set the category/color filter.
  // `colors` is an OR match (e.g. ["white","pink"] -> color LIKE %white% OR color LIKE %pink%).
  search({ query, category, gender, maxPrice, colors, excludeIds, sortBy, limit = 12 } = {}) {
    const clauses = [];
    const params = [];
    if (query) {
      clauses.push("(name LIKE ? OR category LIKE ? OR color LIKE ?)");
      params.push(`%${query}%`, `%${query}%`, `%${query}%`);
    }
    if (category) {
      clauses.push("category = ?");
      params.push(category);
    }
    if (gender) {
      clauses.push("gender = ?");
      params.push(gender);
    }
    if (maxPrice) {
      clauses.push("price <= ?");
      params.push(maxPrice);
    }
    if (colors && colors.length) {
      clauses.push(`(${colors.map(() => "color LIKE ?").join(" OR ")})`);
      colors.forEach((c) => params.push(`%${c}%`));
    }
    if (excludeIds && excludeIds.length) {
      clauses.push(`id NOT IN (${excludeIds.map(() => "?").join(",")})`);
      excludeIds.forEach((id) => params.push(id));
    }
    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    // sortBy is picked from a fixed allow-list below, never raw-interpolated from user input.
    const orderBy = { newest: "ORDER BY id DESC", price_asc: "ORDER BY price ASC", price_desc: "ORDER BY price DESC" }[sortBy] || "";
    params.push(limit);
    return db.prepare(`SELECT * FROM products ${where} ${orderBy} LIMIT ?`).all(...params);
  },
};

module.exports = Product;
