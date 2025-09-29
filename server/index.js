const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Database = require('./database');
const dashboardRoutes = require('./dashboard');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database
const db = new Database();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Use dashboard routes
app.use('/api/dashboard', dashboardRoutes);

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Service App API is running' });
});

// Get all service orders
app.get('/api/service-orders', (req, res) => {
  db.getAllServiceOrders((err, rows) => {
    if (err) {
      console.error('Error fetching service orders:', err);
      res.status(500).json({ error: 'Failed to fetch service orders' });
    } else {
      // Parse JSON fields
      const processedRows = rows.map(row => ({
        ...row,
        pictures: JSON.parse(row.pictures || '[]'),
        parts_ordered: JSON.parse(row.parts_ordered || '[]')
      }));
      res.json(processedRows);
    }
  });
});

// Get service order by ID
app.get('/api/service-orders/:id', (req, res) => {
  const id = req.params.id;
  db.getServiceOrderById(id, (err, row) => {
    if (err) {
      console.error('Error fetching service order:', err);
      res.status(500).json({ error: 'Failed to fetch service order' });
    } else if (!row) {
      res.status(404).json({ error: 'Service order not found' });
    } else {
      // Parse JSON fields
      const processedRow = {
        ...row,
        pictures: JSON.parse(row.pictures || '[]'),
        parts_ordered: JSON.parse(row.parts_ordered || '[]')
      };
      res.json(processedRow);
    }
  });
});

// Get service order by service order number
app.get('/api/service-orders/number/:orderNumber', (req, res) => {
  const orderNumber = req.params.orderNumber;
  db.getServiceOrderByNumber(orderNumber, (err, row) => {
    if (err) {
      console.error('Error fetching service order:', err);
      res.status(500).json({ error: 'Failed to fetch service order' });
    } else if (!row) {
      res.status(404).json({ error: 'Service order not found' });
    } else {
      // Parse JSON fields
      const processedRow = {
        ...row,
        pictures: JSON.parse(row.pictures || '[]'),
        parts_ordered: JSON.parse(row.parts_ordered || '[]')
      };
      res.json(processedRow);
    }
  });
});

// Create new service order
app.post('/api/service-orders', (req, res) => {
  const orderData = req.body;
  
  // Generate service order number if not provided
  if (!orderData.service_order_number) {
    const timestamp = Date.now();
    orderData.service_order_number = `SO-${timestamp}`;
  }

  db.createServiceOrder(orderData, function(err) {
    if (err) {
      console.error('Error creating service order:', err);
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        res.status(400).json({ error: 'Service order number already exists' });
      } else {
        res.status(500).json({ error: 'Failed to create service order' });
      }
    } else {
      res.status(201).json({ 
        id: this.lastID, 
        service_order_number: orderData.service_order_number,
        message: 'Service order created successfully' 
      });
    }
  });
});

// Update service order
app.put('/api/service-orders/:id', (req, res) => {
  const id = req.params.id;
  const orderData = req.body;

  db.updateServiceOrder(id, orderData, function(err) {
    if (err) {
      console.error('Error updating service order:', err);
      res.status(500).json({ error: 'Failed to update service order' });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Service order not found' });
    } else {
      res.json({ message: 'Service order updated successfully' });
    }
  });
});

// Delete service order
app.delete('/api/service-orders/:id', (req, res) => {
  const id = req.params.id;

  db.deleteServiceOrder(id, function(err) {
    if (err) {
      console.error('Error deleting service order:', err);
      res.status(500).json({ error: 'Failed to delete service order' });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Service order not found' });
    } else {
      res.json({ message: 'Service order deleted successfully' });
    }
  });
});

// Upload pictures for service order
app.post('/api/service-orders/:id/upload', upload.array('pictures', 10), (req, res) => {
  const id = req.params.id;
  
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  // Get current service order to append new pictures
  db.getServiceOrderById(id, (err, row) => {
    if (err || !row) {
      return res.status(404).json({ error: 'Service order not found' });
    }

    const currentPictures = JSON.parse(row.pictures || '[]');
    const newPictures = req.files.map(file => `/uploads/${file.filename}`);
    const allPictures = [...currentPictures, ...newPictures];

    // Update service order with new pictures
    const updateData = {
      ...row,
      pictures: allPictures
    };

    db.updateServiceOrder(id, updateData, function(updateErr) {
      if (updateErr) {
        console.error('Error updating service order with pictures:', updateErr);
        res.status(500).json({ error: 'Failed to update service order with pictures' });
      } else {
        res.json({ 
          message: 'Pictures uploaded successfully',
          pictures: allPictures
        });
      }
    });
  });
});

module.exports = app;

// Start server if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}