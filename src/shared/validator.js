import { Observable } from 'rxjs';

// containing errors and messages with them
export class Validator {

  get isValid() { return !this._errors.length; }
  get errors() { return this._errors; }
  get message() { return this._errors.join(", "); }

  constructor() {
    this._errors = [];
  }

  error(message) {
    this._errors.push(message);
  }

  // returning erros with messages
  toObject() {
    if (this.isValid)
      return {};

    return {
      errors: this._errors,
      message: this.message
    };
  }

  //pushing erros msg into stream
  throw$() {
    // special property on error objects from ClientMessage Error emiter
    return Observable.throw({clientMessage: this.message});
  }
}
