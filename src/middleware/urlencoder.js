export default () => {
  return function urlencoder(req, res, next) {
    req.url = decodeURIComponent(req.url);
    next();
  };
};
