export default function clientError(status, message = 'Bad Data.') {
    this.name = 'Client Error';
    this.message = message;
    this.stack = (new Error()).stack;
    let _arrStack = this.stack.split('\n');
    _arrStack.splice(1, 1); // remove this class from the top of stack trace so we can go straight to the source of the issue.
    _arrStack = _arrStack.join('\n');
    this.stack = _arrStack;
    this.status = status;
}

clientError.prototype = Object.create(Error.prototype);
clientError.prototype.constructor = clientError;
