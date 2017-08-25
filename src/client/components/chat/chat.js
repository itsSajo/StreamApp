import { ComponentBase } from "../../lib/component";
import $ from 'jquery';

import "./chat.scss";

import { usersStore, chatStore, server } from "../../services";

import { ChatListComponent } from "./list";
import { ChatFormComponent } from "./chatform";

// Base becaue we have nested components
class ChatComponent extends ComponentBase {

  constructor(usersStore, chatStore, server) {
    super();
    this._users = usersStore;
    this._chat = chatStore;
    this._server = server;
  }

  _onAttach() {
    const $title = this._$mount.find(" > h1");
    $title.text("Chat");

    // appending children elements to parent section element

    // instantiate the chatlist component and inject usersStore
    const list = new ChatListComponent(this._users, this._chat, this._server);
    list.attach(this._$mount);
    this.children.push(list);

    const form = new ChatFormComponent(this._users, this._chat);
    form.attach(this._$mount);
    this.children.push(form);

  }

}
// HMR will bubble up from child components to find HMR accept
let component;
try {
  // injecting services so we can inject into his children
  component = new ChatComponent(usersStore, chatStore, server);
  component.attach($("section.chat"));
} catch (e) {
  console.error(e);
  if(component)
    component.detach();
}
finally {
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => component && component.detach() );
  }
}
