# Service Management Application

A comprehensive service order management system built with React (TypeScript) frontend and Node.js/Express backend with SQLite database.

## Features

### 📊 Dashboard
- **Open Service Orders**: Track active orders requiring attention
- **Average Age**: Monitor average processing time of open orders
- **Parts on Order**: Track orders waiting for parts to arrive
- **Pieces Picked Up**: Count of items collected from customers

### 📦 Service Orders Management
- Create, read, update, and delete service orders
- Search and filter orders by order number, customer name, or product
- Track comprehensive order information:
  - Service Order Number (auto-generated)
  - Date and Customer Information
  - Product and Issues Description
  - Pictures Upload Support
  - Piece Picked/Return Dates
  - Parts Ordering and Arrival Tracking
  - Order Status (Open, In Progress, Completed, Closed)

### 🚚 Delivery Dashboard
- **Enter New Order**: Quick form to create new service orders
- **Choose Existing Order**: Browse and select from existing orders
- Visual delivery status tracking
- Pickup and return scheduling

## Technology Stack

### Frontend
- **React** with **TypeScript** for type safety
- **Lucide React** for consistent icons
- **Axios** for API communication
- Responsive design with mobile-first approach

### Backend
- **Node.js** with **Express** framework
- **SQLite** database for data persistence
- **Multer** for file uploads
- **CORS** enabled for cross-origin requests

## Project Structure

```
service-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── ServiceOrders.tsx
│   │   │   └── DeliveryDashboard.tsx
│   │   ├── services/       # API service layer
│   │   │   └── api.ts
│   │   ├── App.tsx         # Main app component
│   │   └── App.css         # Application styles
├── server/                 # Node.js backend
│   ├── index.js           # Main server file
│   ├── database.js        # Database operations
│   ├── dashboard.js       # Dashboard analytics routes
│   └── uploads/           # File upload directory
└── package.json           # Root package.json
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone and navigate to the project**:
   ```bash
   cd service-app
   ```

2. **Install dependencies**:
   ```bash
   # Install root dependencies
   npm install
   
   # Install client dependencies
   cd client && npm install
   cd ..
   ```

### Running the Application

1. **Start the backend server**:
   ```bash
   npm run server
   ```
   The server will start on `http://localhost:3001`

2. **Start the frontend** (in a new terminal):
   ```bash
   npm run client
   ```
   The React app will start on `http://localhost:3000`

3. **Or run both simultaneously**:
   ```bash
   npm run dev
   ```

### API Endpoints

#### Service Orders
- `GET /api/service-orders` - Get all orders
- `GET /api/service-orders/:id` - Get order by ID
- `GET /api/service-orders/number/:orderNumber` - Get order by number
- `POST /api/service-orders` - Create new order
- `PUT /api/service-orders/:id` - Update order
- `DELETE /api/service-orders/:id` - Delete order
- `POST /api/service-orders/:id/upload` - Upload pictures

#### Dashboard Analytics
- `GET /api/dashboard/analytics` - Get dashboard metrics
- `GET /api/dashboard/analytics/detailed` - Get detailed analytics

## Database Schema

The SQLite database includes a `service_orders` table with the following fields:

- `id` - Primary key
- `service_order_number` - Unique order identifier
- `date` - Order date
- `customer_name` - Customer name
- `phone_number` - Customer phone
- `product` - Product/item description
- `issues` - Issues description
- `notes` - Additional notes
- `pictures` - JSON array of image paths
- `piece_picked_date` - When item was picked up
- `piece_return_date` - When item was returned
- `parts_ordered` - JSON array of ordered parts
- `part_order_date` - When parts were ordered
- `part_arrival_date` - When parts arrived
- `status` - Order status (open, in_progress, completed, closed)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## Features in Detail

### Responsive Design
- Mobile-first responsive layout
- Collapsible sidebar navigation
- Touch-friendly interface
- Optimized for desktop, tablet, and mobile devices

### File Upload Support
- Image upload for service orders
- Multiple file support
- Automatic file management
- Secure file storage

### Real-time Dashboard
- Auto-refreshing analytics (every 30 seconds)
- Visual status indicators
- Quick overview metrics
- Historical trend analysis

## Development

### Available Scripts
- `npm run dev` - Run both client and server
- `npm run server` - Run backend only
- `npm run client` - Run frontend only
- `npm run build` - Build for production
- `npm start` - Run production server

### Environment Variables
- `PORT` - Server port (default: 3001)
- Database automatically created in `server/service_orders.db`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support or questions, please open an issue in the GitHub repository.