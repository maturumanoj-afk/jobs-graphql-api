import schema from './lib/schema.js';
import resolvers from './lib/resolvers.js';
import { createHandler } from 'graphql-http/lib/use/express';
import dotenv from 'dotenv';
dotenv.config();

// Vercel serverless function entry-point
export default createHandler({ schema, rootValue: resolvers });
