export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { createLogger, format, transports } = await import('winston');
    
    // Create a custom logger
    const logger = createLogger({
      level: process.env.LOG_LEVEL || 'debug',
      format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.json()
      ),
      transports: [
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.simple(),
            format.printf(({ timestamp, level, message, ...meta }) => {
              return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
            })
          )
        })
      ]
    });

    // Override console methods to use our logger
    console.log = (...args) => logger.info(args.join(' '));
    console.error = (...args) => logger.error(args.join(' '));
    console.warn = (...args) => logger.warn(args.join(' '));
    console.debug = (...args) => logger.debug(args.join(' '));

    // Log startup information
    logger.info('Application starting with detailed logging enabled', {
      nodeEnv: process.env.NODE_ENV,
      debug: process.env.DEBUG,
      logLevel: process.env.LOG_LEVEL,
      verbose: process.env.VERBOSE,
      nextDebug: process.env.NEXT_DEBUG,
      nextLogLevel: process.env.NEXT_LOG_LEVEL
    });

    // Add request logging middleware
    const originalRequest = global.Request;
    global.Request = class extends originalRequest {
      constructor(input, init) {
        super(input, init);
        logger.debug('HTTP Request created', {
          url: this.url,
          method: this.method,
          headers: Object.fromEntries(this.headers.entries())
        });
      }
    };

    // Add response logging
    const originalResponse = global.Response;
    global.Response = class extends originalResponse {
      constructor(body, init) {
        super(body, init);
        logger.debug('HTTP Response created', {
          status: this.status,
          statusText: this.statusText,
          headers: Object.fromEntries(this.headers.entries())
        });
      }
    };

    // Log unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Promise Rejection', {
        reason: reason?.toString(),
        stack: reason?.stack,
        promise: promise.toString()
      });
    });

    // Log uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception', {
        error: error.message,
        stack: error.stack
      });
      process.exit(1);
    });

    // Log memory usage periodically
    setInterval(() => {
      const memUsage = process.memoryUsage();
      logger.debug('Memory Usage', {
        rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
        external: `${Math.round(memUsage.external / 1024 / 1024)}MB`
      });
    }, 30000); // Every 30 seconds
  }
} 