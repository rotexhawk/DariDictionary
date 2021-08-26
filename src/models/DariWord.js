import Word from "./Word";
import { dehyphenateWord } from "../utils/wordCleanup";

export default class DariWord extends Word {
  constructor(db, writeDB) {
    super(db, writeDB);
    this.db = db;
  }

  /**
   * [Get a list of words from 1 to limit. Currently hard coded to 60]
   * @param  {String} table [dari words are saved in other]
   * @return {[Promise]}
   */
  getWords(limit = 60) {
    const query = `SELECT serial,word FROM other LIMIT ${limit}`;
    return super.getWords(query);
  }

  /**
   * Get a specific word based on id.
   * @param  {[int]} id    [id of the word to be retrieved]
   * @param  {String} table [The name of the table.]
   * @return {[Promise]}
   */
  getWordById(id, table = "other") {
    return super.getWordById(id, table);
  }

  /**
   * Get Dari word by string. This makes sure it gives you a unique primary (meaning).
   * For general search use searchWordByString
   * @param  {[string]} string [the word to search for.]
   * @return {[PROMISE]}        [Returns a promise that will either have error or the JSON]
   * Not very accurate. AND (ant is not null) added for testing
   */
  getWordByString(string) {
    // const query = `SELECT serial,word FROM other WHERE ((word =  '')
    // AND (ed IS NOT NULL) AND (ant is NOT NULL)) ORDER BY LENGTH(ed)`;

    const query = `SELECT serial,word FROM other WHERE (word =  '${string}' or word = '${dehyphenateWord(
      string
    )}')
                ORDER BY CASE
                    WHEN ((ed is NOT NULL) AND (ant is NOT NULL)) then 1
                    WHEN (ed IS NOT NULL) then 2
                    WHEN (ant IS NOT NULL) then 3
                    WHEN (tr is NOT NULL) then 4
                    WHEN (exm is NOT NULL) then 5
                    else 6
                end, LENGTH(ed) DESC
            limit 6`;
    return super.getWord(query);
  }

  /**
   * Search for a word in the other table. It has no restrictions like getDariWordByString
   * @param  {String} string [user input]
   * @return {Promise} [Promise to return the word found or an error.]
   */
  searchWordByString(string) {
    const query = `SELECT serial,word FROM other WHERE (word =  '${string}')`;
    return super.getWord(query);
  }

  /**
   * Gets a list of word matching the dari word. Usefull for auto suggestions.
   * @param  {String} typedWord [the word/character to find matches for.]
   * @return {PROMISE}           [Return a promise containing the list of words matching the query.]
   */
  getAutoSuggestions(typedWord, limit = 6) {
    const query = `SELECT word FROM other_words WHERE ( word like '${typedWord}%')  ORDER BY word ASC LIMIT ${limit}`;
    return super
      .getWords(query)
      .then(words => {
        return words.map(word => {
          return this.searchWordByString(word.word);
        });
      })
      .then(allWords => {
        return Promise.all(allWords).then(wordsWithSerial => {
          /** SearchWordByString promise can resolve to undefined value because a word in other_words table might not be found in other table.
                We are removing that undefined here. */
          return wordsWithSerial.filter(word => word !== undefined);
        });
      });
  }

  /**
   * Get a dari word given the id. Calls getWordWithData(query).
   * @param  {Integer} id [id of the dari word]
   * @return {Promise}    [Returns the word / error wraped in the promise.]
   */
  getWordWithData(id) {
    const query = `select o.serial, o.word, e.word as meaning,
                        o.ed, o.tr, o.ant, o.exm
                        from other as o join eng as e
                        where o.serial = ${id} and o.serial = e.serial`;

    return super.getWordWithData(query);
  }

  getWordnet(word) {
    return this.wordPos.lookup(word.meaning);
  }
}
