import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import { initReadDB } from './db';
import { initWriteDB } from './db';
import { initSubDB } from './db';
import urlencoder from './middleware/urlencoder';
import seo from './middleware/seo';
import { logger } from './middleware/logger';
import { errorLogger } from './middleware/logger';
import config from './middleware/config';
import clientErrorHandler from './middleware/clientErrorHandler';
import api from './api';
import path from 'path';
import nunjucks from 'nunjucks';
import web from './web/index.js';
import helmet from 'helmet';
import scraperBlocker from './middleware/scraperBlocker';
import errorTemplate from './middleware/errorTemplate';

let app = express();
app.use(helmet());

app.use(helmet.contentSecurityPolicy(config.app.csp));
app.use(helmet.referrerPolicy(config.app.referrerPolicy));
app.use(helmet.hsts(config.app.transportSecurity));



nunjucks.configure(path.resolve(__dirname, '.', 'views'), {
    autoescape: true,
    express: app,
    watch: true,
    cache: false,
});

app.set('view engine', 'nunj');

app.server = http.createServer(app);

app.use(scraperBlocker());

app.use(logger());

app.use(bodyParser.json({
    limit: config.app.bodyLimit
}));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(urlencoder());

app.use(seo(config));


// connect to db
initReadDB(readDB => {
    // api router
    initWriteDB(writeDB => {
        app.use('/api', api({ config, readDB, writeDB }));
    });

    // html router
    initSubDB(subscribersDB => {
        app.use('/', web({ config, readDB, subscribersDB }));
    });

    // This handler catches the custom client error and passes the message to the client.
    // It calls next so the error logger can log the errors.
    app.use(clientErrorHandler());

    app.use(errorLogger());

    app.use(errorTemplate());

    app.server.listen(process.env.PORT || config.app.port);

    console.log(`Server started at: http://localhost:${app.server.address().port}`);
});

export default app;
