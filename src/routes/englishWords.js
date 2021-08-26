import { Router } from "express";
import EnglishWord from "../models/EnglishWord";
import WordController from "../controllers/WordController";

export default ({ config, readDB }) => {
  let api = Router();
  const wordModel = new EnglishWord(readDB);
  const wordController = new WordController(wordModel);

  /** Return the list of english words. */
  api.get("/", (req, res, next) => wordController.getWords().then(res.json.bind(res)).catch(next));

  /** Get english word by id  **/
  api.get("/:wordid(\\d+)", (req, res, next) =>
    wordController.getWordWithDetailsById(req.params.wordid).then(res.json.bind(res)).catch(next)
  );

  /** Get english words by string. This will be used for auto complete to show multiple suggestions. **/
  api.get("/:word([\\w+%20?]+)", (req, res, next) =>
    wordController.getAutoSuggestions(req.params.word).then(res.json.bind(res)).catch(next)
  );

  /** Same as word by id except it searches by string. */
  api.get("/details/:word([\\w+%20?]+)", (req, res, next) =>
    wordController.getWordWithDetailsByString(req.params.word).then(res.json.bind(res)).catch(next)
  );

  api.get("/word-of-day", wordController.getWordOfDay.bind(wordController));

  return api;
};
