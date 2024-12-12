const protocol = window.location.protocol === "https:" ? "wss" : "ws";
const ws = new WebSocket(`${protocol}://${window.location.host}`);
let characterReady = false;
class Fighter{
  constructor(name, images, speed,attack,defense,moveset, health, abilities, isCPU, playedByYou, element,x, y, velocityX, velocityY,jumpPower,acceleration)
  {
    this.name = name; //string
    this.images = images; //array of urls
    this.speed = speed; //number
    this.attack = attack; //number
    this.defense = defense; //number
    this.moveset = moveset; //array string
    this.health = health; //number
    this.abilities = abilities; //array string
    this.isCPU = isCPU; //bool
    this.playedByYou = playedByYou; //bool
    this.element = element;
    this.x = x; //number
    this.y = y; //number
    this.velocityX = velocityX; //number
    this.velocityY = velocityY; //number
    this.unaffectedVelocityX = 0;
    this.unaffectedVelocityY = 0;
    this.knockBackX = 0;
    this.knockBackY = 0;
    this.jumpPower = jumpPower; //number
    this.acceleration = acceleration; //number
    this.stunned = false; //bool
    this.inputs = []; //string array
    this.isJumping = false;
    this.direction = 1;
    this.punchCooldown = 2.5;
    this.currentPunchCooldown = this.punchCooldown;
    this.runSpeed = speed+30;
    this.defaultSpeed = speed;
    this.maxHealth = health;
    this.hitbox;
    this.fistStrikingAngle = 0;
    this.username = "";
    this.shieldHealth = 22;
    this.shieldCooldown = 0;
    this.flyTimeLimit = 50;
    this.laserCooldown = 15;
    this.iceBreathCooldown = 0;
    this.iceHealth = 20;
    this.frozen = false;
    
    //CPU MECHANISMS
    this.threatenedIntensity = 0;
    this.cornered = false;
    this.threatened = false;
    this.selfDefenseMode = false;
    this.selfDefenseTerm = 100;
    //this.fist;
    
    this.dead = false;
    this.walkingSound = new Audio("https://cdn.glitch.global/5dc85c69-4523-4b77-a54c-c3bf09afefaf/FootstepLoop.wav?v=1731977866017");
    this.jumpSound = new Audio("https://cdn.glitch.global/5dc85c69-4523-4b77-a54c-c3bf09afefaf/Jump.mp3?v=1732037087905");
    this.punchSound = new Audio("https://cdn.glitch.global/5dc85c69-4523-4b77-a54c-c3bf09afefaf/Punch.mp3?v=1732037088878");
    this.shieldDamageAudio = [new Audio("https://cdn.glitch.global/8682bce0-587a-4e77-b4f1-d6bfb8e7389c/wood1.ogg?v=1733362769326"), new Audio("https://cdn.glitch.global/8682bce0-587a-4e77-b4f1-d6bfb8e7389c/wood2.ogg?v=1733362763537"), new Audio("https://cdn.glitch.global/8682bce0-587a-4e77-b4f1-d6bfb8e7389c/wood3.ogg?v=1733362761430"), new Audio("https://cdn.glitch.global/8682bce0-587a-4e77-b4f1-d6bfb8e7389c/wood4.ogg?v=1733362757506")]
    this.shieldBreakAudio = new Audio("https://cdn.glitch.global/8682bce0-587a-4e77-b4f1-d6bfb8e7389c/woodbreak.ogg?v=1733362769326")
  }
  
}
class Laser{
  constructor(ownerNumber, velocityX, velocityY, x, y, angle, isIceBreath)
  {
    this.ownerNumber = ownerNumber;
    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.element;
    this.aliveTime = 10;
    this.isIceBreath = isIceBreath;
  }
}
let lasers= [];
function CreateLaser(ownerNumber, x, y, velocityX, velocityY, angle, isIceBreath)
{
  let laserClass = new Laser(ownerNumber,velocityX,velocityY,x,y, angle, isIceBreath)
  new Audio("https://cdn.glitch.global/8682bce0-587a-4e77-b4f1-d6bfb8e7389c/Lasers%202.wav?v=1733783888337").play();
  
  let laserElement = document.createElement("img");
  if (isIceBreath)
  {
    laserElement.setAttribute("src", "https://cdn.glitch.global/8682bce0-587a-4e77-b4f1-d6bfb8e7389c/IceBreath.png?v=1733442348227");
    laserElement.setAttribute("style", `position:absolute; background-color:clear; width:50px; height:50px; bottom:calc(${players[ownerNumber].element.style.bottom} + 50px); left:${players[ownerNumber].element.style.left};`);
  }
  else
  {  
    laserElement.setAttribute("src", "https://cdn.glitch.global/8682bce0-587a-4e77-b4f1-d6bfb8e7389c/b3e3d6be-7ae7-4784-a9c9-158f1d8ce31b.image.png?v=1733410613758");
    laserElement.setAttribute("style", `position:absolute; background-color:clear; width:150px; height:150px; bottom:${players[ownerNumber].element.style.bottom}; left:${players[ownerNumber].element.style.left};`);
  } 
  //laserElement.setAttribute("style", `position:absolute; background-color:clear; width:150px; height:150px; bottom:${owner.element.style.bottom}; left:${owner.element.style.left};`);
  laserClass.element = laserElement;
  stageDiv.appendChild(laserElement);
  laserElement.style.transform = `translateX(${x}px) translateY(${y}px) rotate(${angle * (180/Math.PI)}deg)`;
  lasers.push(laserClass);
}
let backToTitle = false;
let ready = false;
let myNumber = -1;
let myID;
//alert("running")

let currentRoomID = sessionStorage.getItem("currentRoomID");
let playerNumber = sessionStorage.getItem("playerNumber")
let fighterDetails = sessionStorage.getItem("fighterDetails")
//alert(currentRoomID + ", " + playerNumber)
//document.querySelector("#readyText").textContent = currentRoomID + ", " + playerNumber;

      //var socket = io();
let decodedFighterDetails = JSON.parse(fighterDetails);
document.querySelector("#player1VSIMG").setAttribute("src", decodedFighterDetails.player1.image.split("/rev")[0]);
document.querySelector("#player2VSIMG").setAttribute("src", decodedFighterDetails.player2.image.split("/rev")[0]);
document.querySelector("#player1VSText").textContent =  decodedFighterDetails.player1.name.split("(")[0];
document.querySelector("#player2VSText").textContent = decodedFighterDetails.player2.name.split("(")[0];

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
ws.send(JSON.stringify({type:"requestPlayerDamage", payload:{roomID:currentRoomID, number: myNumber, damage:yourPlayer.maxHealth*5, shielded:false}}))
  console.log("Disconnected from the server");
};

function goToLobby()
{
  let currentTime = 0;
  setInterval(function(){
    currentTime += 1/240;
    document.querySelector("#fadeToBlack").style.display = "block";
    document.querySelector("#fadeToBlack").style.opacity = `${Math.min(currentTime,1)*100}%`;    
    if (document.querySelector("#fadeToBlack").style.opacity >= 1)
    {
      document.querySelector("#loadingScreen").style.display = "block";
    }
    
  }, 0)
  setTimeout(function(){
      window.location = "onlineLobby.html";
    },5000)
}
function handleWebSocketMessage(type, payload) {
  switch(type){
    case "returnPlayerNumber":
    
    returnPlayerNumber(ws,payload);
    break;
    case "playJumpSound":
      new Audio("https://cdn.glitch.global/5dc85c69-4523-4b77-a54c-c3bf09afefaf/Jump.mp3?v=1732037087905").play();
    break;
    case "returnData":
    for (let i in players){
      players[i].inputs = payload.data[i];
    }
    break;
    case "disconnectMessage":
    document.querySelector("#disconnectText").textContent = payload.msg;
    document.querySelector("#disconnectText").style.display = "block";
    break;
    case "returnInputs":
    for (let i in players){
      players[i].inputs = payload.data[i];
    }
    break;
    case "returnSocketID":
    myID = payload.id;
    break;
    case "punch":
    punch(ws, payload);
    break;
    case "updatePlayerInfo":
    updatePlayerInfo(ws, payload);
    break;
    case "updateLaserInfo":
    updatePlayerInfo(ws, payload);
    break;
    case "beginGame":
    beginDaGame();
    break;
      case "returnBG":
    document.querySelector(".frame").style.backgroundImage= `url(${payload.src.split("/revis")[0]})`;
    break;
    case "returnUsername":
    for (let i in players){
      players[i].username = payload.username[i];
      let daUsernameElement = document.createElement("p");
      daUsernameElement.style = `opacity: 1; text-align: start; position: absolute; -webkit-text-stroke: 1px black; color: white; font-size: 25px; font-weight: bold; transform: scaleX(1) translate(-50%); bottom:100%; left:${players[i].element.width/2}px; text-wrap:nowrap`;
      daUsernameElement.textContent = players[i].username;
      daUsernameElement.setAttribute("id", "usertag")
      players[i].hitbox.appendChild(daUsernameElement);
    }
    break;
    case "createLaser":
    CreateLaser(payload.ownerNumber, payload.x, payload.y, payload.velocityX, payload.velocityY, payload.angle, payload.isIceBreath)
    break;
  }
}

