import { Router } from "express";
import EnglishWord from "../models/EnglishWord";
import WordController from "../controllers/WordController";

export default ({ config, readDB }) => {
  let api = Router();

  const engWord = new EnglishWord(readDB);
  const engWordController = new WordController(engWord);

  /** Return word of the day. */
  api.get("/wordofday/", (req, res, next) => {
    engWordController.getWordOfDay().then(res.json.bind(res)).catch(next);
  });

  return api;
};
