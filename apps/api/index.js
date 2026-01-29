import fs from 'fs/promises';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const PORT = process.env.PORT || 3000;

const store = {
  nextId: 1,
  todos: new Map(),
};

const PUBLIC_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'public');

const openapi = {
  openapi: '3.0.0',
  info: {
    title: 'Eve Starter Todos API',
    version: '1.0.0',
  },
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        responses: {
          '200': {
            description: 'OK',
          },
        },
      },
    },
    '/todos': {
      get: {
        summary: 'List todos',
        responses: {
          '200': {
            description: 'List of todos',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Todo' },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Create todo',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TodoCreate' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Todo' },
              },
            },
          },
          '400': { description: 'Invalid input' },
        },
      },
    },
    '/todos/{id}': {
      get: {
        summary: 'Get todo',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': {
            description: 'Todo',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Todo' },
              },
            },
          },
          '404': { description: 'Not found' },
        },
      },
      patch: {
        summary: 'Update todo',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TodoUpdate' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Todo' },
              },
            },
          },
          '400': { description: 'Invalid input' },
          '404': { description: 'Not found' },
        },
      },
      delete: {
        summary: 'Delete todo',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '204': { description: 'Deleted' },
          '404': { description: 'Not found' },
        },
      },
    },
  },
  components: {
    schemas: {
      Todo: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          title: { type: 'string' },
          completed: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'title', 'completed', 'createdAt', 'updatedAt'],
      },
      TodoCreate: {
        type: 'object',
        properties: {
          title: { type: 'string' },
        },
        required: ['title'],
      },
      TodoUpdate: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          completed: { type: 'boolean' },
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

const sendEmpty = (res, statusCode) => {
  res.statusCode = statusCode;
  res.end();
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
    case '.ico':
      return 'image/x-icon';
    case '.json':
      return 'application/json; charset=utf-8';
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

const readJsonBody = async (req) => {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
  }
  if (!raw) {
    return { ok: true, value: null };
  }
  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch {
    return { ok: false, value: null };
  }
};

const parseId = (segment) => {
  const id = Number(segment);
  if (!Number.isInteger(id) || id < 1) {
    return null;
  }
  return id;
};

const listTodos = () => Array.from(store.todos.values());

const createTodo = (title) => {
  const now = new Date().toISOString();
  const todo = {
    id: store.nextId,
    title,
    completed: false,
    createdAt: now,
    updatedAt: now,
  };
  store.todos.set(store.nextId, todo);
  store.nextId += 1;
  return todo;
};

const updateTodo = (todo, patch) => {
  const now = new Date().toISOString();
  const next = {
    ...todo,
    ...patch,
    updatedAt: now,
  };
  store.todos.set(todo.id, next);
  return next;
};

const handleTodosCollection = async (req, res) => {
  if (req.method === 'GET') {
    sendJson(res, 200, listTodos());
    return;
  }

  if (req.method === 'POST') {
    const body = await readJsonBody(req);
    if (!body.ok || !body.value || typeof body.value.title !== 'string') {
      sendJson(res, 400, { error: 'Invalid JSON body. "title" is required.' });
      return;
    }
    const title = body.value.title.trim();
    if (!title) {
      sendJson(res, 400, { error: '"title" cannot be empty.' });
      return;
    }
    const todo = createTodo(title);
    sendJson(res, 201, todo);
    return;
  }

  res.statusCode = 405;
  res.setHeader('Allow', 'GET, POST');
  res.end();
};

const handleTodoItem = async (req, res, id) => {
  const todo = store.todos.get(id);
  if (!todo) {
    sendJson(res, 404, { error: 'Todo not found.' });
    return;
  }

  if (req.method === 'GET') {
    sendJson(res, 200, todo);
    return;
  }

  if (req.method === 'PATCH') {
    const body = await readJsonBody(req);
    if (!body.ok || !body.value) {
      sendJson(res, 400, { error: 'Invalid JSON body.' });
      return;
    }

    const { title, completed } = body.value;
    const updates = {};
    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        sendJson(res, 400, { error: '"title" must be a non-empty string.' });
        return;
      }
      updates.title = title.trim();
    }
    if (completed !== undefined) {
      if (typeof completed !== 'boolean') {
        sendJson(res, 400, { error: '"completed" must be a boolean.' });
        return;
      }
      updates.completed = completed;
    }

    if (Object.keys(updates).length === 0) {
      sendJson(res, 400, { error: 'No valid fields to update.' });
      return;
    }

    const next = updateTodo(todo, updates);
    sendJson(res, 200, next);
    return;
  }

  if (req.method === 'DELETE') {
    store.todos.delete(id);
    sendEmpty(res, 204);
    return;
  }

  res.statusCode = 405;
  res.setHeader('Allow', 'GET, PATCH, DELETE');
  res.end();
};

export const createServer = () =>
  http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const path = url.pathname;

    if (req.method === 'GET' && path === '/health') {
      sendJson(res, 200, { status: 'ok' });
      return;
    }

    if (req.method === 'GET' && path === '/openapi.json') {
      sendJson(res, 200, openapi);
      return;
    }

    if (path === '/todos') {
      await handleTodosCollection(req, res);
      return;
    }

    if (path.startsWith('/todos/')) {
      const [, , idSegment, ...rest] = path.split('/');
      if (rest.length > 0) {
        sendJson(res, 404, { error: 'Not Found' });
        return;
      }
      const id = parseId(idSegment);
      if (!id) {
        sendJson(res, 400, { error: 'Invalid todo id.' });
        return;
      }
      await handleTodoItem(req, res, id);
      return;
    }

    if (req.method === 'GET') {
      const isRoot = path === '/';
      const isAsset =
        path.startsWith('/assets/') ||
        path.endsWith('.js') ||
        path.endsWith('.css') ||
        path.endsWith('.svg') ||
        path.endsWith('.png') ||
        path.endsWith('.ico') ||
        path.endsWith('.json');

      if (isRoot || isAsset) {
        const requestPath = isRoot ? 'index.html' : path.slice(1);
        const filePath = safeJoin(PUBLIC_DIR, requestPath);
        if (filePath && (await serveStatic(res, filePath))) {
          return;
        }
        sendJson(res, 404, { error: 'Not Found' });
        return;
      }

      const fallbackPath = safeJoin(PUBLIC_DIR, 'index.html');
      if (fallbackPath && (await serveStatic(res, fallbackPath))) {
        return;
      }
    }

    sendJson(res, 404, { error: 'Not Found' });
  });

export const resetStore = () => {
  store.nextId = 1;
  store.todos = new Map();
};

const startServer = () => {
  const server = createServer();
  server.listen(PORT, () => {
    console.log(`Eve Starter API listening on port ${PORT}`);
  });
};

if (process.argv[1]) {
  const isDirectRun =
    fileURLToPath(import.meta.url) === fileURLToPath(`file://${process.argv[1]}`);
  if (isDirectRun) {
    startServer();
  }
}
