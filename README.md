# Smart Transaction Categorizer

This is a 7-hour solo hackathon project that automatically re-categorizes financial transactions based on user-defined rules.

## Project Structure

- `/server`: Bun + Mongoose backend.
- `/client`: React + Vite + Tailwind CSS + shadcn/ui frontend.

## Setup

### Prerequisites

- [Bun](https://bun.sh/)
- [Node.js](https://nodejs.org/) (for npm)
- [MongoDB](https://www.mongodb.com/try/download/community) (or a MongoDB Atlas account)

### 1. Backend (`/server`)

1.  **Navigate to the server directory:**
    ```bash
    cd server
    ```

2.  **Install dependencies:**
    ```bash
    bun install
    ```

3.  **Set up environment variables:**
    -   Copy the example `.env.example` file to a new `.env` file:
        ```bash
        cp .env.example .env
        ```
    -   Open the `.env` file and replace `"your_mongodb_connection_string_here"` with your actual MongoDB connection string.

4.  **Seed the database (optional):**
    -   To populate the database with initial sample data, run:
        ```bash
        bun run seed
        ```

### 2. Frontend (`/client`)

1.  **Navigate to the client directory:**
    ```bash
    cd ../client
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

## Running the Application

1.  **Start the backend server:**
    -   In the `/server` directory, run:
        ```bash
        bun run dev
        ```
    -   The server will start on `http://localhost:3000`.

2.  **Start the frontend development server:**
    -   In the `/client` directory, run:
        ```bash
        npm run dev
        ```
    -   The frontend will be available at `http://localhost:5173` (or another port if 5173 is busy).

3.  **Open the application:**
    -   Open your web browser and navigate to the address provided by the Vite development server (usually `http://localhost:5173`).
