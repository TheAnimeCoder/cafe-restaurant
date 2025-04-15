# Café Delight - Restaurant Reservation System

A fully-featured restaurant website with a MongoDB-backed reservation system.

## Features

- **Elegant Restaurant Website**: Beautiful design showcasing the restaurant's ambiance, menu, and services
- **Real-time Reservation System**: MongoDB-backed system for booking tables
- **Table Management**: Backend system to manage table availability
- **Location Preferences**: Customers can select preferred seating areas (indoor, outdoor, private)
- **Responsive Design**: Works on all device sizes

## Setup Instructions

### Prerequisites

- Node.js (v14 or newer)
- MongoDB (v4.4 or newer)

### Installation

1. **Clone the repository**:

```bash
git clone <repository-url>
cd cafe-delight
```

2. **Install backend dependencies**:

```bash
cd api
npm install
```

3. **Set up MongoDB**:

Ensure MongoDB is running on your system. You can download it from [mongodb.com](https://www.mongodb.com/try/download/community).

4. **Set up environment variables**:

The default configuration uses:
- MongoDB at `mongodb://localhost:27017/cafe-delight`
- Backend server at port 5000

If you need to change these settings, modify the `.env` file in the `api` directory.

5. **Initialize the database**:

```bash
node initdb.js
```

This will create initial table data in the database.

### Running the Application

1. **Start the backend server**:

```bash
cd api
npm run dev
```

The server will run on http://localhost:5000.

2. **Open the website**:

Simply open the `index.html` file in a browser, or use a local development server like Live Server extension in VS Code.

## API Endpoints

### Reservations

- `POST /api/reservations`: Create a new reservation
- `GET /api/reservations`: Get all reservations
- `GET /api/reservations/:id`: Get a specific reservation
- `PATCH /api/reservations/:id/status`: Update reservation status
- `DELETE /api/reservations/:id`: Delete a reservation

### Tables

- `GET /api/tables`: Get all tables
- `GET /api/tables/available`: Get available tables (with optional filters)
- `POST /api/tables`: Create a new table
- `PATCH /api/tables/:id/status`: Update table status
- `DELETE /api/tables/:id`: Delete a table

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express
- **Database**: MongoDB with Mongoose
- **Validation**: Express Validator
- **Date Handling**: Moment.js

## Project Structure

- `/api`: Backend code
  - `/models`: MongoDB schemas
  - `/routes`: API endpoints
  - `server.js`: Main server file
- `/images`: Website images
- `index.html`: Main website
- `styles.css` & `elegant-theme.css`: Styling
- `script.js`: Frontend JavaScript 