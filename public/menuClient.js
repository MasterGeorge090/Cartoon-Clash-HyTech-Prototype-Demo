const protocol = window.location.protocol === "https:" ? "wss" : "ws";
const ws = new WebSocket(`${protocol}://${window.location.host}`);

let rooms = [];
let totalRooms = [];
let roomElements = [];
let enteredRoom = false;
let currentRoomID;
let blacklistedRooms = [];
let isReady = false;
let currentAmountReady = 0;
let myID;
let sessionUsername = sessionStorage.getItem("username");
sessionStorage.clear();
setTimeout(function(){
if (sessionUsername)
{
  if (sessionUsername != "")
  {
    //alert(sessionUsername)
    sessionStorage.setItem("username", sessionUsername);
    sendMessage("submitUsername", { id:ws.id, name:sessionUsername });
    sendMessage("requestAvailableRooms", {});
    document.querySelector("#submitUsername").style.display = "none";
    document.querySelector("#serversList").style.display = "block";
    document.querySelector("#buttonsContainer").style.display = "block";
  }
}
},500)
ws.onopen = () => {
  console.log("Connected to the server");
};

ws.onmessage = (event) => {
  const { type, payload } = JSON.parse(event.data);
  handleWebSocketMessage(type, payload);
};

ws.onerror = (error) => {
  console.error("WebSocket error:", error);
};

ws.onclose = () => {
  window.location = "onlineLobby.html"
  console.log("Disconnected from the server");
};

function sendMessage(type, payload) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type, payload }));
  } else {
    console.error("WebSocket is not open. Message not sent:", type, payload);
  }
}

function submitUsername() {
  const username = document.querySelector("#enterUsername").value;
  if (username.length > 0 && !isWhitespaceString(username)) {
    sessionStorage.setItem("username", username);
    sendMessage("submitUsername", { id:ws.id, name:username });
    sendMessage("requestAvailableRooms", {});
    document.querySelector("#submitUsername").style.display = "none";
    document.querySelector("#serversList").style.display = "block";
    document.querySelector("#buttonsContainer").style.display = "block";
  } else {
    document.querySelector("#userError").textContent = "Please enter a username";
    document.querySelector("#userError").style.display = "block";
  }
}
addEventListener("keydown", function(event){
  if (event.isComposing || event.keyCode === 229 || !enteredRoom)
    {
      return;
    }
  if (event.keyCode === 13 && document.querySelector("#chatInput").value.length > 0 && !isWhitespaceString(document.querySelector("#chatInput").value))
  {
    
    sendMessage("submitMessage", { id:myID, message:document.querySelector("#chatInput").value });
    //socket.emit("submitMessage", socket.id, document.querySelector("#chatInput").value);
    document.querySelector("#chatInput").value = "";
  }
})
function leaveRoom() {
  //alert(currentRoomID);
  sendMessage("requestLeave", { roomID: currentRoomID});
  //resetRoomState();
}

function resetRoomState() {
  currentRoomID = "";
  enteredRoom = false;
  isReady = false;
  document.querySelector("#readyButton").textContent = "READY";
  document.querySelector("#serversList").style.display = "block";
  document.querySelector("#buttonsContainer").style.display = "block";
  document.querySelector("#playerWaitingMenu").style.display = "none";
}

function kickUser() {
  const reason = document.querySelector("#reasonInput").value || "Reason not stated.";
  const blacklist = document.querySelector("#blacklistCheckbox").checked;
  sendMessage("requestKick", { roomID: currentRoomID, reason, blacklisted: blacklist });
  
}

function imReady() {
  isReady = !isReady;
  const buttonElement = document.querySelector("#readyButton");
  buttonElement.textContent = isReady ? "UNREADY" : "READY";
  sendMessage("readyClick", { roomID: currentRoomID, isReady });
  
}

function joinPrivateRoom() {
  const code = document.querySelector("#codeInput").value;
  if (!totalRooms.some((room) => room.gameID === code)) {
    document.querySelector("#joinError").style.display = "block";
  } else {
    document.querySelector("#joinError").style.display = "none";
    joinRoom(code);
  }
}

function joinRoom(id) {
  if (blacklistedRooms.includes(id)) {
    document.querySelector("#blacklistedError").style.display = "flex";
  } else {
    //alert(blacklistedRooms);
    sendMessage("joinRoom", { roomID: id });
    sendMessage("requestRoomData", { roomID: id });
    enteredRoom = true;
    currentRoomID = id;
     document.querySelector("#createRoom").style.display = "none";
  document.querySelector('#joinRoom').style.display = "none";
    document.querySelector("#readyButton").setAttribute("class", "daButton verticalCenter  disabled");
    updateUIForRoomJoin(id);
    if (Math.random > 0.5)
  {
  FetchMaleCategory();
  }
  else
  {
    FetchFemaleCategory();
  }
  }
}

function updateUIForRoomJoin(id) {
  document.querySelector("#playerWaitingMenu").style.display = "block";
  resetChatLog();
  document.querySelector("#serversList").style.display = "none";
  document.querySelector("#buttonsContainer").style.display = "none";
  document.querySelector("#roomCode").textContent = `Game Code: ${id}`;
}

