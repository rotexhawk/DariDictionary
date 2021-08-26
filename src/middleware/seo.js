import { hyphenateWord } from "../utils/wordCleanup";

let config;
export default conf => {
  config = conf;
  return function seoTasks(req, res, next) {
    _removeSlugWords(req, res, next);
    _canonolizeURL(req, res);
  };
};

/**
 * Removes all the slug words from the database and redirects the page to clean url. Good for SEO.
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
function _removeSlugWords(req, res, next) {
  if (req.url.includes(" ")) {
    req.url = hyphenateWord(req.url);
    res.redirect(req.url);
  } else {
    next();
  }
}

function _canonolizeURL(req, res) {
  res.locals.canonicalUrl = _getCanonicalUrl(req);
}

function _getCanonicalUrl(req) {
  return config.app.siteUrl + req.url;
}
