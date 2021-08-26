/**
 * This middleware catches any error thrown by the controllers, and sends it to the client.
 * The error object must be of type clientError and should have status and message.
 * If the error doesn't match client error we call next so the error is passed to the next middleware.
 */
export default () => {
  return function clientErrorHandler(err, req, res, next) {
    if (!isNaN(err.status)) {
      res.status(err.status).send(err.message);
    } else {
      next(err);
    }
  };
};
