/* eslint-disable no-underscore-dangle */
const addTrailingSlash = (req, res, next) => {
  if (
    req.path.indexOf('/cms/') === -1 &&
    req.path.indexOf('.json') === -1 &&
    req.path.indexOf('.txt') === -1 &&
    req.path.indexOf('.js') === -1 &&
    req.path.indexOf('.jpg') === -1 &&
    req.path.indexOf('.jpeg') === -1 &&
    req.path.indexOf('.svg') === -1 &&
    req.path.indexOf('.ico') === -1 &&
    req.path.indexOf('.png') === -1 &&
    req.path.indexOf('.gif') === -1 &&
    req.path.indexOf('.css') === -1 &&
    req.path.indexOf('/_next/') === -1 &&
    req.path.indexOf('/static/') === -1
  ) {
    if (req.path.substr(-1) === '/') {
      //  Si ya tiene trailing continuar
      return next();
    }
    // Agregar el trailing slash conservando query params
    if (req._parsedUrl.search) {
      return res.redirect(301, `${req.path}/${req._parsedUrl.search}`);
    }

    //  Si no hay query params solo agregar trailing
    return res.redirect(301, `${req.path}/`);
  }

  //  Seguir routing para casos de assets y cms
  return next();
};

module.exports = { addTrailingSlash };
