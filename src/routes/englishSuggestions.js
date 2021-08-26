import { Router } from "express";
import EnglishWord from "../models/EnglishWord";
import SuggestionController from "../controllers/SuggestionController";

export default ({ config, readDB, writeDB }) => {
  let api = Router();

  const wordModel = new EnglishWord(readDB, writeDB);
  const suggestionController = new SuggestionController(wordModel);

  /** post the suggestions to a different database */
  api.post("/", (req, res, next) => {
    Promise.all(suggestionController.addSuggestions(req.body))
      .then(response => {
        res.status(200).send(response);
      })
      .catch(error => {
        res.status(400).send(error);
      })
      .catch(next);
  });

  return api;
};
