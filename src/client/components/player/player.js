import { ElementComponent } from "../../lib/component";
import $ from 'jquery';

import "./player.scss";

// component only manipulate mount node (fe: section .player)
// or element created by the ElementComponent !!!!!!!!!!!
// HMR wont dispoe other bits of manipulated dom other than self-contained comps
export class PlayerComponent extends ElementComponent {

  constructor() {
    // base and element props intancieted
    super();
  }

  // override method
  _onAttach() {
    const $title = this._$mount.find("h1");
    $title.text("Player!");
  }

}

let  component;

// trying to attach, if something wrong then detach
try {
  component = new PlayerComponent();
  component.attach($("section.player"));
} catch(e) {
  console.error(e);
  if (component)
    component.detach();
}
finally {
  // if HMR is enabled then accept this module, and dispose old modules
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => component && component.detach());
  }
}
