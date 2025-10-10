import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Camera, Calendar, Package } from 'lucide-react';
import { ServiceOrder, serviceOrderAPI } from '../services/api';

const ServiceOrders: React.FC = () => {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [formData, setFormData] = useState<Partial<ServiceOrder>>({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await serviceOrderAPI.getAll();
      setOrders(data);
    } catch (err) {
      setError('Failed to fetch service orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setSelectedOrder(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      status: 'open'
    });
    setShowModal(true);
  };

  const handleEdit = (order: ServiceOrder) => {
    setSelectedOrder(order);
    setFormData(order);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this service order?')) {
      try {
        await serviceOrderAPI.delete(id);
        await fetchOrders();
      } catch (err) {
        alert('Failed to delete service order');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedOrder) {
        await serviceOrderAPI.update(selectedOrder.id!, formData as ServiceOrder);
      } else {
        await serviceOrderAPI.create(formData as ServiceOrder);
      }
      setShowModal(false);
      await fetchOrders();
    } catch (err) {
      alert('Failed to save service order');
    }
  };

  const filteredOrders = orders.filter(order =>
    order.service_order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.product?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.acknowledgment?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'open': return 'status-open';
      case 'in_progress': return 'status-progress';
      case 'completed': return 'status-completed';
      case 'closed': return 'status-closed';
      default: return 'status-open';
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading service orders...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="service-orders">
      <div className="orders-header">
        <div className="header-actions">
          <div className="search-container">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button onClick={handleCreateNew} className="btn btn-primary">
            <Plus size={20} />
            New Order
          </button>
        </div>
      </div>

      <div className="orders-grid">
        {filteredOrders.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div className="order-number">
                {order.service_order_number}
              </div>
              <div className={`order-status ${getStatusColor(order.status)}`}>
                {order.status?.replace('_', ' ')}
              </div>
            </div>
            
            <div className="order-content">
              <h3>{order.customer_name}</h3>
              <p className="order-product">{order.product}</p>
              <p className="order-date">
                <Calendar size={16} />
                {new Date(order.date).toLocaleDateString()}
              </p>
              {order.issues && (
                <p className="order-issues">{order.issues}</p>
              )}
              {order.pictures && order.pictures.length > 0 && (
                <p className="order-pictures">
                  <Camera size={16} />
                  {order.pictures.length} photo(s)
                </p>
              )}
              {(order.serial_number || order.acknowledgment) && (
                <div className="order-sn-ack">
                  {order.serial_number && (
                    <p className="order-sn">
                      <span className="field-label">SN:</span> {order.serial_number}
                    </p>
                  )}
                  {order.acknowledgment && (
                    <p className="order-ack">
                      <span className="field-label">ACK:</span> {order.acknowledgment}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="order-actions">
              <button
                onClick={() => handleEdit(order)}
                className="btn btn-secondary btn-sm"
              >
                <Edit size={16} />
                Edit
              </button>
              <button
                onClick={() => handleDelete(order.id!)}
                className="btn btn-danger btn-sm"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="empty-state">
          <Package size={48} />
          <h3>No service orders found</h3>
          <p>Create your first service order to get started</p>
          <button onClick={handleCreateNew} className="btn btn-primary">
            <Plus size={20} />
            Create Order
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h2>{selectedOrder ? 'Edit Order' : 'New Order'}</h2>
              <button onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Service Order Number</label>
                  <input
                    type="text"
                    value={formData.service_order_number || ''}
                    onChange={(e) => setFormData({...formData, service_order_number: e.target.value})}
                    placeholder="Auto-generated if empty"
                  />
                </div>

                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={formData.date || ''}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Customer Name</label>
                  <input
                    type="text"
                    value={formData.customer_name || ''}
                    onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone_number || ''}
                    onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Product</label>
                  <input
                    type="text"
                    value={formData.product || ''}
                    onChange={(e) => setFormData({...formData, product: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status || 'open'}
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Serial Number (SN)</label>
                  <input
                    type="text"
                    value={formData.serial_number || ''}
                    onChange={(e) => setFormData({...formData, serial_number: e.target.value})}
                    placeholder="Enter serial number"
                  />
                </div>

                <div className="form-group">
                  <label>Acknowledgment (ACK)</label>
                  <input
                    type="text"
                    value={formData.acknowledgment || ''}
                    onChange={(e) => setFormData({...formData, acknowledgment: e.target.value})}
                    placeholder="Enter acknowledgment"
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label>Issues</label>
                <textarea
                  value={formData.issues || ''}
                  onChange={(e) => setFormData({...formData, issues: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="form-group full-width">
                <label>Notes</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {selectedOrder ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceOrders;