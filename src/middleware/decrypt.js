var ENCRYPTION_KEYS;

function enryptionKeys(password) {
  var keys = [];
  var buffer = new Buffer(password, "utf-8");
  for (var i = 0; i < buffer.length; i++) {
    keys.push(buffer[i]);
  }
  return keys;
}

export default ({ config }) => {
  ENCRYPTION_KEYS = enryptionKeys(config.secret.password);

  return function interceptResponse(req, res, next) {
    var send = res.send;
    res.send = function (string) {
      var body = string instanceof Buffer ? string.toString() : string;
      body = parseBody(JSON.parse(body));
      send.call(this, body);
    };
    next();
  };
};

function parseBody(body) {
  body.forEach(resObj => {
    // Go through response and get single obj
    if (Array.isArray(resObj)) {
      // If response is an Array of Arrays call this method recursively to get the object
      parseBody(resObj);
    }
    for (let prop in resObj) {
      // Get object props.
      if (resObj[prop] !== null && resObj[prop].type === "Buffer") {
        // if the object's prop is a buffer, decrypt it
        resObj[prop] = decrypt(resObj[prop]);
      }
    }
  });
  return JSON.stringify(body);
}

/**
 * This method takes a buffer object and decrypts the data by xor-ing the values with the password bytes.
 * @param  {[type]} body [Buffer Object]
 * @return {[type]}      [Array of Arrays]
 */
function decrypt(body) {
  var decryptedArr = [];

  for (var i = 0; i < body.data.length; i++) {
    decryptedArr[i] = ENCRYPTION_KEYS[i % ENCRYPTION_KEYS.length] ^ body.data[i];
  }
  var buffer = new Buffer(decryptedArr);
  return JSON.parse(buffer.toString("utf-8"));
}
