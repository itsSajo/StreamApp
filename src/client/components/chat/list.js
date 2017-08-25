import { ElementComponent } from "../../lib/component";
import moment from "moment";

import { Observable } from 'rxjs';

import $ from "jquery";

export class ChatListComponent extends ElementComponent {
  constructor(usersStore, chatStore, server) {
    super("ul");
    this._users = usersStore;
    this._chat = chatStore;
    this._server = server;
    this.$element.addClass("chat-messages");
  }

  // subscribe to streams and get messaes to append them to DOM element

  // whatever they stream we gonna use values from emited steam to append
  
  _onAttach() {
    Observable.merge(
      this._chat.messages$.map(chatMessageFactory),
      this._users.state$.map(userActionFactory),
      this._server.status$.map(serverStatusFactory))
      // returning those elements
      .filter(m => m)
      // new created elements
      .compSub(this, $newElement => {
        this.$element.append($newElement);

        // scroll from the top of element to bottom (scrollHeight receive max content height)
        this.$element[0].scrollTop = this.$element[0].scrollHeight;
      });
  }
}

// when user joins or left append DOM element with status
function userActionFactory({ type, user}) {
  console.log(type);
  if (type !== "add" && type !== "remove")
    return null;

  return $(`<li class="user-action ${type}" />`).append([
    $(`<span class="author" />`).text(user.name).css("color", user.color),
    $(`<span class="message " />`).text(type === "add" ? "Joined" : "left"),
    $(`<time />`).text(moment().format("h:mm:ss a"))
  ]);
}

function serverStatusFactory({ isConnected, isReconnecting, attempt}) {
  let statusMessage = null;
  if( isConnected) statusMessage = "connected";
  else if (isReconnecting) statusMessage = `reconnecting (attempt ${attempt})`;
  else statusMessage = "gg. it's over now";

  if(statusMessage == null)
    return null;

  return $(`<li class="server-status" />`).append([
    $(`<span class="author" />`).text("system"),
    $(`<span class="message" />`).text(statusMessage),
    $(`<time />`).text(moment().format("h:mm:ss a"))
  ]);

}

// factory for creating li with details from user object
function chatMessageFactory({user, message, type, time}) {
  return $(`<li class="message ${type}" />`)
    .data("user", user.name)
    .append([
      $(`<span class="author" />`).text(user.name).css("color", user.color),
      $(`<span class="message" />`).text(message),
      $(`<time />`).text(moment(time).format("h:mm:ss a"))
    ]);
}
