import {Observable} from 'rxjs';

import {validateSendMessage } from 'shared/validation/chat';

export class ChatStore {

  constructor(server, userStore) {
    this._server = server;
    this._users = userStore;

    // making observable stream of msg from invidual items of list
    this.messages$ = Observable.merge(
      // chatLog received
      server.on$("chat:list").flatMap(list => {
        console.log(list);
        return Observable.from(list);}),
      server.on$("chat:added"))
      .publishReplay(100);

    // hot observable
    this.messages$.connect();

    server.on$("connect")
    // request chat list only
      .first()
      .subscribe(() => server.emit("chat:list"));
  }

  sendMessage$(message, type = "normal") {
    const validator = validateSendMessage(this._users.currentUser, message, type);

    if (!validator.isValid)
      return Observable.throw({ message: validator.message });

      // deconstruct
    return this._server.emitAction$("chat:add", { message, type });
  }




}
