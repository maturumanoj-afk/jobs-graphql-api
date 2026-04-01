import schema from './lib/schema.js';
import resolvers from './lib/resolvers.js';
import { createHandler } from 'graphql-http/lib/use/express';
import DataLoader from 'dataloader';
import pool from './lib/db.js';
import { traceStorage, traceMiddleware } from './lib/middleware/trace.js';
import dotenv from 'dotenv';

dotenv.config();

const handler = createHandler({ 
  schema, 
  rootValue: resolvers,
  context: (req) => ({
    jobLoader: new DataLoader(async (ids) => {
      const res = await pool.query('SELECT * FROM jobs_library WHERE id = ANY($1)', [ids]);
      const jobsMap = new Map(res.rows.map(row => [row.id, row]));
      return ids.map(id => jobsMap.get(id) || null);
    })
  }),
  formatError: (err) => {
    const reqId = traceStorage.getStore();
    if (reqId) {
      err.extensions = { ...err.extensions, requestId: reqId };
    }
    return err;
  }
});

export default function(req, res) {
  // Apply tracing middleware logic manually for the serverless function
  traceMiddleware(req, res, () => {
    // Also ensure CORS headers are set if not handled by vercel.json
    res.setHeader('Access-Control-Expose-Headers', 'X-Request-ID');
    return handler(req, res);
  });
}
