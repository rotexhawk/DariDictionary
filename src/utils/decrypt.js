const ENCRYPTION_KEYS = enryptionKeys();

function enryptionKeys() {
    const PASSWORD = 'passwordhere';
    var passwordBytes = [];
    var buffer = new Buffer(PASSWORD, 'utf-8');
    for (var i = 0; i < buffer.length; i++) {
        passwordBytes.push(buffer[i]);
    }
    return passwordBytes;
}

function decrypt(input) {
    if (Array.isArray(input)) {
        return decryptArray(input);
    }
    if (Buffer.isBuffer(input)) {
        return decryptBuffer(input);
    }
    return input;
}

function decryptBuffer(buffer) {
    if (buffer === null) {
        return buffer;
    }

    var decryptedArr = [];

    for (var i = 0; i < buffer.length; i++) {
        decryptedArr[i] =
            ENCRYPTION_KEYS[i % ENCRYPTION_KEYS.length] ^ buffer[i];
    }
    const returnBuffer = new Buffer(decryptedArr);

    return JSON.parse(returnBuffer.toString('utf-8'));
}

function decryptArray(array) {
    array.forEach(word => {
        for (var prop in word) {
            if (Buffer.isBuffer(word[prop])) {
                word[prop] = decryptBuffer(word[prop]);
            }
        }
    });
    return array;
}

module.exports = decrypt;