function punch (ws, {number, type}){
          //alert(`Player 0: ${players[0]}, Player 1: ${players[1]}`);
          let daPlayer = players[number];
          //for (let i = 0; i < players.length; i++)
          //{
          //  let daNumber = i+1;
          //  alert(`Player ${daNumber}: ${players[i].name}`)
          //}
          switch (type)
          {
            case "forward":
              //alert(`${daPlayer.name} punched forward`);
              fistFrame = 15;
              currentFistPos = 0;
              requestAnimationFrame(function() { animateFist(daPlayer, "forward");})
              
              //daPlayer.inputs.splice(daPlayer.indexOf("punch-forward"), 1);

            break;
            case "uppercut":
              fistFrame = 15;
              currentFistPos = 0;
              requestAnimationFrame(function() { animateFist(daPlayer, "uppercut");})
              //alert(`${daPlayer.name} punched upwards`);
              //daPlayer.inputs.splice(daPlayer.indexOf("punch-uppercut"), 1);
              break;
          }
        }
        
         function updatePlayerInfo(ws, {data}){
          for (let i in data)
           {
             players[i].health = data[i].health;
             players[i].speed = data[i].speed;
             players[i].attack = data[i].attack;
             players[i].defense = data[i].defense;
             players[i].x = data[i].x;
             players[i].y = data[i].y;
             players[i].velocityX = data[i].velocityX;
             players[i].velocityY = data[i].velocityY;
             players[i].unaffectedVelocityX = data[i].unaffectedVelocityX;
             players[i].unaffectedVelocityY = data[i].unaffectedVelocityY;
             players[i].knockBackX = data[i].knockBackX;
             players[i].knockBackY = data[i].knockBackY;
             players[i].jumpPower = data[i].jumpPower;
             players[i].acceleration = data[i].acceleration;
             players[i].stunned = data[i].stunned;
             players[i].direction = data[i].direction;
             players[i].shieldHealth = data[i].shieldHealth;
             players[i].shieldCooldown = data[i].shieldCooldown;
             players[i].flyTimeLimit = data[i].flyTimeLimit;
             players[i].laserCooldown = data[i].laserCooldown;
             players[i].iceBreathCooldown = data[i].iceBreathCooldown;
             players[i].iceHealth = data[i].iceHealth;
             players[i].frozen = data[i].frozen;
             //players[i].punchCooldown = data[i].punchCooldown;
             //players[i].currentPunchCooldown = data[i].currentPunchCooldown;
             
             players[i].inputs = data[i].inputs;
           }
        }
        function updateLaserInfo(ws, {data}){
          for (let i in data)
           {
             lasers[i].x = data[i].x;
             lasers[i].y = data[i].y;
             lasers[i].angle = data[i].angle;
           }
        }
function beginDaGame(){
          //alert('sillybily')
          if (!startedCountdown)
          {
            
          startedCountdown = true;
            let musicDetails = JSON.parse(fighterDetails);
            backgroundMusic.src = musicDetails.musicSrc;
            backgroundMusic.play();
    let ready = new Audio("https://cdn.glitch.global/5dc85c69-4523-4b77-a54c-c3bf09afefaf/Ready.wav?v=1731982303112");
    let go = new Audio("https://cdn.glitch.global/5dc85c69-4523-4b77-a54c-c3bf09afefaf/Go.wav?v=1731982302914");
    let announcerUI = document.querySelector("#announcerText");
    //backgroundMusic.play();
    document.querySelector("#title").style.display = "none";
    document.querySelector("#songCredits").style.animation = "songLabel 5s forwards ease";
    unPause = true;
    setTimeout(function (){announcerUI.setAttribute("src", "https://cdn.glitch.global/5dc85c69-4523-4b77-a54c-c3bf09afefaf/Ready.png?v=1731982302677"); ready.play()}, 500);
    setTimeout(function (){announcerUI.setAttribute("src", "https://cdn.glitch.global/5dc85c69-4523-4b77-a54c-c3bf09afefaf/Go.png?v=1731982303077"); go.play()}, 2500);
    setTimeout(function (){beginGame = true; announcerUI.setAttribute("src", "")}, 3000);
          }
        }
// myID = socket.id
      //socket.on('message', function(data){alert(data)});

//socket.emit("setGameRoomPlayerID", currentRoomID, playerNumber);
  //socket.emit("needPlayerNumber");
setTimeout(function(){
  ws.send(JSON.stringify({type:"setGameRoomPlayerID", payload: {roomID: currentRoomID, playerNumber: playerNumber}}))
ws.send(JSON.stringify({type:"needPlayerNumber", payload:{}}))
}, 750)

//alert('teee')
//setTimeout(function(){myID = socket.id},1000)
/*setTimeout(function(){
  //alert("pisser")
  myID = socket.id;
  
  socket.join(currentRoomID)
  socket.emit("requestRoomsList", socket.id)
  socket.on("returnRoomsList", function(data){
    let shouldCreateRoom = true;
    for (let i in data)
    {
      //alert('fuck')
      if (data[i].numUsers < 2)
        {
          socket.emit("joinRoom", data[i].gameID, socket.id)
          currentRoom = data[i];
          shouldCreateRoom = false;
        }
    }
    if (shouldCreateRoom)
    {
      alert('fuck2')
      socket.emit("createRoom", socket.id);
    }
  })
}, 1000)
  
socket.on("error", function(message){
  alert(message);
})
socket.on("kick", function(reason){
  alert(`You've been kicked out of ${currentRoom.player1ID}'s room for the following reason: ${reason}`);
  socket.leave()
  currentRoom = null;
});*/
let bgSrc;
if (JSON.parse(fighterDetails).player1.name.split("(").length>1 && !JSON.parse(fighterDetails).player1.name.includes("character"))
{
  setBGtoIMGNoSearch(JSON.parse(fighterDetails).player1.name.split("(")[1].split(")")[0]);
  
}
if (JSON.parse(fighterDetails).player2.name.split("(").length>1 && !JSON.parse(fighterDetails).player2.name.includes("character"))
{
  setBGtoIMGNoSearch(JSON.parse(fighterDetails).player2.name.split("(")[1].split(")")[0]);
  
}
else
  {
setBGtoIMG(JSON.parse(fighterDetails).player1.name)
  }
        if (document.querySelector(".frame").style.backgroundImage == 'url("undefined")')
        {
setBGtoIMG(JSON.parse(fighterDetails).player2.name)
            
            }
