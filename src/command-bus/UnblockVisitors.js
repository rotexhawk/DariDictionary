import { visitorsDB } from '../db';

export default class UnblockVisitors {
    constructor() {
        this.table = 'visitors';
        this.currentTime = Date.now();
    }

    execute() {
        return visitorsDB()
            .then(db => this.setDatabase(db))
            .then(() => this.getBlockedVisitors())
            .then((visitors) => this.unblockVisitors(visitors));
    }

    setDatabase(db) {
        this.db = db;
    }

    getBlockedVisitors() {
        return new Promise((resolve, reject) => {
            this.db.all(`SELECT * FROM ${this.table} where blocked = 1`, (err, visitors) => {
                if (err) {
                    reject(err);
                }
                resolve(visitors);
            });
        });
    }

    unblockVisitors(visitors) {
        return visitors.map(visitor => {
            return new Promise((resolve, reject) => {
                visitor = this.updateVisitor(visitor);
                let query = `UPDATE ${this.table} SET last_visit = ${visitor.last_visit}, counter = ${visitor.counter}, blocked = ${visitor.blocked} where id = ${visitor.id}`;
                this.db.run(query, (err, res) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(res);
                });
            });
        });
    }

    updateVisitor(visitor) {
        if (((this.currentTime - visitor.last_visit) / 3.6e+6) >= 24) {
            visitor.blocked = 0;
            visitor.last_visit = this.currentTime;
            visitor.counter = 0;
        }
        return visitor;
    }
}

module.exports = UnblockVisitors;
