import Word from "./Word";
import { dehyphenateWord } from "../utils/wordCleanup";

export default class EnglishWord extends Word {
  constructor(db, writeDB) {
    super(db, writeDB);
    this.db = db;
  }

  /**
   * [Get a list of words from 1 to limit. Currently hard coded to 60]
   * @param  {String} table [English words are saved in eng]
   * @return {[Promise]}
   */
  getWords(limit = 60) {
    const query = `SELECT serial,word FROM eng LIMIT ${limit}`;
    return super.getWords(query);
  }

  /**
   * Get a specific word based on id.
   * @param  {[int]} id    [id of the word to be retrieved]
   * @param  {String} table [The name of the table.]
   * @return {[Promise]}
   */
  getWordById(id) {
    return super.getWordById(id, "eng");
  }

  /**
   * Get a word by string.
   * @param  {string} string [word to search for.]
   * @param  {String} table  [the table to search in.]
   * @return {PROMISE}        [return promise containing the word that matches the query.]
   */
  getWordByString(string) {
    const query = `SELECT serial, word from eng WHERE(word like '${string}' or word = '${dehyphenateWord(
      string
    )}')`;
    return super.getWord(query);
  }

  /**
   * Get the english word given the id for it. This method makes the query and calls getWordWithData(query).
   * @param  {Integer} id [id of the english word.]
   * @return {Promise}    [Returns the same promise as the getWordWithData()].
   */
  getWordWithData(id) {
    const query = `select e.serial, e.word,
                        o.word as meaning, o.ed, o.tr, o.ant, o.exm
                        from eng as e join other as o
                        where e.serial = ${id} and e.serial = o.serial`;

    return super.getWordWithData(query);
  }

  getSynonynms(buffer) {
    return super.getSynonynms(buffer);
  }

  /**
   * Gets a list of word matching the word or character. Usefull for auto suggestions.
   * @param  {String} typedWord [the word/character to find matches for.]
   * @return {PROMISE}           [Return a promise containing the list of words matching the query.]
   */
  getAutoSuggestions(typedWord) {
    const query = super.formatString(
      `SELECT distinct serial,word FROM eng WHERE word LIKE '%@s%'
                            ORDER BY CASE
                                WHEN word LIKE '@s%' THEN 1
                                WHEN word LIKE '%@s' THEN 3
                                ELSE 2
                            END LIMIT 10`,
      typedWord
    );
    return super.getWords(query);
  }

  /**
   * Gets the word of the day (english). Makes sure it is a word that has synonyms and meaning.
   * @return {Promise} [Promise to return an word or error if nothing found.]
   */
  getWordOfDay() {
    let query = `SELECT serial FROM other WHERE  (( ed IS NOT NULL) AND (ant is NOT NULL)) ORDER BY RANDOM() LIMIT 1`;
    return super.getWord(query).then(word => {
      return this.getWordWithData(word.serial).then(wordwithdata => {
        return super.getWordWithDataAndSynonyms(wordwithdata);
      });
    });
  }
}
