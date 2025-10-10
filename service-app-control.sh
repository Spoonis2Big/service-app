#!/bin/bash

# Service App Management Script

case "$1" in
    start)
        echo "Starting Service App services..."
        sudo systemctl start service-app-backend.service
        sudo systemctl start service-app-frontend.service
        echo "Services started!"
        ;;
    stop)
        echo "Stopping Service App services..."
        sudo systemctl stop service-app-frontend.service
        sudo systemctl stop service-app-backend.service
        echo "Services stopped!"
        ;;
    restart)
        echo "Restarting Service App services..."
        sudo systemctl restart service-app-backend.service
        sudo systemctl restart service-app-frontend.service
        echo "Services restarted!"
        ;;
    status)
        echo "=== Backend Service Status ==="
        sudo systemctl status service-app-backend.service --no-pager
        echo ""
        echo "=== Frontend Service Status ==="
        sudo systemctl status service-app-frontend.service --no-pager
        ;;
    logs)
        echo "=== Backend Logs ==="
        sudo journalctl -u service-app-backend.service -n 20 --no-pager
        echo ""
        echo "=== Frontend Logs ==="
        sudo journalctl -u service-app-frontend.service -n 20 --no-pager
        ;;
    enable)
        echo "Enabling Service App services to start on boot..."
        sudo systemctl enable service-app-backend.service
        sudo systemctl enable service-app-frontend.service
        echo "Services enabled!"
        ;;
    disable)
        echo "Disabling Service App services from starting on boot..."
        sudo systemctl disable service-app-backend.service
        sudo systemctl disable service-app-frontend.service
        echo "Services disabled!"
        ;;
    test)
        echo "Testing Service App..."
        echo "Backend API: http://$(hostname -I | awk '{print $1}'):3001"
        curl -s http://localhost:3001/api/dashboard/analytics && echo ""
        echo "Frontend: http://$(hostname -I | awk '{print $1}'):3000"
        curl -s -I http://localhost:3000 | head -1
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs|enable|disable|test}"
        echo ""
        echo "Commands:"
        echo "  start    - Start both services"
        echo "  stop     - Stop both services"
        echo "  restart  - Restart both services"
        echo "  status   - Show status of both services"
        echo "  logs     - Show recent logs for both services"
        echo "  enable   - Enable services to start on boot"
        echo "  disable  - Disable services from starting on boot"
        echo "  test     - Test that both services are responding"
        exit 1
        ;;
esac

exit 0