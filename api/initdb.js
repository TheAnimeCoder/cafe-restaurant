const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Table = require('./models/Table');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cafe-delight', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Initial tables data
const initialTables = [
    { tableNumber: 1, capacity: 2, location: 'indoor', isAvailable: true },
    { tableNumber: 2, capacity: 2, location: 'indoor', isAvailable: true },
    { tableNumber: 3, capacity: 4, location: 'indoor', isAvailable: true },
    { tableNumber: 4, capacity: 4, location: 'indoor', isAvailable: true },
    { tableNumber: 5, capacity: 6, location: 'indoor', isAvailable: true },
    { tableNumber: 6, capacity: 6, location: 'outdoor', isAvailable: true },
    { tableNumber: 7, capacity: 8, location: 'outdoor', isAvailable: true },
    { tableNumber: 8, capacity: 10, location: 'private', isAvailable: true },
];

// Function to initialize the database
async function initDatabase() {
    try {
        // Clear existing tables
        await Table.deleteMany({});
        console.log('Cleared existing tables');

        // Insert new tables
        await Table.insertMany(initialTables);
        console.log('Successfully initialized tables');

        // Disconnect from the database
        mongoose.disconnect();
        console.log('Database initialization complete');

    } catch (error) {
        console.error('Database initialization error:', error);
    }
}

// Run the initialization
initDatabase(); 