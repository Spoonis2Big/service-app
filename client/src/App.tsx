import React, { useState } from 'react';
import { Package, BarChart3, Truck, Menu, X } from 'lucide-react';
import Dashboard from './components/Dashboard';
import ServiceOrders from './components/ServiceOrders';
import DeliveryDashboard from './components/DeliveryDashboard';
import './App.css';

type ActiveView = 'dashboard' | 'orders' | 'delivery';

function App() {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { id: 'dashboard' as const, name: 'Dashboard', icon: BarChart3 },
    { id: 'orders' as const, name: 'Service Orders', icon: Package },
    { id: 'delivery' as const, name: 'Delivery Dashboard', icon: Truck },
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'orders':
        return <ServiceOrders />;
      case 'delivery':
        return <DeliveryDashboard />;
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
