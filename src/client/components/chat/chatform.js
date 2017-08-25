import $ from 'jquery';

import { ElementComponent } from "../../lib/component";

import {Observable} from 'rxjs';

export class ChatFormComponent extends ElementComponent {
  constructor(userStore, chatStore) {
    super("div");
    this._users = userStore;
    this._chat = chatStore;
    this.$element.addClass("chat-form");
  }

  _onAttach() {
    this._$error = $(`<div class="chat-error" />`).appendTo(this.$element);
    this._$input = $(`<input type="text" class="chat-input" />`).appendTo(this.$element);



    // pushing unsubsribe() method into detach handlers when component dies
    this._users.currentUser$.compSub(this, user => {
      this._$input.attr("placeholder", user.isLoggedIn ? "" : "Enter a username");
    });


    Observable.fromEvent(this._$input, "keydown")
      .filter(e => e.keyCode === 13 /*enter*/)
      .do(e => e.preventDefault())
      .map(e => e.target.value.trim())
      .filter(e => e.length)

      // using results from another stream
      // gives us logged user
      .withLatestFrom(this._users.currentUser$)
      // flatMap stream (logged user or empty object as not logged in)
      .flatMap(([value, user]) => {
        if(!user.isLoggedIn)
          return this._login$(value);

        return this._sendMessage$(value);
      })

      // disp message turn error into consumable things, before
      // observable emit error and end stream
      .compSub(this, res => {
        if(res && res.error)
          this._$error.show().text(res.error.message);
        else {
          this._$error.hide();
        }
      });
  }

  // using store method to emit values to server API
  _sendMessage$(message) {
    return this._chat.sendMessage$(message).catchWrap()
      .do(() => this._$input.val(""));
  }

  // disable input -> login in with service -> reset input -> enale input
  _login$(username) {
    this._$input.attr("disabled", "disabled");
    return this._users.login$(username).catchWrap()
      .do(() => this._$input.val(""))
      .finally(() => {
        this._$input.attr("disabled", null);
        this._$input.focus();
      });
  }
}
