/**
 * Vite plugin to handle Vercel API routes during development
 * Simulates Vercel serverless functions locally
 */

import type { Plugin, ViteDevServer } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
function loadEnvFile(): void {
  const envPath = join(__dirname, '.env');
  if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      }
    });
  }
}

// Load env variables on module initialization
loadEnvFile();

interface VercelRequest extends IncomingMessage {
  query: Record<string, string | string[]>;
  body: unknown;
  method?: string;
}

interface VercelResponse extends ServerResponse {
  status: (code: number) => VercelResponse;
  json: (data: unknown) => void;
  send: (data: string) => void;
}

function createVercelRequest(req: IncomingMessage, body: unknown): VercelRequest {
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const query: Record<string, string | string[]> = {};

  url.searchParams.forEach((value, key) => {
    const existing = query[key];
    if (existing) {
      query[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
    } else {
      query[key] = value;
    }
  });

  return Object.assign(req, {
    query,
    body,
    method: req.method,
  });
}

function createVercelResponse(res: ServerResponse): VercelResponse {
  const vercelRes = res as VercelResponse;

  vercelRes.status = (code: number) => {
    vercelRes.statusCode = code;
    return vercelRes;
  };

  vercelRes.json = (data: unknown) => {
    vercelRes.setHeader('Content-Type', 'application/json');
    vercelRes.end(JSON.stringify(data));
  };

  vercelRes.send = (data: string) => {
    vercelRes.end(data);
  };

  return vercelRes;
}

async function parseBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      if (body) {
        try {
          resolve(JSON.parse(body));
        } catch {
          resolve(body);
        }
      } else {
        resolve(undefined);
      }
    });
  });
}

export function apiPlugin(): Plugin {
  return {
    name: 'vite-plugin-api',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        // Parse route name from URL
        const routeName = req.url.split('?')[0].replace('/api/', '');
        const apiPath = join(__dirname, 'api', `${routeName}.ts`);

        try {
          // Load the API handler module
          const module = await server.ssrLoadModule(apiPath);
          const handler = module.default;

          if (!handler) {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'API handler not found' }));
            return;
          }

          // Parse request body
          const body = await parseBody(req);

          // Create Vercel-compatible request/response objects
          const vercelReq = createVercelRequest(req, body);
          const vercelRes = createVercelResponse(res);

          // Call the handler
          await handler(vercelReq, vercelRes);
        } catch (error) {
          console.error('API route error:', error);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error',
          }));
        }
      });
    },
  };
}
