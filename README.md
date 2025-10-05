# Smart Transaction Categorizer
![Smart Transaction Categorizer Screenshot](assets/Screenshot%20From%202025-10-05%2005-04-16.png)

This is a full-stack project for automatically re-categorizing financial transactions based on user-defined rules.

## Project Structure

- `server/`: Backend powered by Bun, Express-like routing, MongoDB, and Mongoose.
- `client/`: Frontend built with React, TypeScript, Vite, Tailwind CSS, and shadcn/ui.

## Setup and Run Instructions

### Prerequisites

- Node.js (for client dependencies)
- Bun (for server)
- MongoDB instance (local or cloud)

### Backend Setup (server/)

1.  Navigate to the `server` directory:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    bun install
    ```
3.  Create a `.env` file in the `server` directory based on `.env.example` and provide your MongoDB URI:
    ```
    MONGO_URI="your_mongodb_connection_string"
    ```
4.  Run the seed script (optional, for initial data):
    ```bash
    bun run seed
    ```
5.  Start the backend server:
    ```bash
    bun run dev
    ```

### Frontend Setup (client/)

1.  Navigate to the `client` directory:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the frontend development server:
    ```bash
    npm run dev
    ```

### Full Stack

1.  Ensure both backend and frontend servers are running in separate terminals.
2.  Open your browser to `http://localhost:5173` (or whatever port the client starts on).

## API Endpoints

### Transactions

- `GET /api/transactions`: Fetch all transactions.
- `POST /api/transactions`: Add a new transaction.

### Rules

- `GET /api/rules`: Fetch all rules.
- `POST /api/rules`: Add a new rule.

### Categorization

- `POST /api/reapply-rules`: Re-categorize transactions based on defined rules.
