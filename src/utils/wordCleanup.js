export function turnToArray(str) {
  if (!str) {
    return str;
  }
  return removeSlashes(removeBrackets(str.toLowerCase())).split(",");
}

export function removeSlashes(str) {
  return str.replace(/\"/g, "");
}

export function removeBrackets(str) {
  return str.replace(/[\[\]]/g, "");
}

/**
 * Performs multiple data sanitation and if toString is set, converts the Array to String.
 * @param  {String} data [Data from the form.]
 * @param  {boolean} toString [Flag to show wether to convert the data to string]
 * @return {Data}    Return the data back as the string or the original form.
 */
export function sanitize(data, toString = false) {
  const seperator = getSeperator(data);
  if (!seperator) {
    return data;
  }
  data = data.split(seperator);
  data = data
    .filter(str => {
      return /^[a-zA-Z\u0600-\u06FF\\.\s]+$/.test(str);
    })
    .map(str => str.trim());

  if (toString) {
    return data.join(seperator);
  }
  return data;
}

function getSeperator(data) {
  if (data.includes("\n")) {
    return "\n";
  }
  if (data.includes(".")) {
    return ".";
  }
}

/**
 * This function replaces all instaces of %20 with -
 * @param  {[type]} str [description]
 * @return {[type]}     [description]
 */
export function hyphenateWord(str) {
  return str.replace(/\s|%20/g, "-").trim();
}

/**
 * This function removes all instaces of - with empty space.
 * @param  {[type]} str [description]
 * @return {[type]}     [description]
 */
export function dehyphenateWord(str) {
  return str.replace(/\-/g, " ").trim();
}

/**
 * Give the syn object, iterate until you reach the word and return the iterated word.
 * @param  {[type]} word [description]
 * @return {[type]}      [description]
 */
export function lowerCaseSyns(synonyms) {
  synonyms.forEach(synFamily => {
    synFamily.forEach(synGroup => {
      synGroup.en = synGroup.en.map(syn => {
        return syn.toLowerCase();
      });
    });
  });
  return synonyms;
}

export function lowerCaseWords(words) {
  return words.map(word => {
    word.word = word.word.toLowerCase();
    return word;
  });
}
