const express = require('express');

const router = express.Router();

const sitemapOptions = {
  root: `public/`,
  headers: {
    'Content-Type': 'text/xml;charset=UTF-8',
  },
};

module.exports = (app) => {

  router.route(['/']).get((req, res) => {
    return app.render(req, res, '/index', {});
  });

  return router;
};