async function setBGtoIMG(name)
{
  let response;
  let responseJson;
  try{
    response = await fetch(`https://cartoon-clash-scraper-api.glitch.me/background?character=${name}`)
    responseJson = await response.json();
  }catch(err){
    alert(err);
    return;
  }finally{
    let foundImage = false;
    let imageSource;
    let i = 0;
    while(!foundImage)
      {
        if (responseJson[i].source != JSON.parse(fighterDetails).player1.image)
        {
          foundImage = true;
          imageSource = responseJson[i].source;
          if (myNumber == 1)
          {
            setTimeout(function(){
        ws.send(JSON.stringify({type:"requestSetBG", payload: {roomID: currentRoomID, source:imageSource}}))}
                       ,1000)
          }
        }
        i++;
      }
    //document.querySelector(".frame").style.backgroundImage = `url(${imageSource}`;
    //loadingImg.style.display="none"
  }
  //alert(responseJson.link)
  //FetchFandomPage(responseJson.link)
  //alert(response2Json[0].source);
}
async function setBGtoIMGNoSearch(name)
{
  let response;
  let responseJson;
  try{
    response = await fetch(`https://cartoon-clash-scraper-api.glitch.me/image?character=${name} house background`)
    responseJson = await response.json();
  }catch(err){
    alert(err);
    return;
  }finally{
    let foundImage = false;
    let imageSource;
    let i = 0;
    while(!foundImage)
      {
        if (responseJson[i].source != JSON.parse(fighterDetails).player1.image)
        {
          foundImage = true;
          imageSource = responseJson[i].source;
          if (myNumber == 1)
          {
            setTimeout(function(){
        ws.send(JSON.stringify({type:"requestSetBG", payload: {roomID: currentRoomID, source:imageSource}}))}
                       ,1000)
          }
        }
        i++;
      }
    //document.querySelector(".frame").style.backgroundImage = `url(${imageSource}`;
    //loadingImg.style.display="none"
  }
  //alert(responseJson.link)
  //FetchFandomPage(responseJson.link)
  //alert(response2Json[0].source);
}
    function returnPlayerNumber(ws, {number}){
      number = playerNumber;
      //alert(fighterDetails)
            let musicDetails = JSON.parse(fighterDetails);
document.querySelector("#songCredits").setAttribute("src", `${musicDetails.creditSrc}`)
      
      let daFighterDetails = JSON.parse(fighterDetails);
      if (myNumber == -1)
      {
        myNumber = number;
        //alert("stupid")
        //ApiData includes name, image, speed, abilities, health, moveset, attack, defense
        document.querySelector("#player1Img").style.background = `url(${daFighterDetails.player1.image.split("/revis")[0]}) no-repeat center -30px`;
        document.querySelector("#player1Img").style.backgroundSize = 'auto 250px';
        document.querySelector("#player1Text").textContent = daFighterDetails.player1.name.split("(")[0]
        document.querySelector("#player2Img").style.background = `url(${daFighterDetails.player2.image.split("/revis")[0]}) no-repeat center -30px`;
        document.querySelector("#player2Img").style.backgroundSize = 'auto 250px';
        document.querySelector("#player2Text").textContent = daFighterDetails.player2.name.split("(")[0]
        //setBGtoIMG(`${daFighterDetails.player1.name} house background`)
        
        if (number == 1)
        {
          //CreateFighter("SpongeBob SquarePants", ["https://upload.wikimedia.org/wikipedia/en/thumb/3/3b/SpongeBob_SquarePants_character.svg/1200px-SpongeBob_SquarePants_character.svg.png"], 20, 5, 3, ["punch", "shield", "laser", "iceBreath"], 100, ["flight"], false, true, 50, 0, 0, 0, 85, 1)
          CreateFighter(daFighterDetails.player1.name, [daFighterDetails.player1.image], daFighterDetails.player1.speed, daFighterDetails.player1.attack, daFighterDetails.player1.defense, daFighterDetails.player1.moveset, daFighterDetails.player1.health, daFighterDetails.player1.abilities, false, true, 50, 0, 0, 0, 85, 1)
        }
        if (myNumber == 2)
            {
              //CreateFighter("SpongeBob SquarePants", ["https://upload.wikimedia.org/wikipedia/en/thumb/3/3b/SpongeBob_SquarePants_character.svg/1200px-SpongeBob_SquarePants_character.svg.png"], 20, 5, 3, ["punch", "shield", "laser", "iceBreath"], 100, ["flight"], false, false, 50, 0, 0, 0, 85, 1)
              // CreateFighter("Patrick Star", ["https://upload.wikimedia.org/wikipedia/en/thumb/3/33/Patrick_Star.svg/1200px-Patrick_Star.svg.png"], 20, 5, 3, ["punch", "shield", "laser", "iceBreath"], 100, ["flight"], false, true, 444-75-120, 0, 0, 0, 85, 5)
              CreateFighter(daFighterDetails.player1.name, [daFighterDetails.player1.image], daFighterDetails.player1.speed, daFighterDetails.player1.attack, daFighterDetails.player1.defense, daFighterDetails.player1.moveset, daFighterDetails.player1.health, daFighterDetails.player1.abilities, false, false, 50, 0, 0, 0, 85, 1) 
              CreateFighter(daFighterDetails.player2.name, [daFighterDetails.player2.image], daFighterDetails.player2.speed, daFighterDetails.player2.attack, daFighterDetails.player2.defense, daFighterDetails.player2.moveset, daFighterDetails.player2.health, daFighterDetails.player2.abilities, false, true, 444-75-120, 0, 0, 0, 85, 1)
            }
            else
            {
              //CreateFighter("Patrick Star", ["https://upload.wikimedia.org/wikipedia/en/thumb/3/33/Patrick_Star.svg/1200px-Patrick_Star.svg.png"], 20, 5, 3, ["punch", "shield", "laser", "iceBreath"], 100, ["flight"], false, false, 444-75-120, 0, 0, 0, 85, 5)
              CreateFighter(daFighterDetails.player2.name, [daFighterDetails.player2.image], daFighterDetails.player2.speed, daFighterDetails.player2.attack, daFighterDetails.player2.defense, daFighterDetails.player2.moveset, daFighterDetails.player2.health, daFighterDetails.player2.abilities, false, false, 444-75-120, 0, 0, 0, 85, 1)
            }
        //socket.emit("requestReadyUpdate")
        //socket.emit("setGameRoomPlayerFighter", currentRoomID, playerNumber, players[playerNumber-1]);
        
        ws.send(JSON.stringify({type:"setGameRoomPlayerFighter", payload: {roomID: currentRoomID, playerNumber, data:players[playerNumber-1]}}))
          
        
        ws.send(JSON.stringify({type:"requestNametags", payload:{roomID: currentRoomID}}))
        //ws.send(JSON.stringify({type:"requestReadyUpdate"}))
        if (!yourPlayer.moveset.includes("shield"))
{
document.querySelector("#pressA").style.display = "none";
document.querySelector("#rechargingShield").style.display = "none";
}
if (!yourPlayer.moveset.includes("iceBreath"))
{
document.querySelector("#pressS").style.display = "none";
document.querySelector("#rechargingIceBreath").style.display = "none";
}
if (!yourPlayer.moveset.includes("laser"))
{
document.querySelector("#pressX").style.display = "none";
}
if (!yourPlayer.abilities.includes("flight"))
{
document.querySelector("#holdSpace").style.display = "none";
}
      let player1Fist = players[0].fist;
      let player2Fist = players[1].fist;
 // socket.emit("publishInfo", yourPlayer)
        ws.send(JSON.stringify({type:"publishInfo", payload:{roomID:currentRoomID, data:yourPlayer}}))
        setInterval(function(){
          //console.log(yourPlayer.inputs);
          
          //socket.emit("infoSend", myNumber-1, yourPlayer.inputs)
          //socket.emit("sendDataToPlayer", myNumber)
          if (unPause)
          {
          //socket.emit("sendInputs")
          }
        },0)
        
        /*socket.on('updateReadyCount', function(number){
          document.querySelector("#readyText").textContent = `${number}/2 ready`
        })*/
      
       /*socket.on('returnInputs', function(data){ 
        if (data.length != 0)
        {
        //console.log(data)
        }
        //alert(data[0])
        for (let i in players)
             {
                //if (i != myNumber-1)
                //{
                  
                  players[i].inputs = data[i]
                //}
             }
          
      }) 
        socket.on("refreshReady", function(){
          if (ready)
          {
          socket.emit("ready", myNumber);
          }
        })
        socket.on("refreshClaimedNumber", function(){
          
          socket.emit("claimSlot", myNumber);
          
        })
        */
        
        //socket.emit("requestGameStart", currentRoomID);
        //setTimeout(function(){
        //ws.send(JSON.stringify({type:"requestGameStart", payload:{roomID: currentRoomID}}))
        //},1000);
        //alert("YAYYEY")
        //alert(yourPlayer)
      }
    }
