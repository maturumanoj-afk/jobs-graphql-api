import express from 'express';
import cors from 'cors';
import { createHandler } from 'graphql-http/lib/use/express';
import morgan from 'morgan';
import DataLoader from 'dataloader';
import dotenv from 'dotenv';
import logger from './logger.js';
import { traceMiddleware, traceStorage } from './middleware/trace.js';
import schema from './schema.js';
import resolvers from './resolvers.js';
import pool from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(morgan('dev'));
app.use(cors({
  exposedHeaders: ['X-Request-ID']
}));
app.use(express.json());
app.use(traceMiddleware);

// GraphQL endpoint
app.all('/api/graphql', async (req, res, next) => {
  try {
    const handler = createHandler({ 
      schema, 
      rootValue: resolvers,
      context: {
        jobLoader: new DataLoader(async (ids) => {
          logger.debug(`DataLoader batching ${ids.length} jobs`);
          const res = await pool.query('SELECT * FROM jobs_library WHERE id = ANY($1)', [ids]);
          const jobsMap = new Map(res.rows.map(row => [row.id, row]));
          return ids.map(id => jobsMap.get(id) || null);
        })
      },
      formatError: (err) => {
        const reqId = traceStorage.getStore();
        if (reqId) {
          err.extensions = { ...err.extensions, requestId: reqId };
        }
        return err;
      }
    });
    return handler(req, res, next);
  } catch(e) {
    next(e);
  }
});

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Redirect root to GraphiQL-style info
app.get('/', (_req, res) =>
  res.json({ message: 'Jobs GraphQL API', endpoint: '/api/graphql' }),
);

app.listen(PORT, () => {
  logger.success(`Jobs GraphQL API running at http://localhost:${PORT}/api/graphql`);
});
