import EnglishWord from "../models/EnglishWord";
import DariWord from "../models/DariWord";
import WordController from "../controllers/WordController";
import config from "../middleware/config";
import { initReadDB } from "../db";
import { hyphenateWord } from "../utils/wordCleanup";
import sm from "sitemap";
import path from "path";

export default class GenerateSitemap {
  constructor() {
    this.staticUrls = [
      { url: config.app.siteUrl + "/", changefreq: "hourly", priority: 0.9 },
      { url: config.app.siteUrl + "/about", changefreq: "weekly", priority: 0.5 },
      { url: config.app.siteUrl + "/how-to-help", changefreq: "weekly", priority: 0.5 },
    ];

    initReadDB(db => {
      this.dariController = new WordController(new EnglishWord(db));
      this.englishController = new WordController(new DariWord(db));
    });
  }

  execute() {
    return this.generateUrls(config, this.englishController, this.dariController).then(urls =>
      this.createIndex(urls)
    );
  }

  generateUrls(config, englishController, dariController) {
    return Promise.all([dariController.getWords(-1), englishController.getWords(-1)]).then(
      values => {
        return values
          .map(words => {
            return words.map(word => {
              return {
                url: `${config.app.siteUrl}/word/${hyphenateWord(word.word.trim())}`,
                changefreq: "weekly",
                priority: 0.8,
              };
            });
          })
          .reduce((acc, curr) => {
            if (Array.isArray(acc)) {
              return acc.concat(curr);
            }
          });
      }
    );
  }

  createIndex(urls) {
    urls = this.staticUrls.concat(urls);
    return new Promise((resolve, reject) => {
      sm.createSitemapIndex({
        cacheTime: 600000,
        hostname: `${config.app.siteUrl}/sitemaps`,
        sitemapSize: 50000,
        targetFolder: path.join(__dirname, "../..", `public/sitemaps/`),
        urls: urls,
        callback: (err, result) => {
          if (err) {
            reject(err);
          }
          resolve(result);
        },
      });
    });
  }
}

module.exports = GenerateSitemap;
