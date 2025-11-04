-- Seed data for local Netlify Database development.
-- Provides a few example posts for the fetch-posts function.

INSERT INTO posts (title, body)
VALUES
  ('Welcome to Storyboard', 'Use the Storyboard workspace to experiment with the standalone shell.'),
  ('Deploy pipeline ready', 'Netlify build scripts now stage the standalone index and manifest for publishing.'),
  ('Database integration', 'The fetch-posts function reads from the Netlify Database via the Neon driver.')
ON CONFLICT (title) DO NOTHING;
