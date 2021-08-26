import { Router } from "express";
import DariWord from "../models/DariWord";
import SuggestionController from "../controllers/SuggestionController";

export default ({ config, readDB, writeDB }) => {
  let api = Router();
  const wordModel = new DariWord(readDB, writeDB);
  const suggestionController = new SuggestionController(wordModel);

  /** post the suggestion to a different database */
  api.post("/", (req, res, next) =>
    suggestionController.addSuggestion(req, res, next).bind(suggestionController)
  );

  return api;
};