const stageDiv = document.querySelector("#stageContainer")
let unPause = false;
let players = [];
let playerElements = [];
let playerHitboxes = [];
let cpuList = [];
let yourPlayer;
function CreateFighter(name, images, speed,attack,defense,moveset, health, abilities, isCPU, playedByYou,x,y,velocityX, velocityY,jumpPower,acceleration){
  
  let characterElement = document.createElement("img");
  characterElement.setAttribute("src", images[0]);
  characterElement.setAttribute("style", `position:absolute; height:150px; bottom:${y}px; left:${x}px;`);
  //characterElement.setAttribute("class", "ui")
  stageDiv.appendChild(characterElement)
  let characterHitbox = document.createElement("div");
  characterHitbox.setAttribute("style", `position:absolute; background-color:clear; width:150px; height:150px; bottom:${y}px; left:${x}px;`)
  stageDiv.appendChild(characterHitbox)
  let characterFist = document.createElement("img");
  characterFist.setAttribute("id", "daFist");
  characterFist.setAttribute("src", "https://cdn.glitch.global/5dc85c69-4523-4b77-a54c-c3bf09afefaf/clenched-fist-vector-publicdomain.png?v=1731689757145")
  characterFist.setAttribute("style", `position:absolute; height:30px; bottom:75px; left:100%; opacity:0%;`)
  characterHitbox.appendChild(characterFist)
  let characterShield = document.createElement("img");
  characterShield.setAttribute("id", "shield");
  characterShield.setAttribute("src", "https://cdn.glitch.global/8682bce0-587a-4e77-b4f1-d6bfb8e7389c/Shield.png?v=1733350752929")
  characterShield.style.opacity = "0%";
  characterShield.style.position = "absolute";
  characterHitbox.appendChild(characterShield)
  let characterIceCube = document.createElement("img");
  characterIceCube.setAttribute("id", "ice");
  characterIceCube.setAttribute("src", "https://cdn.glitch.global/8682bce0-587a-4e77-b4f1-d6bfb8e7389c/IceCube.png")
  characterIceCube.setAttribute("style", "width:150px; height:150px; position:absolute;")
  characterIceCube.style.opacity = "0%";
  characterHitbox.appendChild(characterIceCube)
  let iceCubeText = document.createElement("p");
  iceCubeText.setAttribute("id", "mashZ")
  iceCubeText.setAttribute("style", "opacity:0; text-align:center; position:absolute; -webkit-text-stroke:1px black; color:white; font-size:25px; font-weight:bold;")
  iceCubeText.textContent = "MASH Z TO BREAK OUT OF ICE";
  characterHitbox.appendChild(iceCubeText);
  let newFighter = new Fighter(name, images, speed,attack,defense,moveset, health, abilities, isCPU, playedByYou, characterElement, x, y,velocityX, velocityY,jumpPower,acceleration)
  newFighter.hitbox = characterHitbox;
  newFighter.fist = characterFist;
  playerHitboxes.push(characterHitbox)
  players.push(newFighter)
  playerElements.push(characterElement)
  if (playedByYou == true)
    {
      yourPlayer = newFighter
    }
  if (isCPU == true)
    {
      cpuList.push(newFighter);
    }
}
let prevCameraX = 0; 
let prevCameraY = 0;
let prevCameraPercent = 100;
let cameraX = 0;
let cameraY = 0;
let cameraPercent = 100;
//CreateFighter("SpongeBob SquarePants", ["https://upload.wikimedia.org/wikipedia/en/thumb/3/3b/SpongeBob_SquarePants_character.svg/1200px-SpongeBob_SquarePants_character.svg.png"], 20, 5, 3, ["punch"], 100, [], false, true, 50, 0, 0, 0, 85, 1)
//CreateFighter("Patrick Star", ["https://upload.wikimedia.org/wikipedia/en/thumb/3/33/Patrick_Star.svg/1200px-Patrick_Star.svg.png"], 20, 5, 3, ["punch"], 100, [], true, false, 444-75-120, 0, 0, 0, 85, 5)
//CreateFighter("Patrick Star", ["https://upload.wikimedia.org/wikipedia/en/thumb/3/33/Patrick_Star.svg/1200px-Patrick_Star.svg.png"], 20, 5, 3, ["punch"], 100, [], true, false, 444-75-120-30, 0, 0, 0, 85, 5)
//CreateFighter("Patrick Star", ["https://upload.wikimedia.org/wikipedia/en/thumb/3/33/Patrick_Star.svg/1200px-Patrick_Star.svg.png"], 20, 5, 3, ["punch"], 100, [], true, false, 444-75-120-60, 0, 0, 0, 85, 5)

var lastUpdate = Date.now();
var lastUpdate2 = Date.now();
var myInterval = setInterval(tick, 0);
let deltaTime = 0;
let goingRight = false;
let goingLeft = false;
let startedCountdown = false;
let playedVictoryTheme = false;
let backgroundMusic = new Audio('https://cdn.glitch.global/5dc85c69-4523-4b77-a54c-c3bf09afefaf/StadiumCombat.mp3?v=1731978201363')
setTimeout(function(){
document.addEventListener("keydown", (event) => {
  if (event.isComposing || event.keyCode === 229 || yourPlayer.dead || gameEnd || ws.readyState != WebSocket.OPEN) {
    return;
  }
  if (event.keyCode == 39)
    {
      //socket.emit("keyDown", currentRoomID, myNumber-1, "right")
      //alert(currentRoomID + ", " + (myNumber - 1) + ", " + "right")
      ws.send(JSON.stringify({type:"keyDown", payload:{roomID:currentRoomID, number:myNumber-1, input:"right"}}))
      //alert("mrio 69")
      if (!yourPlayer.inputs.includes("right"))
        {
         // yourPlayer.inputs.push("right");
        }
      
    }
  if (event.keyCode == 37)
    {
      //socket.emit("keyDown", currentRoomID, myNumber-1, "left")
      ws.send(JSON.stringify({type:"keyDown", payload:{roomID:currentRoomID, number:myNumber-1, input:"left"}}))
      if (!yourPlayer.inputs.includes("left"))
        {
         // yourPlayer.inputs.push("left");
        }
    }
  if (event.keyCode == 38)
    {
      //socket.emit("keyDown", currentRoomID, myNumber-1, "up")
      ws.send(JSON.stringify({type:"keyDown", payload:{roomID:currentRoomID, number:myNumber-1, input:"up"}}))
     if (!yourPlayer.inputs.includes("up"))
        {
         // yourPlayer.inputs.push("up");
        } 
    }
  if (event.keyCode == 40)
    {
      //socket.emit("keyDown", currentRoomID, myNumber-1, "up")
      ws.send(JSON.stringify({type:"keyDown", payload:{roomID:currentRoomID, number:myNumber-1, input:"down"}}))
    
    }
  if (/*event.keyCode == 38 || */event.keyCode == 32)
    {
      //socket.emit("keyDown", currentRoomID, myNumber-1, "jump")
      ws.send(JSON.stringify({type:"keyDown", payload:{roomID:currentRoomID, number:myNumber-1, input:"jump"}}))
      if (!yourPlayer.inputs.includes("jump"))
        {
         // yourPlayer.inputs.push("jump");
        }
    }
    if (event.keyCode == 90)
    { 
      let punchType = "forward";
      if (yourPlayer.inputs.includes('up'))
        {
          punchType = "uppercut";
        }
      //socket.emit("keyDown", currentRoomID, myNumber-1, "punch")
      //socket.emit("keyDown", currentRoomID, myNumber-1, `punch-${punchType}`)
      ws.send(JSON.stringify({type:"keyDown", payload:{roomID:currentRoomID, number:myNumber-1, input:"punch"}}))
      ws.send(JSON.stringify({type:"keyDown", payload:{roomID:currentRoomID, number:myNumber-1, input:`punch-${punchType}`}}))
      if (!yourPlayer.inputs.includes(`punch`))
        {
          //yourPlayer.inputs.push(`punch`);
          if (!yourPlayer.inputs.includes(`punch-${punchType}`))
          {
           // yourPlayer.inputs.push(`punch-${punchType}`);
          }
        }
      
    }
  
  if (event.keyCode == 16)
    {
      //socket.emit("keyDown", currentRoomID, myNumber-1, "run")
      ws.send(JSON.stringify({type:"keyDown", payload:{roomID:currentRoomID, number:myNumber-1, input:"run"}}))
      if (!yourPlayer.inputs.includes("run"))
        {
          //yourPlayer.inputs.push("run");
        }
    }
  if (event.keyCode == 65 && yourPlayer.moveset.includes("shield"))
    {
      //socket.emit("keyDown", currentRoomID, myNumber-1, "run")
      ws.send(JSON.stringify({type:"keyDown", payload:{roomID:currentRoomID, number:myNumber-1, input:"shield"}}))
      if (!yourPlayer.inputs.includes("run"))
        {
          //yourPlayer.inputs.push("run");
        }
    }
  if (event.keyCode == 65 && yourPlayer.moveset.includes("shield"))
    {
      //socket.emit("keyDown", currentRoomID, myNumber-1, "run")
      ws.send(JSON.stringify({type:"keyDown", payload:{roomID:currentRoomID, number:myNumber-1, input:"shield"}}))
      if (!yourPlayer.inputs.includes("run"))
        {
          //yourPlayer.inputs.push("run");
        }
    }
  if (event.keyCode == 88 && yourPlayer.moveset.includes("laser"))
    {
      //socket.emit("keyDown", currentRoomID, myNumber-1, "run")
      ws.send(JSON.stringify({type:"keyDown", payload:{roomID:currentRoomID, number:myNumber-1, input:"laser"}}))
     
    }
  if (event.keyCode == 83 && yourPlayer.moveset.includes("iceBreath"))
    {
      //socket.emit("keyDown", currentRoomID, myNumber-1, "run")
      ws.send(JSON.stringify({type:"keyDown", payload:{roomID:currentRoomID, number:myNumber-1, input:"iceBreath"}}))
     
    }
  if (event.keyCode == 13 && !startedCountdown && !ready)
  {
    ready = true;
    //socket.emit("ready", myNumber)
    
  }
});
document.addEventListener("keyup", (event) => {
  if (event.isComposing || event.keyCode === 229 || ws.readyState != WebSocket.OPEN) {
    return;
  }
  if (event.keyCode == 39)
    {
      //socket.emit("keyUp", currentRoomID, myNumber-1, "right")
      ws.send(JSON.stringify({type:"keyUp", payload:{roomID:currentRoomID, number:myNumber-1, input:"right"}}))      
      const index = yourPlayer.inputs.indexOf("right");
      if (index > -1) { // only splice array when item is found
        //yourPlayer.inputs.splice(index, 1); // 2nd parameter means remove one item only
      }


    }
  if (event.keyCode == 37)
    {
      //socket.emit("keyUp", currentRoomID, myNumber-1, "left")
      ws.send(JSON.stringify({type:"keyUp", payload:{roomID:currentRoomID, number:myNumber-1, input:"left"}}))
      const index = yourPlayer.inputs.indexOf("left");
      if (index > -1) { // only splice array when item is found
        //yourPlayer.inputs.splice(index, 1); // 2nd parameter means remove one item only
      }
    }
  if (event.keyCode == 38)
    {
      //socket.emit("keyUp", currentRoomID, myNumber-1, "up")
      ws.send(JSON.stringify({type:"keyUp", payload:{roomID:currentRoomID, number:myNumber-1, input:"up"}}))
      const index = yourPlayer.inputs.indexOf("up");
      if (index > -1) { // only splice array when item is found
       // yourPlayer.inputs.splice(index, 1); // 2nd parameter means remove one item only
      }
    }
  if (event.keyCode == 40)
    {
      //socket.emit("keyUp", currentRoomID, myNumber-1, "up")
      ws.send(JSON.stringify({type:"keyUp", payload:{roomID:currentRoomID, number:myNumber-1, input:"down"}}))
      
    }
  if (/*event.keyCode == 38 ||*/ event.keyCode == 32)
    {
      //socket.emit("keyUp", currentRoomID, myNumber-1, "jump")
      ws.send(JSON.stringify({type:"keyUp", payload:{roomID:currentRoomID, number:myNumber-1, input:"jump"}}))
      const index = yourPlayer.inputs.indexOf("jump");
      if (index > -1) { // only splice array when item is found
       // yourPlayer.inputs.splice(index, 1); // 2nd parameter means remove one item only
      }
    }
  
  if (event.keyCode == 90)
    {
      //socket.emit("keyUp", currentRoomID, myNumber-1, "punch")
      ws.send(JSON.stringify({type:"keyUp", payload:{roomID:currentRoomID, number:myNumber-1, input:"punch"}}))
      //yourPlayer.inputs = yourPlayer.inputs.filter((item) => !item.includes("punch") );
    }
  if (event.keyCode == 65)
    {
      //socket.emit("keyDown", currentRoomID, myNumber-1, "run")
      ws.send(JSON.stringify({type:"keyUp", payload:{roomID:currentRoomID, number:myNumber-1, input:"shield"}}))
    
    }
  if (event.keyCode == 88)
    {
      //socket.emit("keyDown", currentRoomID, myNumber-1, "run")
      ws.send(JSON.stringify({type:"keyUp", payload:{roomID:currentRoomID, number:myNumber-1, input:"laser"}}))
     
    }
  if (event.keyCode == 83)
    {
      //socket.emit("keyDown", currentRoomID, myNumber-1, "run")
      ws.send(JSON.stringify({type:"keyUp", payload:{roomID:currentRoomID, number:myNumber-1, input:"iceBreath"}}))
     
    }
    if (event.keyCode == 16)
    {
      //socket.emit("keyUp", currentRoomID, myNumber-1, "run")
      ws.send(JSON.stringify({type:"keyUp", payload:{roomID:currentRoomID, number:myNumber-1, input:"run"}}))
      const index = yourPlayer.inputs.indexOf("run");
      if (index > -1) { // only splice array when item is found
        //yourPlayer.inputs.splice(index, 1); // 2nd parameter means remove one item only
      }
    }
  
});
},1000);
//document.body.addEventListener('mouseover', function() {let backgroundMusic = new Audio('https://cdn.glitch.global/5dc85c69-4523-4b77-a54c-c3bf09afefaf/StadiumCombat.mp3?v=1731978201363');
//backgroundMusic.play().then(() => {
//}).catch(error => {
//    console.error('Autoplay failed:', error);
//});})
backgroundMusic.addEventListener("ended", function(){
        backgroundMusic.play();
      })

