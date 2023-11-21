/* eslint-disable no-console */
require('dd-trace').init();
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const path = require('path');
const { createTerminus } = require('@godaddy/terminus');
const next = require('next');
require('dotenv').config();

const dev = process.env.NODE_ENV !== 'production';
const isProduction = process.env.NODE_ENV === 'production';
const { addTrailingSlash } = require('./middlewares/trailing-slash');

function onSignal() {
  console.log('server is starting cleanup');
  return Promise.all([]);
}

function onShutdown() {
  console.log('cleanup finished, server is shutting down');
}

function beforeShutdown() {
  // given your readiness probes run every 5 second
  // may be worth using a bigger number so you won't
  // run into any race conditions
  return new Promise(resolve => {
    setTimeout(resolve, 5000);
  });
}

function healthcheck() {
  return Promise
    .resolve
    // optionally include a resolve value to be included as
    // info in the healthcheck response
    ();
}

const app = next({
  dev
});
const handle = app.getRequestHandler();

const projectRoutes = require('./routes');

app
  .prepare()
  .then(() => {
    const server = express();
    server.use(bodyParser.json());
    server.use(addTrailingSlash);

    // These routes are necessary to use  the newsletter via xhrHTTP
    server.use(projectRoutes(app, handle));

    server.use(express.static('public'));

    server.use((req, res) => {
      return handle(req, res);
    });

    // Terminus (EKS) if is production
    if (isProduction) {
      const options = {
        // healthcheck options
        healthChecks: {
          '/healthcheck': healthcheck // a function returning a promise indicating service health
        },
        // cleanup options
        timeout: 1000, // [optional = 1000] number of milliseconds before forceful exiting
        signals: ['SIGINT', 'SIGTERM'],
        beforeShutdown,
        onSignal, // [optional] cleanup function, returning a promise (used to be onSigterm)
        onShutdown // [optional] called right before exiting
      };

      const serverF = http.createServer(server);
      createTerminus(serverF, options);

      serverF.listen(process.env.PORT || 3001, err => {
        if (err) throw err;
        console.log(`App ready on http://localhost:${process.env.PORT || 3001}`);
      });
    } else {
      server.listen(process.env.PORT || 3001, err => {
        if (err) throw err;
        console.log(`App ready on http://localhost:${process.env.PORT || 3001}`);
      });
    }
  })
  .catch(ex => {
    console.log(ex.stack);
    process.exit(1);
  });
