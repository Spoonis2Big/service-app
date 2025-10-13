import React, { useState, useEffect } from 'react';
import { Package, BarChart3, Truck, Menu, X, Users, LogOut } from 'lucide-react';
import Dashboard from './components/Dashboard';
import ServiceOrders from './components/ServiceOrders';
import DeliveryDashboard from './components/DeliveryDashboard';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import './App.css';

type ActiveView = 'dashboard' | 'orders' | 'delivery' | 'admin';

interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
}

function App() {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
    }

    setIsCheckingAuth(false);
  }, []);

  const handleLoginSuccess = (token: string, userData: User) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setActiveView('dashboard');
  };

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#718096'
      }}>
        Loading...
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const navigation = [
    { id: 'dashboard' as const, name: 'Dashboard', icon: BarChart3 },
    { id: 'orders' as const, name: 'Service Orders', icon: Package },
    { id: 'delivery' as const, name: 'Delivery Dashboard', icon: Truck },
  ];

  // Add admin navigation only for admin users
  if (user?.role === 'admin') {
    navigation.push({ id: 'admin' as const, name: 'Admin Panel', icon: Users });
  }

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'orders':
        return <ServiceOrders />;
      case 'delivery':
        return <DeliveryDashboard />;
      case 'admin':
        return user?.role === 'admin' ? <AdminPanel /> : <Dashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app">
      {/* Mobile menu backdrop */}
      {sidebarOpen && (
        <div 
          className="mobile-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-title">
            <Package className="sidebar-logo" />
            <span>Service App</span>
          </div>
          <button
            className="mobile-close-btn"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  setSidebarOpen(false);
                }}
                className={`nav-item ${activeView === item.id ? 'nav-item-active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="main-content">
        {/* Header */}
        <header className="header">
          <button
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <h1 className="page-title">
            {navigation.find(nav => nav.id === activeView)?.name}
          </h1>
          <div className="header-actions">
            <span className="user-info">
              {user?.username} ({user?.role})
            </span>
            <button
              className="logout-btn"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
