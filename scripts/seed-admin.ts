import { ensureEnvAdmin } from '../src/lib/server/auth.js';

ensureEnvAdmin();
console.log('Admin seed complete. Set ADMIN_EMAIL and ADMIN_PASSWORD if no user was created.');