let camera = document.querySelector(".frame");
let p1BarPlayAnimation = false;
let p2BarPlayAnimation = false;
let p1HealthBarWidth = 100;
let p2HealthBarWidth = 100;
let gameEnd= false;
let beginGame = false;
let winner = 0;
let victoryTheme = new Audio("https://cdn.glitch.global/5dc85c69-4523-4b77-a54c-c3bf09afefaf/GameEnd.mp3?v=1731977886082");
let pausedDeltaTime = 0;

function tick() {
  var now2 = Date.now();
    pausedDeltaTime = (now2 - lastUpdate2)/100;
    lastUpdate2 = now;
  if (gameEnd)
  {
    
    backgroundMusic.volume = Math.max(0, backgroundMusic.volume-0.005);
    //alert(backgroundMusic.volume)
    if (backgroundMusic.volume <= 0)
    {
      //alert(winner)
        let point1 = document.querySelector("#p1Guide");
        let point2 = document.querySelector("#p2Guide")
        let rect1 = point1.getBoundingClientRect();
        let rect2 = point2.getBoundingClientRect();

      
        //smoothCameraTransition();
      document.querySelector("#victoryText").textContent = `${winner.name} wins!`;
      document.querySelector("#resultsScreen").style.display = "block";
      if (!playedVictoryTheme)
      {
        playedVictoryTheme = true;
        setTimeout(goToLobby, 15000)
      victoryTheme.play();
      }  
      
    }
  }
  if (unPause)
  {
      //backgroundMusic.play();
  unPause = true;
    var now = Date.now();
    deltaTime = (now - lastUpdate)/100;
    lastUpdate = now;
    
      //frame.style.transform = `translate(-50%, -50%) translate(${centerX}px, ${centerY}px) scale(${200 / distance})`;
  //fists();
    if (yourPlayer.iceBreathCooldown > 0)
    {
    document.querySelector("#rechargingIceBreath").textContent = `Recharging ice breath in ${(yourPlayer.iceBreathCooldown/10).toFixed(3)} seconds`;
    }
    else
    {
    document.querySelector("#rechargingIceBreath").textContent = `Ice breath ready to be used`;
    }
    if (yourPlayer.shieldCooldown > 0)
    {
    document.querySelector("#rechargingShield").textContent = `Regenerating shield in ${(yourPlayer.shieldCooldown/10).toFixed(3)} seconds`;
    }
    else
    {
    document.querySelector("#rechargingShield").textContent = `Shield is ready`;
    }
for (let i in lasers)
      {
        let daLaser = lasers[i];
        //let daAngle = Math.atan2(daLaser.targetY - daLaser.y, daLaser.targetX - daLaser.x);
        //alert(daAngle)
        //alert(daLaser.velocityX + ", " + daLaser.velocityY)
        daLaser.x += daLaser.velocityX;
        daLaser.y += daLaser.velocityY;
        //alert(daLaser.targetX, daLaser.targetY)
        daLaser.element.style.transform = `translateX(${daLaser.x}px) translateY(${daLaser.y}px) rotate(${daLaser.angle * (180/Math.PI)}deg)`;
        daLaser.aliveTime -= deltaTime;
        let struck = false;
  ///alert(fistFrame)
    let player = players[daLaser.ownerNumber];
  for (let i in players)
    {
      if (players[i] != player)
       {
      let otherPlayer = players[i].element;
      let touchBool;
      if (daLaser.isIceBreath)
      {
        touchBool = touches(daLaser.element, otherPlayer)
      }
      else
      {
        touchBool = touches(daLaser.element, otherPlayer);
      }
      if (touches(daLaser.element, otherPlayer))
        {
          //alert(getDistance(otherPlayer.x,otherPlayer.y, daLaser.x, daLaser.y))
          if (daLaser.isIceBreath)
          {
            new Audio("https://cdn.glitch.global/8682bce0-587a-4e77-b4f1-d6bfb8e7389c/FreezeSound.wav?v=1733784354221").play();
          }
          else
          {
          new Audio("https://cdn.glitch.global/8682bce0-587a-4e77-b4f1-d6bfb8e7389c/Smash%20Hit.wav?v=1733784211703").play();        
          }
          //player.punchSound.play();
          if (players[i].hitbox.querySelector("#shield").style.opacity == 0)
          {
          players[i].health -= 2.5;
            if (daLaser.isIceBreath)
            {
              players[i].iceHealth = 20;
              players[i].frozen = true;
            }
          }
          else
          {
            //players[i].shieldHealth--;
            if (players[i].shieldHealth == 0)
            {
              //players[i].shieldBreakAudio.play();
              //setTimeout(function(){players[i].shieldHealth = 11}, 30000)
            }
            else
            {
              players[i].shieldDamageAudio[Math.round(Math.random()*3)].play();
            }
          }
          //players[i].stunned = true;
          //players[i].knockBackY = (-daLaser.velocityY/10)*150;
          //players[i].knockBackX = (daLaser.velocityX/10)*150;
          players[i].velocityY = 0;
          ws.send(JSON.stringify({type:"requestPlayerDamage", payload:{roomID:currentRoomID, number: i, damage:player.attack / players[i].defense, shielded:players[i].hitbox.querySelector("#shield").style.opacity > 0}}))
          ws.send(JSON.stringify({type:"requestKnockback", payload:{roomID:currentRoomID, number: i, x:(daLaser.velocityX/10)*150, y:(-daLaser.velocityY/10)*150}}))
          if (daLaser.isIceBreath){
          ws.send(JSON.stringify({type:"freezePlayer", payload:{roomID:currentRoomID, number: i}}))  
          }
          ws.send(JSON.stringify({type:"removeLaserFromServer", payload:{roomID:currentRoomID, number: i, laser:daLaser}}))
           const index = lasers.indexOf(daLaser);
          if (index > -1)
          {
            lasers.splice(index, 1); // 2nd parameter means remove one item only
          }
            //lasers.splice(i, 1); // 2nd parameter means remove one item only
          if (document.body.contains(daLaser.element))
          {
          stageDiv.removeChild(daLaser.element);
          }
          //alert("dingdingindg")
          
        }
       }
    }
        if (daLaser.aliveTime <= 0)
        {
         const index = lasers.indexOf(daLaser);
          if (index > -1)
          {
            lasers.splice(index, 1); // 2nd parameter means remove one item only
          }
        //lasers.splice(i, 1); // 2nd parameter means remove one item only
          stageDiv.removeChild(daLaser.element);
        }
      
        
      }
  if (players[0].x >= 1130 || players[0].x <= -575)
  {
    players[0].knockBackX *= -1
  }
  if (players[1].x >= 955 || players[1].x <= -700)
  {
    players[1].knockBackX *= -1
  }
  players[0].x = Math.max(Math.min(players[0].x,1330-200),-575); //originally 1330
  players[1].x = Math.max(Math.min(players[1].x,1330-375),-700);
  for (let i in players)
{
  //players[i].hitbox.querySelector("#usertag").style = `opacity: 1; text-align: start; position: absolute; -webkit-text-stroke: 1px black; color: white; font-size: 25px; font-weight: bold; transform: scaleX(1) translate(-50%); bottom:100%; left:${players[i].element.width/2}px; text-wrap:nowrap`;
  if (players[i].shieldHealth == 22)
  {
    players[i].hitbox.querySelector("#shield").src = "https://cdn.glitch.global/8682bce0-587a-4e77-b4f1-d6bfb8e7389c/Shield.png?v=1733350752929";
  }
  else if (players[i].shieldHealth > 0)
  {
    players[i].hitbox.querySelector("#shield").src = `https://cdn.glitch.global/8682bce0-587a-4e77-b4f1-d6bfb8e7389c/ShieldBreak${11-Math.round(players[i].shieldHealth/2)}.png?v=1733354359185`
  }
  if (players[i].iceHealth == 20)
  {
    players[i].hitbox.querySelector("#ice").src = "https://cdn.glitch.global/8682bce0-587a-4e77-b4f1-d6bfb8e7389c/IceCube.png";
  }
  else if (players[i].iceHealth > 0)
  {
    players[i].hitbox.querySelector("#ice").src = `https://cdn.glitch.global/8682bce0-587a-4e77-b4f1-d6bfb8e7389c/IceCubeBreak${11-(Math.round(players[i].iceHealth/2))}.png`
  }
  if (players[i].frozen)
  {
    players[i].hitbox.querySelector("#ice").style.opacity = 0.75
    if (players[i].playedByYou)
    {
    players[i].hitbox.querySelector("#mashZ").style.opacity = 1;
    }
  }
  else
  {
    players[i].hitbox.querySelector("#ice").style.opacity = 0   
    players[i].hitbox.querySelector("#mashZ").style.opacity = 0;
    players[i].iceHealth = 0;
  }
  if (players[i].health <= 0)
  {
    players[i].dead = true;
    gameEnd = true;
    players[i].element.setAttribute("class", "red-tint")
  }
  //players[i].walkingSound.volume = 1;
  if (Math.abs(players[i].velocityX) > 5 && players[i].y > 0)
   {
     players[i].walkingSound.play();
   }
  else
  {
    players[i].walkingSound.pause();
    players[i].walkingSound.currentTime = 0;
  }
  if (players[i].dead)
  {
    if (!players[i].element.style.transform.includes("rotate"))
    {
    //players[i].element.style.transform += `rotate(90deg)`;
    }
    //alert(players[i].element.style.transform)
  }
  else
  {
    winner = players[i];
  }
}

    if (beginGame)
    {
    handleCharacterInput();
    }
  if (true)
  {
    updateCharacterPositions();
  }
        handleCameraControl();    
    smoothCameraTransition();
  if(p1HealthBarWidth != (players[0].health/players[0].maxHealth)*100) //used to be parseFloat(document.querySelector("#player1HealthBar").style.width)
     {
       document.querySelector("#player1HealthBar").style.width = `${(players[0].health/players[0].maxHealth)*100}%`
       p1HealthBarWidth = (players[0].health/players[0].maxHealth)*100
       if (!p1BarPlayAnimation)
         {
           document.querySelector("#player1HealthBarTrail").style.opacity = "100%";
         }
       p1BarPlayAnimation = true;
     }
  if(p2HealthBarWidth != (players[1].health/players[1].maxHealth)*100)
     {
       document.querySelector("#player2HealthBar").style.width = `${(players[1].health/players[1].maxHealth)*100}%`
       p2HealthBarWidth = (players[1].health/players[1].maxHealth)*100
       if (!p2BarPlayAnimation)
         {
           document.querySelector("#player2HealthBarTrail").style.opacity = "100%";
         }
       p2BarPlayAnimation = true;
     }
  if (p1BarPlayAnimation)
{
 document.querySelector("#player1HealthBarTrail").style.opacity -= 0.01;
      
  if (document.querySelector("#player1HealthBarTrail").style.opacity == 0)
    {
      p1BarPlayAnimation = false;
      document.querySelector("#player1HealthBarTrail").style.width = `${(players[0].health/players[0].maxHealth)*100}%`
    }
}
  if (p2BarPlayAnimation)
{
 document.querySelector("#player2HealthBarTrail").style.opacity -= 0.01;
  if (document.querySelector("#player2HealthBarTrail").style.opacity <= 0)
    {
      p2BarPlayAnimation = false;
      document.querySelector("#player2HealthBarTrail").style.width = `${(players[1].health/players[1].maxHealth)*100}%`
       p1BarPlayAnimation = false;
    }
}
  
  }
}
function pointTouchesRect(a, b) {
  var aRect = a.getBoundingClientRect();
  var bRect = b.getBoundingClientRect();

  return !(
      ((aRect.top -125+ aRect.height) < (bRect.top)) ||
      (aRect.top +125> (bRect.top + bRect.height)) ||
      ((aRect.left-125 + aRect.width) < bRect.left) ||
      (aRect.left+125 > (bRect.left + bRect.width))
  );
}
let fistFrame = 10;
let currentFistPos = 0;
let playerToAnimate;
let fistAnimationType;
function touches(a, b) {
  var aRect = a.getBoundingClientRect();
  var bRect = b.getBoundingClientRect();

  return !(
      ((aRect.top + aRect.height) < (bRect.top)) ||
      (aRect.top > (bRect.top + bRect.height)) ||
      ((aRect.left + aRect.width) < bRect.left) ||
      (aRect.left > (bRect.left + bRect.width))
  );
}

