import schema from './src/schema.js';
import resolvers from './src/resolvers.js';
import { createHandler } from 'graphql-http/lib/use/express';
import dotenv from 'dotenv';
dotenv.config();

// Vercel serverless function entry-point
export default createHandler({ schema, rootValue: resolvers });
