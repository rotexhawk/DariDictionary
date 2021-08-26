import express from "express";
import { Router } from "express";
import path from "path";
import DariWord from "../models/DariWord";
import EnglishWord from "../models/EnglishWord";
import WordController from "../controllers/WordController";
import SubscriptionController from "../controllers/SubscriptionController";
import ConfirmationController from "../controllers/ConfirmationController";

export default ({ config, readDB, subscribersDB }) => {
  let api = Router();
  const engWord = new EnglishWord(readDB);
  const dariWord = new DariWord(readDB);

  const engWordController = new WordController(engWord);
  const dariWordController = new WordController(dariWord);

  const subscriptionController = new SubscriptionController(subscribersDB);
  const confirmationController = new ConfirmationController(subscribersDB);

  api.use(express.static(path.join(__dirname, "../..", "public")));

  // Get returns auto suggestions
  api.get("/", (req, res, next) => {
    engWordController
      .getWordOfDay()
      .then(data => res.render("index", data))
      .catch(next);
  });

  // Post returns the data for specific word when the search form is submitted.
  api.post("/", (req, res, next) => {
    if (/^[A-Za-z0-9]/.test(req.body.word)) {
      engWordController
        .getWordWithDetailsByString(req.body.word)
        .then(data => res.render("index", data))
        .catch(err => {
          next(err);
        });
    } else {
      dariWordController
        .getWordWithDetailsByString(req.body.word)
        .then(data => res.render("index", data))
        .catch(next);
    }
  });

  /**
   * Get word by id
   * @param  {[integer]} '/word/:wordid(\d+)' [The serial number of the word]
   * @void  { renders the index page with the data returned }
   */
  api.get("/word/:wordid(\\d+)", (req, res, next) => {
    engWordController
      .getWordWithDetailsById(req.params.wordid)
      .then(data => res.render("index", data))
      .catch(next);
  });

  /** Get English words by string. The regex matches all alpha numeric characters + zero or more %20 + zero or more - */
  api.get("/word/:word([\\w+%20?\\-?]+)", (req, res, next) => {
    engWordController
      .getWordWithDetailsByString(req.params.word)
      .then(data => res.render("index", data))
      .catch(error => {
        if (error) {
          res.render(path.join("./pages/missing-word"), {
            word: req.params.word,
          });
        }
      })
      .catch(next);
  });

  /** Get Dari word by string. If word is not there show missing-word template. */
  api.get("/word/:word([\\u0600-\\u06FF%20?\\-?]+)", (req, res, next) => {
    dariWordController
      .getWordWithDetailsByString(req.params.word)
      .then(data => {
        data.wordType = "Dari";
        res.render("index", data);
      })
      .catch(error => {
        if (error) {
          res.render(path.join("./pages/missing-word"), {
            word: req.params.word,
          });
        }
      })
      .catch(next);
  });

  api.get("/how-to-help", (req, res) => res.render(path.join("./pages/how-to-help")));

  api.get("/about", (req, res) => res.render(path.join("./pages/about")));

  api.get("/translate", (req, res, next) => {
    dariWordController
      .getWordForTranslation()
      .then(data => res.render(path.join("./pages/translate"), data))
      .catch(next);
  });

  /** Signs up people to the subscription database */
  api.post("/signup", subscriptionController.subscribeToDailyWord.bind(subscriptionController));

  api.get("/confirm", (req, res, next) => {
    return confirmationController
      .confirm(req)
      .then(result => {
        return engWordController.getWordOfDay().then(data => {
          data.notification = result;
          res.render("index", data);
        });
      })
      .catch(next);
  });

  api.get("/unsubscribe/:unSubscribeKey", (req, res, next) => {
    subscriptionController
      .unsubscribeFromDailyWord(req.params.unSubscribeKey)
      .then(res.render(path.join("./pages/unsubscribe")))
      .catch(next);
  });

  return api;
};
