const keyboardMap = [
    { "]": "چ" },
    { "[": "ج" },
    { "p": "ح" },
    { "o": "خ" },
    { "i": "ه" },
    { "u": "ع" },
    { "y": "غ" },
    { "t": "ف" },
    { "r": "ق" },
    { "e": "ث" },
    { "w": "ص" },
    { "q": "ص" },
    { "'": "گ" },
    { ";": "ک" },
    { "l": "م" },
    { "k": "ن" },
    { "j": "ت" },
    { "h": "ا" },
    { "g": "ل" },
    { "f": "ب" },
    { "d": "ی" },
    { "s": "س" },
    { "a": "ش" },
    { ",": "و" },
    { "m": "پ" },
    { "n": "د" },
    { "b": "ذ" },
    { "v": "ر" },
    { "c": "ز" },
    { "x": "ط" },
    { "z": "ظ" },
    { "1": "۱" },
    { "2": "۲" },
    { "3": "۳" },
    { "4": "۴" },
    { "5": "۵" },
    { "6": "۶" },
    { "7": "۷" },
    { "8": "۸" },
    { "9": "۹" },
    { "0": "۰" }
];

const shiftMap = [
    { "}": "{" },
    { "{": "}" },
    { "P": "[" },
    { "O": "]" },
    { "I": "ّ" },
    { "U": "َ" },
    { "Y": "ِ" },
    { "T": "ُ" },
    { "R": "ً" },
    { "E": "ٍ" },
    { "W": "ٌ" },
    { "Q": "ْ" },
    { "'": "؛" },
    { "L": "»" },
    { "K": "«" },
    { "J": "ة" },
    { "H": "آ" },
    { "G": "أ" },
    { "F": "إ" },
    { "D": "ي" },
    { "S": "ئ" },
    { "A": "ؤ" },
    { "?": "؟" },
    { "M": "ء" },
    { "N": "ٔ" },
    { "B": "" },
    { "V": "ٰ" },
    { "C": "ژ" },
    { "X": "ٓ" },
    { "Z": "ك" },
    { "@": "٬" },
    { "#": "٫" },
    { "$": "؋" },
    { "%": "٪" },
    { "^": "×" },
    { "&": "،" },
    { "(": ")" },
    { ")": "(" }
];

Array.prototype.concatAll = function() {
    var results = [];
    this.forEach(function(subArray) {
        results.push.apply(results, subArray);
    });

    return results;
};

/** Returns the Dari equavilent object or undefined if key is not in the array. **/
export function toDari(str, withShift) {
    if (withShift) {
        return convertToDari(str, shiftMap);
    }
    return convertToDari(str.toLowerCase(), keyboardMap);
}


function convertToDari(str, mappingArr) {
    str = Array.from(str);

    return str.map(char => {
        if (notInMappings(char, mappingArr)) {
            return [char];
        }

        return mappingArr.filter(mapChar => {
            return (char in mapChar);
        }).reduce((acc, curr) => {
            return [curr[char]];
        }, {});

    }).concatAll().join('');
}


function notInMappings(char, mappingArr) {
    return mappingArr.filter(mapChar => {
        return (char in mapChar);
    }).length <= 0;
}
