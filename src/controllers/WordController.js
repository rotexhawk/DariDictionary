export default class WordController {
  constructor(model) {
    this.model = model;
  }

  getWords(limit = 60) {
    return this.model.getWords(limit);
  }

  getWordWithDetailsByString(param) {
    return this.model.getWordByString(param).then(word => {
      return this._getWordWithData(word.serial);
    });
  }

  getWordWithDetailsById(serial) {
    return this._getWordWithData(serial);
  }

  _getWordWithData(serial) {
    return this.model
      .getWordWithData(serial)
      .then(wordWithData => {
        return this.model.getWordWithDataAndSynonyms(wordWithData);
      })
      .then(wordWithDataAndSyns => {
        return this.model.getWordnet(wordWithDataAndSyns).then(wordnet => {
          wordWithDataAndSyns.wordnet = wordnet;
          return wordWithDataAndSyns;
        });
      });
  }

  getAutoSuggestions(param) {
    return this.model.getAutoSuggestions(param);
  }

  /** Applies to only English Word Model.  */
  getWordOfDay() {
    return this.model.getWordOfDay().then(word => {
      return this.model.getWordnet(word).then(wordnet => {
        word.wordnet = wordnet;

        return word;
      });
    });
  }

  /** Applies to only Dari Word model */
  getWordForTranslation() {
    return this.model.getWordForTranslation();
  }
}
