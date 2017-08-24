import { ComponentBase } from "../../lib/component";
import $ from 'jquery';

import "./chat.scss";

import { ChatListComponent } from "./list";
import { ChatFormComponent } from "./chatform";

// Base becaue we have nested components
class ChatComponent extends ComponentBase {

  constructor() {
    super();

  }

  _onAttach() {
    const $title = this._$mount.find(" > h1");
    $title.text("Chat");

    // appending children elements to parent section element
    const list = new ChatListComponent();
    list.attach(this._$mount);
    this.children.push(list);

    const form = new ChatFormComponent();
    form.attach(this._$mount);
    this.children.push(form);
  }

}
// HMR will bubble up from child components to find HMR accept
let component;
try {
  component = new ChatComponent();
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
