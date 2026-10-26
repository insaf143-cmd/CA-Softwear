import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

function centralDatabasePlugin() {
  const dbDir = path.resolve(process.cwd(), 'data');
  const dbFile = path.resolve(dbDir, 'firm_database.json');

  const getDb = () => {
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    if (fs.existsSync(dbFile)) {
      try {
        const raw = fs.readFileSync(dbFile, 'utf-8');
        if (raw.trim()) {
          return JSON.parse(raw);
        }
      } catch (e) {
        console.error('Error reading firm_database.json:', e);
      }
    }

    // Default master admin database for fresh clean start
    const defaultDb = {
      users: [
        {
          id: 'ADMIN01',
          name: 'Admin User',
          email: 'admin@cadesk.in',
          password: 'admin',
          role: 'SUPER_ADMIN',
          status: 'Active',
          designation: 'Managing Partner / Admin',
          mobile: '+91 99999 00000',
          allocatedClientIds: []
        }
      ],
      clients: [],
      removedClients: [],
      gstWork: [],
      itWork: [],
      rocWork: [],
      tasks: [],
      invoices: [],
      firmProfile: {
        firmName: 'M/s. Sharma & Associates',
        tagline: 'Chartered Accountants',
        frn: '129988W',
        gstin: '27AAAAA1234F1Z1',
        address: 'Suite 401, Nariman Point, Mumbai - 400021',
        phone: '+91 98765 43210',
        email: 'contact@sharma-ca.com',
        partnerName: 'CA Rajesh Sharma'
      },
      evidenceDocuments: [],
      inwardOutwardRecords: [],
      updatedAt: Date.now()
    };

    fs.writeFileSync(dbFile, JSON.stringify(defaultDb, null, 2), 'utf-8');
    return defaultDb;
  };

  const saveDb = (newData) => {
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    const current = getDb();
    const updated = {
      ...current,
      ...newData,
      updatedAt: Date.now()
    };
    fs.writeFileSync(dbFile, JSON.stringify(updated, null, 2), 'utf-8');
    return updated;
  };

  const handleMiddleware = (req, res, next) => {
    const url = req.url.split('?')[0];

    if (url === '/api/database/status') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      const current = getDb();
      res.end(JSON.stringify({ connected: true, updatedAt: current.updatedAt }));
      return;
    }

    if (url === '/api/database') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        res.statusCode = 200;
        res.end();
        return;
      }

      if (req.method === 'GET') {
        res.setHeader('Content-Type', 'application/json');
        const data = getDb();
        res.end(JSON.stringify({ success: true, data, updatedAt: data.updatedAt }));
        return;
      }

      if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });
        req.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            const saved = saveDb(parsed);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, updatedAt: saved.updatedAt }));
          } catch (err) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });
        return;
      }
    }

    next();
  };

  return {
    name: 'central-database-server',
    configureServer(server) {
      server.middlewares.use(handleMiddleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handleMiddleware);
    }
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), centralDatabasePlugin()],
  server: {
    host: '0.0.0.0',
    port: 5173
  },
  css: {
    postcss: false
  }
});
