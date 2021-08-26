import path from 'path';
const sqlite3 = require('sqlite3').verbose();

export function initReadDB(callback) {
    let db = new sqlite3.Database(path.resolve(__dirname, '..', 'storage/dictionary.sqlite'));
    callback(db);
}

export function initWriteDB(callback) {
    let db = new sqlite3.Database(path.resolve(__dirname, '..', 'storage/suggestions.sqlite'));
    callback(db);
}

export function initSubDB(callback) {
    let db = new sqlite3.Database(path.resolve(__dirname, '..', 'storage/subscribers.sqlite'));
    callback(db);
}

export function visitorsDB() {
    let db = new sqlite3.Database(path.resolve(__dirname, '..', 'storage/visitors.sqlite'));
    return Promise.resolve(db);
}
