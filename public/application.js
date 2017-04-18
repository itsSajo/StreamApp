"use strict";

var socket = io();

const chatInput = document.querySelector(".chat-form input[type=text]");

chatInput.addEventListener("keypress", event => {
  // bail out from eventHandler
  if (event.keyCode !== 13)
    // // control back to the calling function
    return;

  event.preventDefault();

  const text = event.target.value.trim();
  if(text.length === 0)
    return;

  // this will invoke io handler on server
  socket.emit("chat:add", {
    message : text
  })

  event.target.value = "";
})

const chatList = document.querySelector(".chat-list ul");
socket.on("chat:added", data => {
  const msgElement = document.createElement("li");
  msgElement.innerText = data.message;
  chatList.appendChild(msgElement);
  // scrollTop is how much we are scrolled down
  // scrollHeight is overvall height of content
  chatList.scrollTop = chatList.scrollHeight;
})
