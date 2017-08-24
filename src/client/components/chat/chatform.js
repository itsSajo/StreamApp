import { ElementComponent } from "../../lib/component";

export class ChatFormComponent extends ElementComponent {
  constructor() {
    super("div");
    this.$element.addClass("chat-form");
  }
}
