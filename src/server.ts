import dotenv from 'dotenv';
const NODE_ENV = process.env.NODE_ENV || 'development';
NODE_ENV === 'development' && dotenv.config();

import http from 'http';
import { HttpError } from 'http-errors';
import { Server } from 'socket.io';
import app from './app';
import log from './common/libs/log';

// Create HTTP server.
const httpServer = http.createServer(app);

const normalizePort = (val: string): string | number | boolean => {
  const portOrPipe = parseInt(val, 10);

  if (isNaN(portOrPipe)) {
    // named pipe
    return val;
  }

  if (portOrPipe >= 0) {
    // port number
    return portOrPipe;
  }

  return false;
};

// Get port from environment and store in Express.
const port = normalizePort(process.env.PORT || '8080');
app.set('port', port);

const main = async () => {
  // Socket Server
  const io = new Server(httpServer, {
    cors: { origin: ['http://localhost:3000'], credentials: true },
  });
  io.on('connection', (webSocket) => {
    const { id, connected } = webSocket;
    log.info('Client connected', { id, connected });
    webSocket.on('close', () => log.info('Client disconnected'));

    const oneSecond = 1000;
    setInterval(() => {
      const dateTime = new Date().toISOString();
      webSocket.emit('date-time', dateTime);
    }, oneSecond * 5);
  });
  // HTTP Server
  httpServer.listen(port);
  httpServer.on('listening', () => {
    const addr = httpServer.address();
    const bind =
      typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr?.port;
    log.info(`🚀 APIs is listening on ${bind}`);
  });
  httpServer.on('error', (error: HttpError) => {
    if (error.syscall !== 'listen') {
      throw error;
    }
    const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
    if (error.code === 'EACCES') {
      log.error(`${bind} requires elevated privileges`);
    }
    if (error.code === 'EADDRINUSE') {
      log.error(`${bind} is already in use`);
    }
    process.exit(1);
  });
};

main().catch((error: Error) => log.error('Error', error));

process.on('unhandledRejection', (reason: string) => {
  // I just caught an unhandled promise rejection,
  // since we already have fallback handler for unhandled errors (see below),
  // let throw and let him handle that
  throw reason;
});

process.on('uncaughtException', (error: Error) => {
  // I just received an error that was never handled, time to handle it and then decide whether a restart is needed
  log.error('Error', error);
  process.exit(1);
});
