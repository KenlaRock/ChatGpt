import { neon } from '@netlify/neon';

const sql = neon();
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

function parseLimit(value) {
  if (!value) {
    return DEFAULT_LIMIT;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_LIMIT;
  }

  return Math.min(parsed, MAX_LIMIT);
}

function response({ statusCode, body, headers = {} }) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...headers
    },
    body: JSON.stringify(body)
  };
}

export default async function handler(event) {
  if (!process.env.NETLIFY_DATABASE_URL) {
    return response({
      statusCode: 500,
      body: {
        error: 'Database connection is not configured. Set NETLIFY_DATABASE_URL to a valid Neon connection string.'
      }
    });
  }

  if (event.httpMethod && event.httpMethod.toUpperCase() === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    };
  }

  const limit = parseLimit(event.queryStringParameters?.limit);

  try {
    const rows = await sql`SELECT * FROM posts LIMIT ${limit}`;
    return response({
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: {
        posts: rows,
        limit
      }
    });
  } catch (error) {
    console.error('Failed to fetch posts from Neon:', error);
    return response({
      statusCode: 500,
      body: {
        error: 'Failed to load posts from the database.'
      }
    });
  }
}
