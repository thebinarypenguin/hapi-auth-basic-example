var BasicAuth  = require('hapi-auth-basic');
var Handlebars = require('handlebars');
var Hapi       = require('hapi');
var Path       = require('path');
var Vision     = require('vision');
var Pkg        = require('../package.json');

// Create a hapi server
var server = new Hapi.Server();

// Add an incoming connection to listen on
server.connection({
  host: 'localhost',
  port: 3000,
  router: {
    stripTrailingSlash: true,
  }
});

// Register plugins
server.register([
  BasicAuth,
  Vision,
], function(err) {
  if (err) { throw err; }

  // Register an authentication strategy named "simple" which uses the "basic" scheme.
  // The "basic" authentication scheme is provided by the "hapi-auth-basic" plugin.
  server.auth.strategy(
    'simple',
    'basic',
    {
      validateFunc: function(request, username, password, callback) {
        if (username === 'admin' && password === 'password') {
          return callback(null, true, { username: 'admin' });
        } else {
          return callback(null, false);
        }
      }
    }
  );

  // Configure template rendering.
  // The "views" method is provided by the "vision" plugin.
  server.views({
    engines: {
      html: Handlebars,
    },
    path: Path.join(__dirname, 'templates'),
    layout: 'layout',
  });

  // Register a route to show the "Home" page (no authentication required)
  server.route({
    method: 'GET',
    path: '/',
    config: {
      auth: {
        mode: 'try',
        strategy: 'simple',
      }
    },
    handler: function(request, reply) {
      reply.view('home');
    }
  });

  // Register a route to show the "Public" page (no authentication required)
  server.route({
    method: 'GET',
    path: '/public',
    config: {
      auth: {
        mode: 'try',
        strategy: 'simple',
      }
    },
    handler: function(request, reply) {
      reply.view('public');
    }
  });

  // Register a route to show the "Private" page (client must provide valid credentials).
  // If the client does not provide valid credentials it will receive a 401 Unauthorized response.
  server.route({
    method: 'GET',
    path: '/private',
    config: {
      auth: {
        mode: 'required',
        strategy: 'simple',
      }
    },
    handler: function(request, reply) {
      reply.view('private');
    }
  });

  // Start listening for requests
  server.start(function() {
    console.log(Pkg.name + '@' + Pkg.version + ' is running at ' + server.info.uri);
  });
});