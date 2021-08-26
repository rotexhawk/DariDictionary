import { version } from "../../package.json";
import { Router } from "express";
import words from "../routes/words";
import englishWords from "../routes/englishWords";
import dariWords from "../routes/dariWords";
import englishSuggestions from "../routes/englishSuggestions";
import dariSuggestions from "../routes/dariSuggestions";

export default ({ config, readDB, writeDB }) => {
  let api = Router();
  api.use("/words", words({ config, readDB })); // word of the day route
  api.use("/eng/words", englishWords({ config, readDB }));
  api.use("/dari/words", dariWords({ config, readDB }));
  api.use("/eng/suggestions", englishSuggestions({ config, readDB, writeDB }));
  api.use("/dari/suggestions", dariSuggestions({ config, readDB, writeDB }));

  // perhaps expose some API metadata at the root
  api.get("/", (req, res) => {
    res.json({ version });
  });

  return api;
};
