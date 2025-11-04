-- Netlify Database schema for Storyboard demo content
-- Defines a simple posts table compatible with the fetch-posts Netlify Function.

CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL UNIQUE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
