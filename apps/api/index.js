import fs from 'fs/promises';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const PORT = process.env.PORT || 3000;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, 'dist');

const openapi = {
  openapi: '3.0.0',
  info: {
    title: 'Eve Horizon Dashboard API',
    version: '1.0.0',
    description: 'BFF API for Eve Horizon Dashboard',
  },
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/projects': {
      get: {
        summary: 'List projects (BFF proxy to Eve API)',
        responses: {
          '200': {
            description: 'List of projects',
          },
        },
      },
    },
  },
};

const sendJson = (res, statusCode, payload) => {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
};

const contentTypeFor = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.html':
      return 'text/html; charset=utf-8';
    case '.js':
      return 'text/javascript; charset=utf-8';
    case '.css':
      return 'text/css; charset=utf-8';
    case '.svg':
      return 'image/svg+xml';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.ico':
      return 'image/x-icon';
    case '.json':
      return 'application/json; charset=utf-8';
    case '.woff':
      return 'font/woff';
    case '.woff2':
      return 'font/woff2';
    default:
      return 'application/octet-stream';
  }
};

const safeJoin = (baseDir, requestPath) => {
  const resolvedBase = path.resolve(baseDir);
  const resolvedPath = path.resolve(resolvedBase, requestPath);
  const relative = path.relative(resolvedBase, resolvedPath);
  if (relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))) {
    return resolvedPath;
  }
  return null;
};

const serveStatic = async (res, filePath) => {
  try {
    const data = await fs.readFile(filePath);
    res.statusCode = 200;
    res.setHeader('Content-Type', contentTypeFor(filePath));
    res.end(data);
    return true;
  } catch {
    return false;
  }
};

const serveIndexHtml = async (res) => {
  const indexPath = path.join(DIST_DIR, 'index.html');
  const served = await serveStatic(res, indexPath);
  if (!served) {
    sendJson(res, 404, { error: 'SPA not built. Run npm run build:client first.' });
  }
};

export const createServer = () =>
  http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname;

    // Health check endpoint
    if (req.method === 'GET' && pathname === '/health') {
      sendJson(res, 200, { status: 'ok' });
      return;
    }

    // OpenAPI spec
    if (req.method === 'GET' && pathname === '/openapi.json') {
      sendJson(res, 200, openapi);
      return;
    }

    // BFF API routes - will proxy to Eve API in the future
    if (pathname.startsWith('/api/')) {
      // Placeholder for BFF proxy routes
      // TODO: Implement proxy to Eve API
      sendJson(res, 501, { error: 'API proxy not yet implemented' });
      return;
    }

    // Static file serving for SPA
    if (req.method === 'GET') {
      // Check if requesting a static asset
      const isAsset =
        pathname.startsWith('/assets/') ||
        pathname.endsWith('.js') ||
        pathname.endsWith('.css') ||
        pathname.endsWith('.svg') ||
        pathname.endsWith('.png') ||
        pathname.endsWith('.jpg') ||
        pathname.endsWith('.jpeg') ||
        pathname.endsWith('.ico') ||
        pathname.endsWith('.json') ||
        pathname.endsWith('.woff') ||
        pathname.endsWith('.woff2');

      if (isAsset) {
        const filePath = safeJoin(DIST_DIR, pathname.slice(1));
        if (filePath && (await serveStatic(res, filePath))) {
          return;
        }
        sendJson(res, 404, { error: 'Not Found' });
        return;
      }

      // For all other GET requests, serve index.html (SPA client-side routing)
      await serveIndexHtml(res);
      return;
    }

    sendJson(res, 404, { error: 'Not Found' });
  });

const startServer = () => {
  const server = createServer();
  server.listen(PORT, () => {
    console.log(`Eve Horizon Dashboard API listening on port ${PORT}`);
    console.log(`Serving SPA from: ${DIST_DIR}`);
  });
};

if (process.argv[1]) {
  const isDirectRun =
    fileURLToPath(import.meta.url) === fileURLToPath(`file://${process.argv[1]}`);
  if (isDirectRun) {
    startServer();
  }
}

export { createServer as default };
