const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    const dbPath = path.join(__dirname, 'service_orders.db');
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log('Connected to SQLite database');
        this.initializeTables();
      }
    });
  }

  initializeTables() {
    const createServiceOrdersTable = `
      CREATE TABLE IF NOT EXISTS service_orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_order_number TEXT UNIQUE NOT NULL,
        date TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        phone_number TEXT,
        product TEXT,
        issues TEXT,
        notes TEXT,
        pictures TEXT, -- JSON array of file paths
        piece_picked_date TEXT,
        piece_return_date TEXT,
        parts_ordered TEXT, -- JSON array of parts
        part_order_date TEXT,
        part_arrival_date TEXT,
        status TEXT DEFAULT 'open', -- open, in_progress, completed, closed
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user', -- user, admin
        active INTEGER DEFAULT 1, -- 1 = active, 0 = inactive
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    this.db.run(createServiceOrdersTable, (err) => {
      if (err) {
        console.error('Error creating service_orders table:', err);
      } else {
        console.log('Service orders table created or already exists');
      }
    });

    this.db.run(createUsersTable, (err) => {
      if (err) {
        console.error('Error creating users table:', err);
      } else {
        console.log('Users table created or already exists');
        this.createDefaultAdmin();
      }
    });
  }

  // Create default admin user if none exists
  createDefaultAdmin() {
    const bcrypt = require('bcryptjs');
    const checkAdminSql = 'SELECT * FROM users WHERE role = ?';

    this.db.get(checkAdminSql, ['admin'], (err, row) => {
      if (err) {
        console.error('Error checking for admin user:', err);
        return;
      }

      if (!row) {
        // No admin exists, create default admin
        const defaultPassword = 'admin123'; // User should change this immediately
        const hashedPassword = bcrypt.hashSync(defaultPassword, 10);

        const insertAdminSql = `
          INSERT INTO users (username, email, password, role)
          VALUES (?, ?, ?, ?)
        `;

        this.db.run(insertAdminSql, ['admin', 'admin@serviceapp.com', hashedPassword, 'admin'], (insertErr) => {
          if (insertErr) {
            console.error('Error creating default admin:', insertErr);
          } else {
            console.log('Default admin user created (username: admin, password: admin123)');
            console.log('IMPORTANT: Please change the default admin password immediately!');
          }
        });
      }
    });
  }

  // Get all service orders
  getAllServiceOrders(callback) {
    const sql = 'SELECT * FROM service_orders ORDER BY created_at DESC';
    this.db.all(sql, [], callback);
  }

  // Get service order by ID
  getServiceOrderById(id, callback) {
    const sql = 'SELECT * FROM service_orders WHERE id = ?';
    this.db.get(sql, [id], callback);
  }

  // Get service order by service order number
  getServiceOrderByNumber(serviceOrderNumber, callback) {
    const sql = 'SELECT * FROM service_orders WHERE service_order_number = ?';
    this.db.get(sql, [serviceOrderNumber], callback);
  }

  // Create new service order
  createServiceOrder(orderData, callback) {
    const sql = `
      INSERT INTO service_orders (
        service_order_number, date, customer_name, phone_number, product,
        issues, notes, pictures, piece_picked_date, piece_return_date,
        parts_ordered, part_order_date, part_arrival_date, serial_number,
        acknowledgment, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      orderData.service_order_number,
      orderData.date,
      orderData.customer_name,
      orderData.phone_number,
      orderData.product,
      orderData.issues,
      orderData.notes,
      JSON.stringify(orderData.pictures || []),
      orderData.piece_picked_date,
      orderData.piece_return_date,
      JSON.stringify(orderData.parts_ordered || []),
      orderData.part_order_date,
      orderData.part_arrival_date,
      orderData.serial_number,
      orderData.acknowledgment,
      orderData.status || 'open'
    ];

    this.db.run(sql, values, callback);
  }

  // Update service order
  updateServiceOrder(id, orderData, callback) {
    const sql = `
      UPDATE service_orders SET
        service_order_number = ?, date = ?, customer_name = ?, phone_number = ?,
        product = ?, issues = ?, notes = ?, pictures = ?, piece_picked_date = ?,
        piece_return_date = ?, parts_ordered = ?, part_order_date = ?,
        part_arrival_date = ?, serial_number = ?, acknowledgment = ?, status = ?, 
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    const values = [
      orderData.service_order_number,
      orderData.date,
      orderData.customer_name,
      orderData.phone_number,
      orderData.product,
      orderData.issues,
      orderData.notes,
      JSON.stringify(orderData.pictures || []),
      orderData.piece_picked_date,
      orderData.piece_return_date,
      JSON.stringify(orderData.parts_ordered || []),
      orderData.part_order_date,
      orderData.part_arrival_date,
      orderData.serial_number,
      orderData.acknowledgment,
      orderData.status,
      id
    ];

    this.db.run(sql, values, callback);
  }

  // Delete service order
  deleteServiceOrder(id, callback) {
    const sql = 'DELETE FROM service_orders WHERE id = ?';
    this.db.run(sql, [id], callback);
  }

  // Dashboard Analytics Queries
  
  // Get number of open service orders
  getOpenServiceOrdersCount(callback) {
    const sql = `SELECT COUNT(*) as count FROM service_orders WHERE status IN ('open', 'in_progress')`;
    this.db.get(sql, [], callback);
  }

  // Get average age of service orders in days
  getAverageServiceOrderAge(callback) {
    const sql = `
      SELECT AVG(julianday('now') - julianday(date)) as average_age 
      FROM service_orders 
      WHERE status IN ('open', 'in_progress')
    `;
    this.db.get(sql, [], callback);
  }

  // Get count of orders with parts on order
  getPartsOnOrderCount(callback) {
    const sql = `
      SELECT COUNT(*) as count 
      FROM service_orders 
      WHERE parts_ordered IS NOT NULL 
      AND parts_ordered != '[]' 
      AND (part_arrival_date IS NULL OR part_arrival_date = '')
      AND status IN ('open', 'in_progress')
    `;
    this.db.get(sql, [], callback);
  }

  // Get number of pieces picked up
  getPiecesPickedUpCount(callback) {
    const sql = `
      SELECT COUNT(*) as count 
      FROM service_orders 
      WHERE piece_picked_date IS NOT NULL 
      AND piece_picked_date != ''
    `;
    this.db.get(sql, [], callback);
  }

  // User Management Methods

  // Get all users
  getAllUsers(callback) {
    const sql = 'SELECT id, username, email, role, active, created_at FROM users ORDER BY created_at DESC';
    this.db.all(sql, [], callback);
  }

  // Get user by ID
  getUserById(id, callback) {
    const sql = 'SELECT id, username, email, role, active, created_at FROM users WHERE id = ?';
    this.db.get(sql, [id], callback);
  }

  // Get user by username (for login)
  getUserByUsername(username, callback) {
    const sql = 'SELECT * FROM users WHERE username = ?';
    this.db.get(sql, [username], callback);
  }

  // Get user by email
  getUserByEmail(email, callback) {
    const sql = 'SELECT * FROM users WHERE email = ?';
    this.db.get(sql, [email], callback);
  }

  // Create new user
  createUser(userData, callback) {
    const sql = `
      INSERT INTO users (username, email, password, role, active)
      VALUES (?, ?, ?, ?, ?)
    `;

    const values = [
      userData.username,
      userData.email,
      userData.password, // Should be hashed before calling this
      userData.role || 'user',
      userData.active !== undefined ? userData.active : 1
    ];

    this.db.run(sql, values, callback);
  }

  // Update user
  updateUser(id, userData, callback) {
    const sql = `
      UPDATE users SET
        username = ?, email = ?, role = ?, active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const values = [
      userData.username,
      userData.email,
      userData.role,
      userData.active,
      id
    ];

    this.db.run(sql, values, callback);
  }

  // Update user password
  updateUserPassword(id, hashedPassword, callback) {
    const sql = `
      UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    this.db.run(sql, [hashedPassword, id], callback);
  }

  // Delete user
  deleteUser(id, callback) {
    const sql = 'DELETE FROM users WHERE id = ?';
    this.db.run(sql, [id], callback);
  }

  close() {
    this.db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('Database connection closed');
      }
    });
  }
}

module.exports = Database;