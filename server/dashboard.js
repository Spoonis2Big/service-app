const express = require('express');
const Database = require('./database');

const router = express.Router();

// Get dashboard analytics
router.get('/analytics', (req, res) => {
  const db = new Database();
  
  // Run all analytics queries in parallel
  const queries = {
    openOrders: new Promise((resolve, reject) => {
      db.getOpenServiceOrdersCount((err, result) => {
        if (err) reject(err);
        else resolve(result.count);
      });
    }),
    
    averageAge: new Promise((resolve, reject) => {
      db.getAverageServiceOrderAge((err, result) => {
        if (err) reject(err);
        else resolve(Math.round(result.average_age || 0));
      });
    }),
    
    partsOnOrder: new Promise((resolve, reject) => {
      db.getPartsOnOrderCount((err, result) => {
        if (err) reject(err);
        else resolve(result.count);
      });
    }),
    
    piecesPickedUp: new Promise((resolve, reject) => {
      db.getPiecesPickedUpCount((err, result) => {
        if (err) reject(err);
        else resolve(result.count);
      });
    })
  };

  Promise.all([
    queries.openOrders,
    queries.averageAge,
    queries.partsOnOrder,
    queries.piecesPickedUp
  ])
  .then(([openOrders, averageAge, partsOnOrder, piecesPickedUp]) => {
    res.json({
      openServiceOrders: openOrders,
      averageAge: averageAge,
      partsOnOrder: partsOnOrder,
      piecesPickedUp: piecesPickedUp
    });
  })
  .catch(err => {
    console.error('Error fetching dashboard analytics:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard analytics' });
  })
  .finally(() => {
    db.close();
  });
});

// Get detailed analytics for charts/graphs
router.get('/analytics/detailed', (req, res) => {
  const db = new Database();
  
  // Get service orders by status
  const statusQuery = `
    SELECT status, COUNT(*) as count 
    FROM service_orders 
    GROUP BY status
  `;
  
  // Get service orders by month
  const monthlyQuery = `
    SELECT 
      strftime('%Y-%m', date) as month,
      COUNT(*) as count
    FROM service_orders 
    WHERE date >= date('now', '-12 months')
    GROUP BY strftime('%Y-%m', date)
    ORDER BY month
  `;

  db.db.all(statusQuery, [], (err, statusResults) => {
    if (err) {
      console.error('Error fetching status analytics:', err);
      return res.status(500).json({ error: 'Failed to fetch status analytics' });
    }

    db.db.all(monthlyQuery, [], (err, monthlyResults) => {
      if (err) {
        console.error('Error fetching monthly analytics:', err);
        return res.status(500).json({ error: 'Failed to fetch monthly analytics' });
      }

      res.json({
        statusBreakdown: statusResults,
        monthlyTrend: monthlyResults
      });
      
      db.close();
    });
  });
});

module.exports = router;