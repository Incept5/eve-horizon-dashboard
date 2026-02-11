import fs from 'fs/promises';
import http from 'http';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const PORT = process.env.PORT || 3000;
const EVE_API_URL = process.env.EVE_PUBLIC_API_URL || process.env.EVE_API_URL || 'http://api.eve.lvh.me';

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

// Proxy requests to Eve API
const proxyToEveApi = (req, res, apiPath) => {
  const targetUrl = new URL(apiPath, EVE_API_URL);

  // Copy query params
  const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  targetUrl.search = reqUrl.search;

  const options = {
    hostname: targetUrl.hostname,
    port: targetUrl.port || (targetUrl.protocol === 'https:' ? 443 : 80),
    path: targetUrl.pathname + targetUrl.search,
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Forward Authorization header if present
  if (req.headers.authorization) {
    options.headers['Authorization'] = req.headers.authorization;
  }

  const protocol = targetUrl.protocol === 'https:' ? https : http;

  const proxyReq = protocol.request(options, (proxyRes) => {
    res.statusCode = proxyRes.statusCode;

    // Forward response headers
    Object.keys(proxyRes.headers).forEach((key) => {
      if (key.toLowerCase() !== 'transfer-encoding') {
        res.setHeader(key, proxyRes.headers[key]);
      }
    });

    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err.message);
    sendJson(res, 502, { error: 'Failed to connect to Eve API', details: err.message });
  });

  // Forward request body for POST/PUT/PATCH
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    req.pipe(proxyReq);
  } else {
    proxyReq.end();
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

    // BFF API routes - proxy to Eve API
    if (pathname.startsWith('/api/')) {
      // Strip /api prefix and proxy to Eve API
      const apiPath = pathname.replace(/^\/api/, '');
      proxyToEveApi(req, res, apiPath);
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
