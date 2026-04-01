import { AsyncLocalStorage } from 'async_hooks';
import { v4 as uuidv4 } from 'uuid';

export const traceStorage = new AsyncLocalStorage();

export function traceMiddleware(req, res, next) {
  // Extract existing Request-ID or create a new one
  const requestId = req.headers['x-request-id'] || req.headers['x-correlation-id'] || uuidv4();
  
  // Attach it to the response so the client receives it
  res.setHeader('X-Request-ID', requestId);

  // Store it in the local storage for this async context
  traceStorage.run(requestId, () => {
    next();
  });
}
