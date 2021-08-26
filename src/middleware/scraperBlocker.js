import requestIp from 'request-ip';
import { visitorsDB } from '../db';
import path from 'path';
import userAgents from '../config/userAgents.json';

let visitorDB;
let _request;
let _response;
let _next;
let _userAgent;

export default () => {
    return function scraperBlocker(req, res, next) {
        _request = req;
        _response = res;
        _next = next;
        _userAgent = _request.get('User-Agent');

        if (isAllowedCrawler()) {
            return _next();
        }

        checkUserAgent() // If use agent is in the list of blocked, reject the promise.
            .then(visitorsDB)
            .then(findRecord)
            .then(testForScrapper)
            .then(updateRecord)
            .then(blockOrAllow)
            .then(_next)
            .catch(() => renderBlockedPage(req, res, next));
    }

}

function checkUserAgent() {
    return new Promise((resolve, reject) => {
        let isBlocked = userAgents.blocked.some(blockedAgent => {
            return _userAgent.toLowerCase().includes(blockedAgent.toLowerCase());
        });
        if (isBlocked) {
            reject(isBlocked);
        }
        resolve();
    });
}


/**
 * Checks to see if a useragent belongs to the list of allowed crawlers.
 * Currently we are just checking if any part of the string contains the name of crawler. We want to match better when our userAgent list improves.
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
function isAllowedCrawler() {
    let found = userAgents.crawlers.some(crawler => {
        return _userAgent.toLowerCase().includes(crawler.toLowerCase());
    });
    return found;
}



/**
 * This method looks in the database to see if the ip address is in the visitors database.
 * @param  {[type]} db  [description]
 * @param  {[type]} req [description]
 * @return {[type]}     [description]
 */
function findRecord(db) {
    visitorDB = db;
    return new Promise((resolve, reject) => {
        let ip = requestIp.getClientIp(_request);
        visitorDB.get(`select * from visitors where ip = '${ip}'`, (err, data) => {
            if (err) {
                reject(err);
            }
            if (data) {
                resolve(data);
            } else {
                resolve(_request);
            }
        });
    });
}

/**
 * This method test to see if the scrapper is trying to access the data by comparing the time difference.
 * If the user has made more than 100 request in 10 seconds he will get blocked and after that requests originating from his ip
 * will be blocked. There is still a big loop hole because the ip can be easily changed.
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
function testForScrapper(data) {
    return new Promise((resolve) => {
        if (data.id) {
            let timeDiff = Date.now() - data.last_visit;
            if (timeDiff < 10000) { // If less than 10 sec and you are sending multiple requests increment his counter
                data.counter += 1;
            } else { // If he is slowly scrapping the site than allow him. haha
                data.counter = 0;
            }
            if (data.counter === 100) { // If have made 100 request in the past second, block the motha-fucka
                data.blocked = 1;
            }
        }
        resolve(data);
    });
}


/**
 * This methods inserts or updates. If the data was already here we only change the time. Leaving the useragent and other data the same
 * in case some one is bieng clever by making requests using different useragents.
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
function updateRecord(data) {
    const query = `INSERT OR REPLACE INTO visitors(user_agent,ip,last_visit,counter,blocked) VALUES(?,?,?,?,?)`;
    return new Promise((resolve, reject) => {
        visitorDB.run(query, prepareParams(data), (err) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
}

/**
 * If the data has blocked field and it is set to 1 block him but allow the css and images for the blocked page to load.
 * Otherwise allow the route to go to it's destination.
 * @param  {[type]}   data [description]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
function blockOrAllow(data) {
    if (data.blocked) {
        return Promise.reject();
    }
}

function renderBlockedPage(req, res, next) {
    if (req.url.includes('css') || req.url.includes('images') || req.url.includes('js')) {
        next();
    } else {
        res.render(path.join(__dirname, '..', 'views/pages/translate'));
    }
}

function getUserAgent(data) {
    if (data) {
        return data.user_agent || data.get('User-Agent');
    }
    return _request.get('User-Agent');
}


/**
 * Prepares the statement based on the data. If the data is retrieved from database than use those fields otherwise extract it
 * from the request.
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
function prepareParams(data) {
    let ip = data.ip;
    if (!data.id) {
        ip = requestIp.getClientIp(data);
    }
    const userAgent = data.user_agent || data.get('User-Agent');
    const counter = data.counter || 0;
    const blocked = data.blocked || 0;
    const params = [userAgent, ip, Date.now(), counter, blocked];
    return params;
}
