const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const QRCode = require('qrcode');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database setup
const db = new sqlite3.Database('./bigeventz.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.run(`CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticketId TEXT UNIQUE NOT NULL,
    event TEXT NOT NULL,
    numTickets INTEGER NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT,
    paymentMethod TEXT NOT NULL,
    totalAmount REAL NOT NULL,
    qrCode TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  console.log('Database tables initialized');
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'bigeventz-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'src/static')));

// API Routes

// Ticket purchase endpoint
app.post('/api/tickets/purchase', async (req, res) => {
  try {
    const {
      event,
      numTickets,
      name,
      email,
      phone,
      address,
      paymentMethod,
      cardDetails
    } = req.body;

    // Validate required fields
    if (!event || !numTickets || !name || !email || !phone || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Generate unique ticket ID
    const ticketId = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Calculate total amount (example: £50 per ticket)
    const pricePerTicket = 50;
    const totalAmount = pricePerTicket * parseInt(numTickets);

    // Generate QR code
    const qrCodeData = JSON.stringify({
      ticketId,
      event,
      numTickets,
      name,
      email,
      date: new Date().toISOString()
    });

    const qrCodeImage = await QRCode.toDataURL(qrCodeData);

    // Save to database
    db.run(
      `INSERT INTO tickets (ticketId, event, numTickets, name, email, phone, address, paymentMethod, totalAmount, qrCode)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [ticketId, event, numTickets, name, email, phone, address || '', paymentMethod, totalAmount, qrCodeImage],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({
            success: false,
            message: 'Error saving ticket'
          });
        }

        // Return success response
        res.json({
          success: true,
          ticketId,
          qrCode: qrCodeImage,
          totalAmount,
          message: 'Ticket purchased successfully!'
        });
      }
    );

  } catch (error) {
    console.error('Error processing ticket purchase:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get ticket by ID
app.get('/api/tickets/:ticketId', (req, res) => {
  const { ticketId } = req.params;

  db.get('SELECT * FROM tickets WHERE ticketId = ?', [ticketId], (err, row) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    res.json({ success: true, ticket: row });
  });
});

// Get all events (example endpoint)
app.get('/api/events', (req, res) => {
  const events = [
    {
      id: 1,
      name: 'Summer Music Festival',
      date: '2026-07-22',
      location: 'Hyde Park, London',
      category: 'Music',
      price: 50
    },
    {
      id: 2,
      name: 'Tech Innovators Conference',
      date: '2026-09-15',
      location: 'Manchester Central Convention Complex',
      category: 'Conference',
      price: 75
    },
    {
      id: 3,
      name: 'London Marathon',
      date: '2027-04-25',
      location: 'London, United Kingdom',
      category: 'Sports',
      price: 40
    }
  ];

  res.json({ success: true, events });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Serve index.html for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/static', 'index.html'));
});

// Catch-all route for SPA
app.get('*', (req, res) => {
  // If the request is for an HTML file, serve it
  if (req.path.endsWith('.html')) {
    res.sendFile(path.join(__dirname, 'src/static', req.path));
  } else {
    // Otherwise redirect to index
    res.sendFile(path.join(__dirname, 'src/static', 'index.html'));
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 BigEventz server running on port ${PORT}`);
  console.log(`📱 Access the website at: http://localhost:${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  db.close(() => {
    console.log('Database connection closed');
    process.exit(0);
  });
});

