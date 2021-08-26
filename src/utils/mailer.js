import Mailgun from 'mailgun-js';
import config from '../middleware/config.js';
import express from 'express';
import nunjucks from 'nunjucks';
import helmet from 'helmet';
import path from 'path';
import EnglishWord from '../models/EnglishWord';
import WordController from '../controllers/WordController';

export default class Mailer {
    constructor() {
        this.mailgun = new Mailgun({ apiKey: config.app.mailgun.key, domain: config.app.mailgun.domain });
        this.app = express();
        this.app.use(helmet());
        nunjucks.configure(path.resolve(__dirname, '..', 'views'), {
            autoescape: true,
            express: this.app,
            watch: true,
            cache: false,
        });
        this.app.set('view engine', 'nunj');
        this.WordController = new WordController(new EnglishWord())
    }

    sendActivationEmail(data) {
        let emailFields = {
            from: 'Dari Dictionary <signup@daridictionary.org>',
            to: `${data.firstName} ${data.lastName} <${data.email}>`,
            subject: 'Dari Dictionary Signup',
        };
        return this.renderTemplate('./email/signup', data).then(template => {
            emailFields.html = template;
            return this.mailgun.messages().send(emailFields);
        });
    }

    sendDailyWord(wordofDay, subscribers) {
        let emailFields = {
            from: 'Dari Dictionary <dailyword@daridictionary.org>',
            subject: 'Word of the Day | Dari Dictionary'
        };

        return subscribers.map(subscriber => {
            return new Promise(resolve => {
                wordofDay.subscriber = subscriber;
                return this.renderTemplate('./email/word-of-day', wordofDay).then(renderedTemplate => {
                    emailFields.to = `${subscriber.firstName} ${subscriber.lastName} <${subscriber.email}>`;
                    emailFields.html = renderedTemplate;
                    resolve(this.mailgun.messages().send(emailFields));
                });
            });
        });
    }



    sendMessage(from, to, subject, html) {
        var data = {
            from: from,
            to: to,
            subject: subject,
            html: html
        };
        return this.mailgun.send(data);
    }


    renderTemplate(templatePath, data) {
        return new Promise((resolve, reject) => {
            this.app.render(path.join(templatePath), data, (err, html) => {
                if (err) {
                    reject(err);
                }
                resolve(html);
            });
        });
    }


}