function animateFist(player, type)
{
  currentFistPos += fistFrame;
  fistFrame--;
  //alert(type)
  let strikingAngle = 0;
  player.fist.style.opacity = "100%";
  switch(type)
    {
      case "forward":
        player.fist.style.bottom = "75px";
        player.fist.style.left = `calc(50% + ${currentFistPos*1}px)`;
        player.fist.style.transform = `rotate(90deg)`;
       strikingAngle = (90*player.direction)*(Math.PI/180);
        //alert(player.fist.style.left)
        break;
      case "uppercut":
        strikingAngle = ((45-currentFistPos/1.5)*player.direction)*(Math.PI/180);
        player.fist.style.left = `calc(75px + ${Math.sin((15-fistFrame)/Math.PI)*30}px`;
        player.fist.style.bottom = `calc(50% + ${currentFistPos*1}px)`;
        player.fist.style.transform = `rotate(${45-currentFistPos/1.5}deg)`;
        break;
    }
  let struck = false;
  ///alert(fistFrame)
  for (let i in players)
    {
      if (players[i] != player)
       {
      let otherPlayer = players[i].element;
      if (touches(otherPlayer, player.fist))
        {
          struck = true;
          player.punchSound.play();
          ////socket.emit("requestPlayerDamage", currentRoomID, i, player.attack - players[i].defense)
          ////socket.emit("requestKnockback", currentRoomID, i, Math.sin(strikingAngle)*150, Math.cos(strikingAngle)*150);
          //alert(player.hitbox.querySelector("#shield").style.opacity > 0);
          ws.send(JSON.stringify({type:"requestPlayerDamage", payload:{roomID:currentRoomID, number: i, damage:player.attack / players[i].defense, shielded:players[i].hitbox.querySelector("#shield").style.opacity > 0}}))
          ws.send(JSON.stringify({type:"requestKnockback", payload:{roomID:currentRoomID, number: i, x:Math.sin(strikingAngle)*150, y:Math.cos(strikingAngle)*150}}))
          //players[i].health -= player.attack - players[i].defense
          //players[i].stunned = true;
          //players[i].knockBackY = Math.cos(strikingAngle)*150;
          //players[i].knockBackX = Math.sin(strikingAngle)*150;
          //players[i].velocityY = 0;
          if (players[i].isCPU)
          {
            players[i].threatenedIntensity += (player.attack / players[i].defense)/(players[i].health/players[i].maxHealth)/4;
          }
          
          cancelAnimationFrame(animateFist)
          setTimeout(()=> player.fist.style.opacity = "0%", 1750);
          //alert("dingdingindg")
          
        }
       }
      
    }
  if (fistFrame > 0 && !struck)
    {
      requestAnimationFrame(function() { animateFist(player, type);})
    }
  else
    {
      cancelAnimationFrame(animateFist);
      setTimeout(()=> player.fist.style.opacity = "0%", 1000);
    }
}
function fists()
{  
  let fist1 = document.querySelector("#p1Fist");
  fist1.style = `position:absolute; left:${players[0].x}px`
  fist1.style.transform = players[0].element.style.transform;
  fist1.style.height = "30px";
  fist1.style.bottom = "75px";
}
function handleCameraControl()
{
  let point1 = document.querySelector("#p1Guide");
  let point2 = document.querySelector("#p2Guide");
  point1.style.transform = players[0].element.style.transform//`translateX(${players[0].x}px) translateY(${players[0].y}px)`
  point2.style.transform = `translateX(${players[1].x}px) translateY(${players[1].y}px)`
    //cameraX = ((players[0].x-444)+(players[1].x-444))
    //cameraY = ((players[0].y-444)+(players[1].y-444))
  const rect1 = point1.getBoundingClientRect();
      const rect2 = point2.getBoundingClientRect();
let dist = getDistance(players[0].x-150,players[0].y,players[1].x+150,players[1].y);
   //console.log(dist)
  //console.log((players[0].x+players[1].x)/-2)
  //console.log(players[0].element.getBoundingClientRect());
  const distance = getDistance(rect1.left, rect1.top, rect2.left, rect2.top);

      // Set scale based on distance (adjust 300 as needed for sensitivity)
      const scale = Math.pow(Math.max(1, 750 / distance), 0.5);

    cameraPercent = Math.min(scale*100,500);
      // Calculate the midpoint between the two images
      let centerX = (rect1.left + rect2.left) / 2;
      let centerY = (rect1.top + rect2.top) / 2;
      centerX = lerp(rect1.left+50, rect2.left, 0.5)
  centerY = lerp(rect1.top, rect2.top, 0.5)
      cameraX = lerp(players[0].x-75, players[1].x+75, 1);
  cameraY = lerp(players[1].y-5, players[0].y-5, 0.5);
  centerX = Math.min(Math.max(0,centerX),window.screen.width)
  cameraX = centerX;
  cameraY = centerY;
  if (backgroundMusic.volume <= 0)
  {
    point1.style.transform = `translateX(${players[0].x+37.5}px) translateY(${players[0].y-75}px)`
    point2.style.transform = `translateX(${players[0].x+75}px) translateY(${players[0].y-75}px)`
    if (winner == yourPlayer)
        {
          cameraX = point1.getBoundingClientRect().left;
          cameraY = rect1.y;
        }
      else
        {
          cameraX = lerp(rect2.left,rect2.right,0.5);
          cameraY = rect2.y;
        }
        cameraPercent = 500;
  }
  //document.querySelector("#debugOrigin").style.left =  `${centerX}px`
  //document.querySelector("#debugOrigin").style.top =  `${centerY}px`
}


