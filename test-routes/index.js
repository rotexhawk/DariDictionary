import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import { initReadDB } from '../src/db';
import { logger } from '../src/middleware/logger';
import { errorLogger } from '../src/middleware/logger';
import config from '../src/middleware/config';
import path from 'path';
import nunjucks from 'nunjucks';
import testRoutes from './routes';



let app = express();

nunjucks.configure(path.resolve(__dirname, '../src/', 'views'), {
    autoescape: true,
    express: app,
    watch: true,
    cache: false,
});

app.set('view engine', 'nunj');

app.server = http.createServer(app);

app.use(logger());

app.use(bodyParser.json({
    limit: config.app.bodyLimit
}));

app.use(bodyParser.urlencoded({ extended: true }));




// connect to db
initReadDB(readDB => {
    app.use('/test', testRoutes({ config, readDB }));

    app.use(errorLogger());

    app.server.listen(4040);

    console.log(`Server started at: http://localhost:4040`);
});

export default app;