function createRoom() {
  sendMessage("createRoom", { isPrivate: document.querySelector("#isPrivate").checked });
  enteredRoom = true;
  resetChatLog();
  document.querySelector("#serversList").style.display = "none";
  document.querySelector("#buttonsContainer").style.display = "none";
  document.querySelector("#createRoom").style.display = "none";
  document.querySelector('#joinRoom').style.display = "none";
  document.querySelector("#readyButton").setAttribute("class", "daButton verticalCenter disabled");
  document.querySelector("#playerWaitingMenu").style.display = "block";
  if (Math.random > 0.5)
  {
  FetchMaleCategory();
  }
  else
  {
    FetchFemaleCategory();
  }
  setTimeout(function(){
    for (let i in rooms)
  {
    //alert(rooms[i].player1ID + ", " + ws.id)
    if (rooms[i].player1ID == myID)
    {
    currentRoomID = rooms[i].gameID;
      updateUIForRoomJoin(currentRoomID);
    //alert(currentRoomID)
    }
  }
  },100);
}

function resetChatLog() {
  document.querySelectorAll("#messageLog").forEach((log) => log.remove());
}

function updateRoomsList() {
  roomElements.forEach((element) => element.remove());
  roomElements = [];

  for (let i in rooms)
  {
    const roomElement = createRoomElement(rooms[i]);
    roomElements.push(roomElement);
    document.querySelector("#serversList").appendChild(roomElement);
  }
  
}

function createRoomElement(room) {
  const element = document.querySelector("#listTemplate").cloneNode(true);
  element.setAttribute("id", "room");
  element.style.display = "block";
  element.querySelector("#roomName").textContent = room.player1Username;
  element.querySelector("#slots").textContent = `${room.numUsers}/2`;
  element.querySelector("#joinButton").setAttribute("onclick", `joinRoom("${room.gameID}")`);
  return element;
}

function handleWebSocketMessage(type, payload) {
  switch (type) {
    case "blacklisted":
      //alert(payload.roomCode);
      blacklistedRooms.push(payload.roomCode);
      break;
    case "finishLeave":
      //alert("daGame")
      resetRoomState();
    break;
    case "initGame":
      initGame(payload.data, payload.apiData);
      break;
    case "updateReadyCount":
      updateReadyCount(payload.amount);
      break;
    case "kick":
      let kickedRoomID = currentRoomID;
      handleKick(payload.reason)
      break;
    case "returnID":
      myID = payload.id;
      break;
    case "returnRooms":
      rooms = payload.rooms;
      totalRooms = payload.totalRooms;
      console.log(rooms);
      updateRoomsList();
      break;
    case "returnRoomRequest":
      currentRoomID = payload.room.gameID;
      if (payload.room.player1ID)
           {
             if (payload.room.playerID != "")
              {
                document.querySelector("#player1Name").textContent = `Player 1: ${payload.room.player1Username}`
              }
           }
          if (payload.room.player2ID)
           {
             if (payload.room.player2D != "")
              {
                document.querySelector("#player2Name").textContent = `Player 2: ${payload.room.player2Username}`
                if (payload.room.player1ID == myID)
                 {
                   document.querySelector("#kickButton").style.display = "block";
                 }
              }
           }
      else
        {
                document.querySelector("#player2Name").textContent = `Player 2: Waiting...`                    
                document.querySelector("#kickButton").style.display = "none";
        }
      break;
    case "updateMessageLog":
      //console(payload.message)
      updateMessageLog(payload.message, payload.isSystemMessage);
      break;
    case "updateMessageLogByList":
      updateMessageLogByList(payload.messageLog);
      break;
    // Add other cases as needed
    default:
      console.log("Unknown message type:", type);
  }
}

function updateMessageLogByList(messageLog){
  resetChatLog();
  for (let i in messageLog)
  {
    updateMessageLog(messageLog[i][0], messageLog[i][1]);
  }
}

function initGame(data, apiData) {
  sessionStorage.setItem("currentRoomID", data.gameID);
  const playerNumber = data.player1ID === myID ? 1 : 2;
  sessionStorage.setItem("playerNumber", playerNumber);
  sessionStorage.setItem("fighterDetails", JSON.stringify(apiData))
  window.location = "multiplayer.html";
}

function updateReadyCount(amount) {
  currentAmountReady = amount;
  //alert(amount);
  document.querySelector("#readyText").textContent = `${amount}/2 Ready`;
}

function handleKick(reason) {
  resetRoomState();
  document.querySelector("#kickReason").textContent = `REASON: ${reason}`;
  document.querySelector("#kickedOut").style.display = "flex";
}

function updateMessageLog(message, isSystemMessage) {
  const element = document.querySelector("#messageLogToClone").cloneNode(true);
  element.setAttribute("id", "messageLog");
  element.textContent = message;
  element.style.display = "block";
  element.style.color = isSystemMessage ? "yellow" : "white";
  document.querySelector("#chatBox").appendChild(element);
}

function isWhitespaceString(str) {
  return !str.trim().length;
}

function enableReadyButton(){
  document.querySelector("#readyButton").setAttribute("class", "daButton verticalCenter");
}