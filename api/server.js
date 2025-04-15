const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json());

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Track connected clients
const clients = new Set();

// WebSocket connection handling
wss.on('connection', (ws) => {
    console.log('Client connected');
    clients.add(ws);

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            handleWebSocketMessage(ws, data);
        } catch (error) {
            console.error('WebSocket message error:', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        clients.delete(ws);
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        clients.delete(ws);
    });

    // Send initial table status
    sendInitialStatus(ws);
});

// WebSocket message handler
function handleWebSocketMessage(ws, data) {
    switch (data.type) {
        case 'subscribe':
            handleSubscription(ws, data);
            break;
        case 'ping':
            ws.send(JSON.stringify({ type: 'pong' }));
            break;
        default:
            console.warn('Unknown message type:', data.type);
    }
}

// Handle client subscriptions
function handleSubscription(ws, data) {
    if (data.event === 'table-status') {
        ws.tableStatusSubscription = true;
    }
}

// Broadcast table status to all subscribed clients
function broadcastTableStatus(tableNumber, status) {
    const message = JSON.stringify({
        type: 'table-status',
        tableNumber,
        status,
        timestamp: new Date().toISOString()
    });

    clients.forEach(client => {
        if (client.tableStatusSubscription && client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

// Send initial table status to new clients
async function sendInitialStatus(ws) {
    try {
        const tables = await Table.find({}, 'tableNumber status isAvailable');
        ws.send(JSON.stringify({
            type: 'initial-status',
            tables: tables.map(table => ({
                number: table.tableNumber,
                status: table.isAvailable ? 'available' : 'reserved'
            }))
        }));
    } catch (error) {
        console.error('Error sending initial status:', error);
    }
}

// Make broadcast function available globally
global.broadcastTableStatus = broadcastTableStatus;

// Routes
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/tables', require('./routes/tables'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// MongoDB Connection with enhanced error handling
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cafe-delight', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000
        });
        console.log('Connected to MongoDB');
        
        // Start server after successful DB connection
        const PORT = process.env.PORT || 5000;
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Handle MongoDB connection errors
mongoose.connection.on('error', (error) => {
    console.error('MongoDB error:', error);
});

mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected. Attempting to reconnect...');
    setTimeout(connectDB, 5000);
});

// Initialize database connection
connectDB();