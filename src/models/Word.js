import decrypt from '../utils/decrypt';
import { turnToArray } from '../utils/wordCleanup';
import { lowerCaseSyns } from '../utils/wordCleanup';
import { lowerCaseWords } from '../utils/wordCleanup';

import WordPOS from 'wordpos';


export default class Word {
    constructor(db, writeDB) {
        this.db = db;
        this.writeDB = writeDB;
        this.wordPos = new WordPOS();
    }

    /**
     * Returns words given the query string.
     * @param  {query} string [sqlite query]
     * @return {PROMISE}        [return promise containing the words that matches the query.]
     */
    getWords(query) {
        return new Promise((resolve, reject) => {
            this.db.all(query, (err, words) => {
                if (err) {
                    reject(err);
                }
                resolve(lowerCaseWords(words));
            });

        });
    }

    /**
     * Returns a word given the query string.
     * @param  {query} string [sqlite query]
     * @return {PROMISE}        [return promise containing the word that matches the query.]
     */
    getWord(query) {
        return new Promise((resolve, reject) => {
            this.db.get(query, (err, word) => {
                if (err) {
                    reject(err);
                }
                resolve(word);
            });
        });
    }

    /**
     * Get a specific word based on id.
     * @param  {[int]} id    [id of the word to be retrieved]
     * @param  {String} table [The name of the table.]
     * @return {[Promise]}
     */
    getWordById(id) {
        const query = `SELECT serial,word FROM other WHERE serial = ${id}`;
        return this.getWord(query);
    }

    /**
     * Given a query return a word with the list of ids for the synonyms.
     * @param  {String} query [SQLITE query that searches for word.]
     * @return {Promise}       [Promise containing the word or error.]
     */
    getWordWithData(query) {
        return new Promise((resolve, reject) => {
            this.db.get(query, (err, word) => {
                if (err) {
                    reject(err);
                }
                word.ed = decrypt(word.ed);
                word.ant = turnToArray(word.ant);
                resolve(word);
            });
        });
    }

    /**
     * Given the node buffer, get the synonyms broken down by type.
     * @param  {Node Buffer} buffer [Node's buffer that's encrypted.]
     * @return {Promise}    [Promise that wraps the synonyms]
     */
    getSynonynms(buffer) {
        if (buffer == null) {
            return Promise.resolve(null);
        }
        let wordTypes = [];
        let synPromises = buffer.map(wordids => {
            // The first element inside each of the sub array will be the id in Types table.
            wordTypes.push(this.getWordType(wordids.shift()));
            return this.getSynonymsByIds(wordids);
        });

        return Promise.all(wordTypes).then(types => {
            return Promise.all(synPromises).then(synonyms => {
                return this.addTypeToSynonyms(lowerCaseSyns(synonyms), types);
            });
        });
    }


    /**
     * Get the type of word (noun, verb..etc) or type for a word array. Used for adding the type of synonyms to the list of synonyms.
     * @param  {Integer} id [id of the word type]
     * @return {Promise}    [Promise to return the type of word.]
     */
    getWordType(id) {
        return new Promise((resolve, reject) => {
            this.db.get(`select ps as type from type where serial = ${id}`, (err, type) => {
                if (err) {
                    reject(err);
                }
                resolve(type);
            });
        });
    }


    /**
     * Get the synonoym by an array of ids.
     * @param  {array} synIds [array of ids]
     * @return {promise}        [promise to return array of synonyms]
     * TODO: Figure out how to implement order by Field in sqlite.
     *  `SELECT serial,ot,en FROM oten WHERE serial IN(3833, 2470, 2472, 16978, 2474, 29704)
     *  ORDER BY FIELD(serial, 3833, 2470, 2472, 16978, 2474, 29704)`
     */
    getSynonymsByIds(synIds) {
        return new Promise((resolve, reject) => {
            this.db.all(`SELECT serial,ot,en FROM oten WHERE serial IN (${synIds})`, (err, synonyms) => {
                if (err) {
                    reject(err);
                }
                resolve(decrypt(synonyms));
            });
        });
    }


    /**
     * Get word with all it's data from other table and add it's synonyms.
     * @param  {Object} wordWithData [Word containing it's data from other table. Already decrypted]
     * @return {Promise}              [Promise to reutrn word with it's synonyms.]
     */
    getWordWithDataAndSynonyms(wordWithData) {
        return this.getSynonynms(wordWithData.ed).then((synonyms) => {
            wordWithData.synonyms = synonyms;
            return wordWithData;
        });
    }



    /**
     * Given the synonym array add type of word to it.
     * @param {Array} synonyms [Array of synonoyms grouped by type]
     * @param {Array} types    [Array of synonoyms goruped by type with an identified i.e {type:'none'}]
     */
    addTypeToSynonyms(synonyms, types) {
        for (var i = 0; i < types.length; i++) {
            synonyms[i].unshift(types[i]);
        }
        return synonyms;
    }


    /**
     * Search and replace all instance of word @s with the string.
     * @param  {String} replacee   [The string containing the placeholders.]
     * @param  {String} replacer   [The string that is going to replace the placeholders]
     * @return {[String]}          [String that has it's placeholders replaced with the replacee.]
     */
    formatString(string, replacer) {
        return string.replace(/\@s/g, replacer);
    }

    /**
     * This method adds the data to the suggestions database. Since duplicate entries can return error, we don't reject
     * the promise so the next entries can proceed. The error is resolved with an error message and passed down to the client.
     * We are recording the word because we want to differentiate between english and dari words.
     * @param {string} table  [Table name]
     * @param {integer} wordid [The id of the word to be added]
     * @param {String} word   [The actual word that the suggestions are for]
     * @param {Array} data   [Returns an array of promises. Array can have just one elemenet.]
     */
    addSuggestions(table, wordid, word, data) {
        var stmt = this.writeDB.prepare(`INSERT INTO ${table} VALUES (?,?,?)`)
        if (!Array.isArray(data)) {
            data = [data]; // If our data is string, keep it intact but change it to an array.
        }
        return data.map(str => {
            return new Promise((resolve) => {
                stmt.run(wordid, word, str, err => {
                    if (err) {
                        resolve({ wordid: wordid, word: word, suggestion: str, status: 400, error: `Duplicate entry.` });
                    }
                    resolve({ wordid: wordid, word: word, suggestion: str, status: 200, error: null });
                });
            });
        });
    }

    getWordnet(word) {
        return this.wordPos.lookup(word.word);
    }

}