let animationFrameId;

function centerAndZoomOnImages() {
    // Cancel any pending frame to avoid multiple calculations
    cancelAnimationFrame(animationFrameId);

    // Use requestAnimationFrame for smooth transitions
    animationFrameId = requestAnimationFrame(() => {
      // Get the bounding rectangles of both images
      const rect1 = players[0].element.getBoundingClientRect();
      const rect2 = players[1].element.getBoundingClientRect();

      // Calculate the midpoint between the two images
      const centerX = (rect1.left + rect2.left) / 2;
      const centerY = (rect1.top + rect2.top) / 2;

      // Calculate the distance between the two images
      const distance = getDistance(rect1.left, rect1.top, rect2.left, rect2.top);

      // Set scale based on distance (adjust 300 as needed for sensitivity)
      const scale = Math.max(1, 300 / distance);

      // Apply transformations to the frame
      camera.style.transformOrigin = `${centerX}px ${centerY}px`;
      camera.style.transform = `scale(${scale})`;
    });
  }

  // Initial call to center and zoom on images


let deeOffset = 0;
setInterval(()=>{
  //if (!yourPlayer.inputs.includes("right"))
  //  {
      //alert("shishihi")
  //  }
  //if (!yourPlayer.inputs.includes("left"))
  //  {
      //alert("beon")
  //  }
  
  if (gameEnd)
  {
   // alert(backgroundMusic.volume)
  }
  //players[1].unaffectedVelocityX = Math.random()*60-30
  //yourPlayer.health = Math.random()*100; players[1].health = Math.random()*100

  //alert(yourPlayer.acceleration)
  //cameraX = Math.random()*5
  //cameraY = Math.random()*5
  //alert((cameraY-prevCameraY)/prevCameraY)

  /*if (!players[1].dead)
  {
  cpuAiInput();
  }
  else
   {
     players[1].inputs = [];
   }*/
},250);

//setTimeout(()=>{yourPlayer.health = Math.random()*100; players[1].health = Math.random()*100}, 200);

