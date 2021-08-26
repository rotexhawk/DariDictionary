import Isemail from "isemail";
import clientError from "../utils/errors";
import Mailer from "../utils/mailer";

export default class SubscriptionController {
  constructor(db) {
    this.db = db;
    this.table = `daily_word_subscribers`;
    this.mailer = new Mailer();
  }

  subscribeToDailyWord(req, res, next) {
    this.testEmail(req.body.email);
    let names = this.getName(req.body.name);
    let activationKey = Math.random().toString(36).slice(2); // generate a random string
    let unsubscribeKey = Math.random().toString(36).slice(2);
    new Promise((resolve, reject) => {
      this.db
        .run(
          `INSERT INTO ${this.table}('firstName','lastName','email', 'activation_key', 'unsubscribe_key', 'active')
             VALUES(?,?,?,?,?,?)`,
          [...names, req.body.email, activationKey, unsubscribeKey, 0],
          err => {
            if (err) {
              reject(new clientError(404, `${err}`));
            }
          }
        )
        .get(`SELECT * FROM ${this.table} where email = '${req.body.email}'`, (err, data) => {
          if (err) {
            reject(err);
          }
          resolve(data);
        });
    })
      .then(data => {
        this.mailer
          .sendActivationEmail(data)
          .then(msg => {
            console.log(msg);
            res.status(201).send(msg);
          })
          .catch(err => {
            console.log(err);
            return next(err);
          });
      })
      .catch(next);
  }

  testEmail(email) {
    if (!Isemail.validate(email)) {
      throw new clientError(400, "Incorrect email.");
    }
  }

  getName(fullName) {
    fullName = fullName.split(" ");
    if (fullName[0].length === 0) {
      return [null, null];
    } else if (fullName.length < 2) {
      fullName.push(null);
    } else if (fullName.length > 2) {
      fullName = fullName.slice(0, 2);
    }
    return fullName;
  }

  unsubscribeFromDailyWord(unSubscribeKey) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `update ${this.table} set active = 0 where unsubscribe_key = '${unSubscribeKey}'`,
        err => {
          if (err) {
            reject(err);
          }
          resolve();
        }
      );
    });
  }
}
