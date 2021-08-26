import { Router } from 'express';
import DariWord from '../models/DariWord';
import WordController from '../controllers/WordController';
import { dariRegex } from '../utils/wordMatcher';

export default ({ config, readDB }) => {
    let api = Router();
    const wordModel = new DariWord(readDB);
    const wordController = new WordController(wordModel);

    /** Return the list of dari words. */
    api.get('/', (req, res, next) => wordController.getWords().then(res.json.bind(res)).catch(next));

    /** Get Dari word by id  **/
    api.get('/:wordid(\\d+)', (req, res, next) => wordController.getWordWithDetailsById(req.params.wordid).then(res.json.bind(res)).catch(next));

    /**
     * Get Dari words by string. This will be used for auto completion to show multiple suggestions.
     **/
    api.get(`/:word(${dariRegex})`, (req, res, next) => wordController.getAutoSuggestions(req.params.word).then(res.json.bind(res)).catch(next));


    /** Same as word by id except it searches by string. */
    api.get(`/details/:word(${dariRegex})`, (req, res, next) =>
        wordController.getWordWithDetailsByString(req.params.word).then(res.json.bind(res)).catch(next));


    return api;

}
