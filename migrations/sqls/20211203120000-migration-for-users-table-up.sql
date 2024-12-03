CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    firstname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    password_digest VARCHAR NOT NULL,
    balance NUMERIC(10, 2) DEFAULT 0 NOT NULL
);

CREATE TABLE ai_models (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    cost_per_100_tokens NUMERIC NOT NULL,
    api_token TEXT NOT NULL,
    api_url TEXT NOT NULL
);