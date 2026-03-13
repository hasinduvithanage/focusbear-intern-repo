-- This file runs automatically on first container startup
-- Place any setup SQL here: create tables, insert seed data, etc.

-- Example: create a users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Example: insert seed data
INSERT INTO users (name, email) VALUES
    ('Alice', 'alice@example.com'),
    ('Bob',   'bob@example.com')
ON CONFLICT DO NOTHING;
