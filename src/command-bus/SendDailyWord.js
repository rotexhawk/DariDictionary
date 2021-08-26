import EnglishWord from '../models/EnglishWord';
import WordController from '../controllers/WordController';
import DailyWordController from '../controllers/DailyWordController';
import { initReadDB } from '../db';
import { initSubDB } from '../db';
import moment from 'moment';

export default class SendDailyWord {
    constructor() {
        initReadDB(db => { this.wordController = new WordController(new EnglishWord(db)) });
        initSubDB(db => { this.dailyWordController = new DailyWordController(db) });
    }

    getWordOfDay() {
        return this.wordController.getWordOfDay()
            .then(this.addDate);
    }

    execute() {
        return this.getWordOfDay()
            .then(this.dailyWordController.sendDailyWord.bind(this.dailyWordController));
    }

    addDate(wordOfDay) {
        return new Promise(resolve => {
            wordOfDay.date = moment().format('MMM Do YYYY');
            resolve(wordOfDay);
        });
    }
}
module.exports = SendDailyWord;
