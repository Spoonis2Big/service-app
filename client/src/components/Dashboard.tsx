import React, { useState, useEffect } from 'react';
import { BarChart3, Package, Clock, Truck } from 'lucide-react';
import { dashboardAPI, DashboardAnalytics } from '../services/api';

const Dashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<DashboardAnalytics>({
    openServiceOrders: 0,
    averageAge: 0,
    partsOnOrder: 0,
    piecesPickedUp: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await dashboardAPI.getAnalytics();
        setAnalytics(data);
      } catch (err) {
        setError('Failed to fetch dashboard analytics');
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  const metrics = [
    {
      title: 'Open Service Orders',
      value: analytics.openServiceOrders,
      icon: Package,
      color: 'blue',
      description: 'Active service orders requiring attention'
    },
    {
      title: 'Average Age',
      value: `${analytics.averageAge} days`,
      icon: Clock,
      color: 'orange',
      description: 'Average age of open service orders'
    },
    {
      title: 'Parts on Order',
      value: analytics.partsOnOrder,
      icon: BarChart3,
      color: 'purple',
      description: 'Service orders waiting for parts'
    },
    {
      title: 'Pieces Picked Up',
      value: analytics.piecesPickedUp,
      icon: Truck,
      color: 'green',
      description: 'Total pieces collected from customers'
    },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Service Management Dashboard</h2>
        <p>Overview of your service operations</p>
      </div>

      <div className="metrics-grid">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className={`metric-card metric-${metric.color}`}>
              <div className="metric-header">
                <div className="metric-icon">
                  <Icon size={24} />
                </div>
                <div className="metric-value">
                  {metric.value}
                </div>
              </div>
              <div className="metric-content">
                <h3>{metric.title}</h3>
                <p>{metric.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-summary">
        <div className="summary-card">
          <h3>Quick Summary</h3>
          <ul>
            <li>You have <strong>{analytics.openServiceOrders}</strong> active service orders</li>
            <li>Average processing time is <strong>{analytics.averageAge} days</strong></li>
            <li><strong>{analytics.partsOnOrder}</strong> orders are waiting for parts</li>
            <li><strong>{analytics.piecesPickedUp}</strong> pieces have been collected</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;