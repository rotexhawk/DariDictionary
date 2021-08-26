import express from 'express';
import { Router } from 'express';
import path from 'path';
import SendDailyWord from '../src/command-bus/SendDailyWord';

export default ({ config, readDB }) => {
    let api = Router();

    const sendDailyWord = new SendDailyWord();

    api.use(express.static(path.join(__dirname, '..', 'public')));

    api.get('/', (req, res) => {
        res.json('Test your routes here!');
    });

    // Get returns auto suggestions
    api.get('/email/word-of-day', (req, res, next) => {
        sendDailyWord.getWordOfDay().then(data => res.render('email/word-of-day', data)).catch(next);
    });

    api.get('/send/word-of-day', sendDailyWord.execute.bind(sendDailyWord));


    return api;
};
