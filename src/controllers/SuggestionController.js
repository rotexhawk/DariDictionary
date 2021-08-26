import clientError from "../utils/errors";
import { sanitize } from "../utils/wordCleanup";

export default class SuggestionController {
  constructor(model) {
    this.model = model;
  }

  addSuggestions(data) {
    this.testForRequiredFields(data);
    return this.filterSuggestions(data);
  }

  testForRequiredFields(data) {
    if (!data.serial || isNaN(data.serial)) {
      throw new clientError(422, "Please provide a serial number.");
    }
    if (!data.field || data.field.length === 0) {
      throw new clientError(422, "Please specify the suggestion type/field.");
    }
    if (!data.suggestions || data.suggestions.length === 0) {
      throw new clientError(422, "Please type at least one suggestion.");
    }
    if (!data.word || data.word.length === 0) {
      throw new clientError(422, "Please specify the word.");
    }
  }

  /**
   * Need a better name for this. Basically we are checking the field and calling the right method.
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
   */
  filterSuggestions(data) {
    if (data.field === "antonym") {
      return this.addAntonyms(data);
    }
    if (data.field === "example") {
      return this.addExamples(data);
    }
    if (data.field === "synonym") {
      return this.addSynonyms(data);
    }
  }

  addAntonyms(data) {
    return this.model.addSuggestions(
      "antonyms",
      data.serial,
      data.word,
      sanitize(data.suggestions)
    );
  }

  addExamples(data) {
    return this.model.addSuggestions(
      "examples",
      data.serial,
      data.word,
      sanitize(data.suggestions)
    );
  }

  addSynonyms(data) {
    return this.model.addSuggestions(
      "synonyms",
      data.serial,
      data.word,
      sanitize(data.suggestions)
    );
  }

  getWordById(id) {
    return this.model.getWordById(id);
  }
}
