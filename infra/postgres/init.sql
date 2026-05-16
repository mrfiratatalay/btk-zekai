CREATE DATABASE akilli_market_db;
CREATE DATABASE zekai_db;

\connect akilli_market_db;
CREATE EXTENSION IF NOT EXISTS vector;

\connect zekai_db;
CREATE EXTENSION IF NOT EXISTS vector;
