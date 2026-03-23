import express from 'express';
import cors from 'cors';
import { createHandler } from 'graphql-http/lib/use/express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import logger from './logger.js';
import schema from './schema.js';
import resolvers from './resolvers.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// GraphQL endpoint
app.all('/api/graphql', createHandler({ schema, rootValue: resolvers }));

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Redirect root to GraphiQL-style info
app.get('/', (_req, res) =>
  res.json({ message: 'Jobs GraphQL API', endpoint: '/api/graphql' }),
);

app.listen(PORT, () => {
  logger.success(`Jobs GraphQL API running at http://localhost:${PORT}/api/graphql`);
});
