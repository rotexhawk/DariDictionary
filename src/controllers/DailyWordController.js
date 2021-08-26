import Mailer from '../utils/mailer';

export default class DailyWordController {
    constructor(db) {
        this.db = db;
        this.table = `daily_word_subscribers`;
        this.mailer = new Mailer();
    }

    sendDailyWord(wordofDay) {
        return this.getSubscribers()
            .then(subscribers => {
                return this.mailer.sendDailyWord(wordofDay, subscribers);
            });
    }

    getSubscribers() {
        return new Promise((resolve, reject) => {
            this.db.all(`SELECT * FROM ${this.table} where active = 1`, (err, subscribers) => {
                if (err) {
                    reject(err);
                }
                resolve(subscribers);
            });
        });
    }

}