function cpuAiInput()
{

  for (let i in cpuList)
    {
      
      let target;
      let cpu = cpuList[i];
      cpu.inputs = [];
      cpu.threatened = false;
      cpu.cornered = false;
      if (cpu.selfDefenseMode)
      {
        cpu.selfDefenseTerm-=0.1;
      }
      else
      {
        cpu.selfDefenseTerm = 100;
      }
      if (Math.random() > 1/Math.max(0.005, cpu.threatenedIntensity))
      {
        cpu.threatened = true;
      }
      let playersToLookFor = players.filter((item) => item != cpu);
      playersToLookFor = playersToLookFor.sort((item) => getDistance(item.x,item.y,cpu.x,cpu.y));
      target = playersToLookFor[0];
      if (cpu.x-target.x+175 < 0)
        {
          if (cpu.threatened && !cpu.cornered && !cpu.selfDefenseMode)
          {
              cpu.inputs.push("left");
          }
          else if(!cpu.selfDefenseMode)
           {
          cpu.inputs.push("right");
           }
        }
      else
        {
          if (cpu.threatened  && !cpu.cornered && !cpu.selfDefenseMode)
          {
              cpu.inputs.push("right");
          }
          else if(!cpu.selfDefenseMode)
          {
            cpu.inputs.push("left")
          }
        }
      if ((cpu.x < -525 || cpu.x > 1230) && cpu.threatened)
      {
        cpu.cornered = true;
        //alert("stup id")
      }
      if (cpu.cornered && getDistance(cpu.x, 0, target.x, 0) < 500)
      {
         cpu.selfDefenseMode = true;
      }
      if (cpu.selfDefenseMode)
      {
        cpu.inputs.push("run")
        if (cpu.x-target.x+175 < 0)
        {
          
            cpu.inputs.push("right")
          
        }
        else
        {
          cpu.inputs.push("left")
        }
          if (cpu.x-target.x <= -175 && cpu.x-target.x >= -250 && target.y < -150)
          {
            cpu.inputs.push("jump")
          }
        if (getDistance(cpu.x, 0, target.x, 0) > 125 && getDistance(cpu.x, 0, target.x, 0) < 225)
         {
           cpu.inputs.push("punch")
           let punchType = "forward";
           if (Math.random() > 0.5)
            {
              punchType = "uppercut"
            }
           cpu.inputs.push(`punch-${punchType}`)
         }
      }
      //alert(cpu.y - target.y);
      if (cpu.y-target.y>30 && cpu.y-target.y< 250 && cpu.x-target.x <= -175 && cpu.x-target.x >= -250)
        {
          cpu.inputs.push("punch")
          cpu.inputs.push("punch-uppercut")
        }
      if (getDistance(cpu.x, 0, target.x, 0) > 100)
         {
           if (Math.random() > 0.5)
            {
              cpu.inputs.push("run")
            }
         }
      if (getDistance(cpu.x, 0, target.x, 0) > 125 && getDistance(cpu.x, 0, target.x, 0) < 225)
         {
           if (Math.random()>0.5)
            {
           cpu.inputs.push("punch")
           let punchType = "forward";
           if (Math.random() > 0.5)
            {
              punchType = "uppercut"
            }
           cpu.inputs.push(`punch-${punchType}`)
            }
         }
      let fistCoords = target.fist.getBoundingClientRect();
      let cpuCoords = cpu.element.getBoundingClientRect();
      if (getDistance(cpuCoords.left,0, fistCoords.right, 0) < 150 && target.fist.style.opacity > 0)
      {
        cpu.inputs.push("run");
        cpu.inputs.push("jump")
      }
    }
  
}
function handleCharacterInput()
{
  //alert(yourPlayer.y)
  for (let i in players)
  {
    let daPlayer = players[i]
    //daPlayer.currentPunchCooldown -= deltaTime;
    //socket.emit("requestPunchCooldownChange", i, daPlayer.currentPunchCooldown);
  /*if (daPlayer.y > 0)
    {
      daPlayer.velocityY = 0;
      daPlayer.isJumping = false;
    }
    else
  {
    daPlayer.velocityY--;
    daPlayer.y = Math.min(daPlayer.y, 0);
  }
    if (daPlayer.inputs.includes("run"))
      {
        daPlayer.speed = daPlayer.runSpeed;
      }
    else
      {
        daPlayer.speed = daPlayer.defaultSpeed;
      }
    if (daPlayer.inputs.includes("jump") && daPlayer.y > 0 &&!daPlayer.isJumping)
      {
        daPlayer.isJumping = true;
        //daPlayer.jumpSound.play();
        daPlayer.velocityY = daPlayer.jumpPower;
      }
   if (daPlayer.inputs.includes("right"))
      {
        //yourPlayer.y = 20;
      daPlayer.velocityX += daPlayer.acceleration
      daPlayer.velocityX = Math.min(daPlayer.speed, daPlayer.velocityX) 
      }
  if (daPlayer.inputs.includes("left"))
    {
      daPlayer.velocityX -= daPlayer.acceleration
      daPlayer.velocityX = Math.max(-daPlayer.speed, daPlayer.velocityX)
    }
  if (!daPlayer.inputs.includes("right") && !daPlayer.inputs.includes("left"))
    {
      //alert("shihihi")
      if (daPlayer.velocityX > 0)
        {
            //daPlayer.y = 0;
      daPlayer.velocityX -= daPlayer.acceleration
      daPlayer.velocityX = Math.max(0, daPlayer.velocityX)
        }
      if (daPlayer.velocityX < 0)
        {
          
      daPlayer.velocityX += daPlayer.acceleration
      daPlayer.velocityX = Math.min(0, daPlayer.velocityX)
        }
    }*/
    if (daPlayer.inputs.includes("shield") && players[i].shieldHealth > 0)
    {
      daPlayer.hitbox.querySelector("#shield").style.opacity = "75%";
    }
    else
    {
      daPlayer.hitbox.querySelector("#shield").style.opacity = "0%";
    }
    if (daPlayer.inputs.includes("punch") && daPlayer.frozen)
    {
          new Audio(`https://cdn.glitch.global/8682bce0-587a-4e77-b4f1-d6bfb8e7389c/Ice_mining${1+(Math.round(Math.random()*5))}.ogg`).play();
if (daPlayer.iceHealth <= 0)
          {
            new Audio("https://cdn.glitch.global/8682bce0-587a-4e77-b4f1-d6bfb8e7389c/Glass_dig1.ogg?v=1733786161053").play();
          }
    }
    if(daPlayer.inputs.includes("punch"))
      {
        //alert("punchy punchy just a bunchy")
        //alert(daPlayer.currentPunchCooldown)
        /*if (daPlayer.currentPunchCooldown <= 0)
          {
            socket.emit("requestPunchCooldownChange", i, daPlayer.punchCooldown);
            //daPlayer.currentPunchCooldown = daPlayer.punchCooldown;
        let punchInputs = [];
        for (let i in daPlayer.inputs)
        {
          if (daPlayer.inputs[i].includes("punch") && daPlayer.inputs[i] != "punch")
            {
              
              punchInputs.push(daPlayer.inputs[i]);
              
            }
        }
        switch (punchInputs[0])
          {
            case "punch-forward":
              //alert(`${daPlayer.name} punched forward`);
              fistFrame = 15;
              currentFistPos = 0;
              requestAnimationFrame(function() { animateFist(daPlayer, "forward");})
              
              //daPlayer.inputs.splice(daPlayer.indexOf("punch-forward"), 1);

            break;
            case "punch-uppercut":
              fistFrame = 15;
              currentFistPos = 0;
              requestAnimationFrame(function() { animateFist(daPlayer, "uppercut");})
              //alert(`${daPlayer.name} punched upwards`);
              //daPlayer.inputs.splice(daPlayer.indexOf("punch-uppercut"), 1);

              break;
          }
            for (let i in punchInputs)
            {
              socket.emit("keyUp", myNumber-1, punchInputs[i])
            }
          daPlayer.inputs = daPlayer.inputs.filter((item) => !item.includes("punch") );
         }*/
      }
  }
}
let deadCharacterRotate = 0;
function updateCharacterPositions()
{
  for (let i in players)
    {
      let daCharacter = players[i];
      /*if (daCharacter.velocityX > 0)
      {
        daCharacter.direction = 1;
      }
      if (daCharacter.velocityX < 0)
        {
          daCharacter.direction = -1;
        }
      if (daCharacter.knockBackX < 15 && daCharacter.knockBackX > -15)
        {
          daCharacter.stunned = false;
        }
      else
        {
          daCharacter.stunned = true;
        }
      if (daCharacter.knockBackX > 0)
      {
      //alert(daCharacter.knockBackX)
      }
      if (daCharacter.stunned)
        {
          daCharacter.velocityX = 0;
          //daCharacter.velocityY = 0;
        }
      if (daCharacter.y >= 1)
        {
          daCharacter.knockBackY = 0;
          daCharacter.y=0;
        }*/
      let deadRot = "";
      if (daCharacter.dead)
      {
        deadRot = `rotate(${deadCharacterRotate}deg)`;
      }
      //daCharacter.knockBackX /= 1.01;
      //daCharacter.x += (daCharacter.velocityX + daCharacter.unaffectedVelocityX + daCharacter.knockBackX) * deltaTime;
      //daCharacter.y -= (daCharacter.velocityY + daCharacter.unaffectedVelocityY + daCharacter.knockBackY) * deltaTime;
      daCharacter.element.style.transform = `translateX(${daCharacter.x}px) translateY(${daCharacter.y}px) scaleX(${daCharacter.direction}) ${deadRot}`;
      daCharacter.hitbox.style.transform = `translateX(${daCharacter.x}px) translateY(${daCharacter.y}px) scaleX(${daCharacter.direction})`
      daCharacter.hitbox.querySelector("#mashZ").style.transform = `scaleX(${daCharacter.direction})`;
      daCharacter.hitbox.querySelector("#usertag").style.transform = `scaleX(${daCharacter.direction})`;
    }
  if (gameEnd)
  {
    deadCharacterRotate += (90-deadCharacterRotate)/250;
  }
}

function getDistance(x1, y1, x2, y2) {
  // Use the Pythagorean theorem to calculate the distance
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}


function smoothCameraTransition()
{
  prevCameraX += (cameraX-prevCameraX)/500
  prevCameraY += (cameraY-prevCameraY)/500
  prevCameraPercent += (cameraPercent-prevCameraPercent)/500
  //prevCameraX = cameraX;
  //prevCameraY = cameraY;
  //prevCameraPercent = cameraPercent
  //prevCameraPercent = Math.min(500, prevCameraPercent)
   document.querySelector(".frame").style.transformOrigin = `${cameraX}px ${cameraY}px`
  //document.querySelector(".frame").style.transform = `translateX(${cameraX*prevCameraPercent/100-888}px) translateY(${cameraY*prevCameraPercent/100-2000}px) scale(${prevCameraPercent}%)`
  document.querySelector(".frame").style.transform = `scale(${prevCameraPercent}%)`
}
function lerp( a, b, alpha ) {
 return a + alpha * ( b - a )
}