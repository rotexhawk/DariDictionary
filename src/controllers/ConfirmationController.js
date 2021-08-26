import clientError from '../utils/errors';
export default class ConfirmationController {
    constructor(db) {
        this.db = db;
        this.table = `daily_word_subscribers`;
    }

    confirm(req) {
        if (!req.query.email || !req.query.key) {
            return Promise.resolve();
        }
        return new Promise((resolve, reject) => {
            this.db.run(`UPDATE ${this.table} SET active = ? WHERE email = "${req.query.email}" AND activation_key = "${req.query.key}"`, 1,
                (err) => {
                    if (err) {
                        reject(new clientError(404, `${err}`));
                    } else {
                        console.log('it gets here');
                        resolve({ status: 'success', message: 'Your email is activated. Thank you.' });
                    }
                });
        });
    }
}
