import { sentry } from '@hono/sentry';
import { config } from 'config';
import { cors } from 'hono/cors';
import { csrf } from 'hono/csrf';
import { secureHeaders } from 'hono/secure-headers';
import { CustomHono } from '#/types/common';
import { logEvent } from './logger/log-event';
import { logger } from './logger/logger';
import { observatoryMiddleware } from './observatory-middleware';
import { rateLimiter } from './rate-limiter';

const app = new CustomHono();

// Secure headers
app.use('*', secureHeaders());

// Get metrics and trace
app.use('*', observatoryMiddleware);

// Sentry
app.use('*', sentry({ dsn: config.sentryDsn }));

// Health check for render.com
app.get('/ping', (c) => c.text('pong'));

// Logger
app.use('*', logger(logEvent));

const corsOptions = {
  origin: config.frontendUrl,
  credentials: true,
  allowMethods: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE'],
  allowHeaders: [],
};

// CORS
app.use('*', cors(corsOptions));

// CSRF protection
app.use('*', csrf({ origin: config.frontendUrl }));

// Rate limiter
app.use('*', rateLimiter({ limit: 50, windowMs: 60 * 60 * 1000, keyPrefix: 'common_fail' }, 'fail'));

export default app;
