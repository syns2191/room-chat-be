const fastify  = require('fastify');
const mongoose = require('mongoose');
const routes = require('./routes');
const { Options } =  require('./config/swagger');
const { config } = require('./config');
const swagger = require('@fastify/swagger');
const fastifyCors = require('@fastify/cors');
const Ajv = require('ajv');
const AjvFormats = require('ajv-formats');
const env = process.env.NODE_ENV;
const autoLoad = require('@fastify/autoload');
const { join }  = require('path');
const pinoInspector = require('pino-inspector')
const ChatHandler = require('./sockets/chats');


// Configure App
const app = fastify( { logger: {  level: 'debug', prettifier: 'pino-pretty' } });
function handle (conn, req) {
  conn.pipe(conn) // creates an echo server
}

app.register(require('@fastify/websocket'), {
  handle,
  options: { maxPayload: 1048576 }
})
app.register(swagger, Options);

const ajv = new Ajv({
  removeAdditional: true,
  useDefaults: true,
  coerceTypes: true,
  strict: false,
  allErrors: true,
})

AjvFormats(ajv)


app.get('/health',  {websocket: true }, async (request, reply) => {
  reply.send({ healthcheck: 'server is alive' })
})

app.register(fastifyCors, () => {
  return (req, callback) => {
    const corsOptions = {
      // This is NOT recommended for production as it enables reflection exploits
      origin: '*',
      allowedHeaders: [
        'Accept',
        'Authorization',
        'Content-Type',
        'If-None-Match',
        'Accept-language',
        'cache-control',
        'x-requested-with',
      ],
    }

    // do not include CORS headers for requests from localhost
    if (/^localhost$/m.test(req.headers.origin)) {
      corsOptions.origin = '*'
    }

    // callback expects two parameters: error and options
    callback(null, corsOptions)
  }
})

app.setValidatorCompiler(({ schema }) => {
  return ajv.compile(schema)
})

app.setValidatorCompiler(({ schema }) => {
  return ajv.compile(schema)
})


app.register(autoLoad, {
  dir: join(__dirname, 'plugins'),
})

app.addHook('preSerialization', (request, reply, _payload, done) => {
  reply.header('request_id', request.request_id)
  done()
})

app.setErrorHandler(function (error, request, reply) {
  // Send error response
  let response;
  if (error.validation) {
    response = {
      message: 'Bad Request',
      code: 'ERR_VAL',
      ...error,
    }
  } else {
    response = {
      ...error,
    }
  }

  // logger.error({ message: error, requestId: request.request_id })
  reply.code(500).send(response)
})

routes.forEach(route => {
	app.route(route);
});

const start = async () => {
	try {
    await app.register(ChatHandler);
		await app.listen({port: config.app.port});
		app.swagger();
	} catch (err) {
		app.log.error(err);
		process.exit(1);
	}
};
start();

module.exports = app;

// Configure DB
if (env !== 'test') {
	mongoose
		.connect(`mongodb://${config.db.host}:${config.db.port}/${config.db.name}`, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		})
		.then(() => app.log.info('MongoDB connected...'))
		.catch(err => app.log.error(err));
}