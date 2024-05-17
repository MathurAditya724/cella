import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { config } from 'config';

const client = postgres('postgres://postgres:proxy_password@0.0.0.0:65432/electric');

export const db = drizzle(client, {
  logger: config.debug,
});
