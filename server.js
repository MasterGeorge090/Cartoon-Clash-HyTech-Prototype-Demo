// server.js
// where your node app starts

const express = require("express");
const http = require("http");
const WebSocket = require("ws");

// Initialize express and HTTP server
const app = express();
const server = http.createServer(app);

// Initialize WebSocket server
const wss = new WebSocket.Server({ server });

let players = [];
let playerInputs = [[],[]];
let sockets = [];
let socketsNumberList = [];
let webSockets = [];
let numUsers = 0;
let usernames = [];
let gameRooms = [];
let rooms = [];
let roomIDS = [];
let roomOwnerIDS = [];
let currentRoomIDSList = roomIDS;
let fightPlaylist = [
  "https://cdn.glitch.global/5dc85c69-4523-4b77-a54c-c3bf09afefaf/StadiumCombat.mp3?v=1731978201363",
  "https://cdn.glitch.global/8682bce0-587a-4e77-b4f1-d6bfb8e7389c/y2mate.com%20-%20Ed%20Edd%20n%20Eddy%20Soundtrack%20%20Background%20Music%203%20HQ%20Audio.mp3?v=1733706756712",
  "https://cdn.glitch.global/8682bce0-587a-4e77-b4f1-d6bfb8e7389c/y2mate.com%20-%20The%20Beets%20%20%20Killer%20Tofu%20Best%20Audio%20Quality.mp3?v=1733707409478",
  "https://cdn.glitch.global/8682bce0-587a-4e77-b4f1-d6bfb8e7389c/y2mate.com%20-%20Yakety%20Sax%20Music.mp3?v=1733707217356",
  "https://cdn.glitch.global/8682bce0-587a-4e77-b4f1-d6bfb8e7389c/y2mate.com%20-%20Dragon%20ball%20Z%20soundtrack%20Battle%20theme%20Fight%20music.mp3?v=1733708367511"
]
let playlistCredits = [
  "https://cdn.glitch.global/5dc85c69-4523-4b77-a54c-c3bf09afefaf/StadiumRaveMortalKombat.png?v=1731972949601",
  "https://cdn.glitch.global/8682bce0-587a-4e77-b4f1-d6bfb8e7389c/BGM3.png?v=1733684581768",
  "https://cdn.glitch.global/8682bce0-587a-4e77-b4f1-d6bfb8e7389c/KillerTofu.png?v=1733684593696",
  "https://cdn.glitch.global/8682bce0-587a-4e77-b4f1-d6bfb8e7389c/YacketySax.png?v=1733684604877",
  "https://cdn.glitch.global/8682bce0-587a-4e77-b4f1-d6bfb8e7389c/DragonBallBattle.png?v=1733708381110"
]
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
// Helper classes (same as original script)
class DaFighter{
  constructor(name, images, speed,attack,defense,moveset, health, abilities,x, y, velocityX, velocityY,jumpPower,acceleration)
  {
    this.name = name; //string
    this.images = images; //array of urls
    this.speed = speed; //number
    this.attack = attack; //number
    this.defense = defense; //number
    this.moveset = moveset; //array string
    this.health = health; //number
    this.abilities = abilities; //array string
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
  
    //this.fist;
    
    this.dead = false;

    
  }
  
}
class Room{
  constructor()
  {
    this.player1ID;
    this.player1Fighter;
    this.player1Username;
    this.player2ID;
    this.player2Fighter;
    this.player2Username;
    this.initiatingGame;
    this.player1FetchedJson;
    this.player2FetchedJson;
    let numUsers = 0;
    let isPrivate = false;
    let gameID = "";
    let blacklist = [];
    let peopleReady;
    let currentAmountReady = 0;
    let previousAmountReady = 0;
    //Game Vars
    
    let messageLog;
    
  }
}

class GameRoom{
  constructor()
  {
    this.player1ID;
    this.player1Fighter;
    this.player1Username;
    this.player2ID;
    this.player2Fighter;
    this.player2Username;
    this.gameID = "";
    this.amountReady = 0;
    this.playerInputs = [[],[]];
    this.oldPlayerData = [];
    this.forbiddenPlayerInputs = [[], []];
    this.lasers = [];
    //GAME VARS
    this.startedCountdown = false;
    this.gameEnd = false;
    this.beginGame = true;
    this.winner = 0;
    this.deadCharacterRotate = 0;
    this.unPause = true;
  }
}
class LobbyPlayer{
  constructor(socketID)
  {
    this.socketID = socketID;
    this.username = "";
  }
}

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

function CreateFighter(name, images, speed, attack, defense, moveset, health, abilities, x, y, velocityX, velocityY, jumpPower, acceleration){
  return new DaFighter(name, images, speed,attack,defense,moveset, health, abilities, x, y,velocityX, velocityY,jumpPower,acceleration)
}

let pausedDeltaTime = 0;
var lastUpdate = Date.now();
var lastUpdate2 = Date.now();
let deltaTime = 0;
function tick(roomID)
{
  var now2 = Date.now();
    pausedDeltaTime = (now2 - lastUpdate2)/100;
    lastUpdate2 = now;
  //console.log(gameRooms[roomID].player1Fighter, gameRooms[roomID].player2Fighter)
  let gamePlayers = [gameRooms[roomID].player1Fighter, gameRooms[roomID].player2Fighter]
  if (gameRooms[roomID].unPause)
  {
      //backgroundMusic.play();
  gameRooms[roomID].unPause = true;
    var now = Date.now();
    deltaTime = 1/24
    lastUpdate = now;
    
      //frame.style.transform = `translate(-50%, -50%) translate(${centerX}px, ${centerY}px) scale(${200 / distance})`;
  //fists();
  if (gamePlayers[0].x >= 1130 || gamePlayers[0].x <= -575)
  {
    gamePlayers[0].knockBackX *= -1
  }
  if (gamePlayers[1].x >= 955 || gamePlayers[1].x <= -700)
  {
    gamePlayers[1].knockBackX *= -1
  }
  gamePlayers[0].x = Math.max(Math.min(gamePlayers[0].x,1330-200),-575); //originally 1330
  gamePlayers[1].x = Math.max(Math.min(gamePlayers[1].x,1330-375),-700);
  for (let i in gamePlayers)
{
  if (gamePlayers[i].health <= 0)
  {
    gamePlayers[i].dead = true;
    gameRooms[roomID].gameEnd = true;
    //players[i].element.setAttribute("class", "red-tint")
  }
  gamePlayers[i].laserCooldown -= deltaTime;
  gamePlayers[i].iceBreathCooldown -= deltaTime;
  gamePlayers[i].shieldCooldown -= deltaTime;
  if (gamePlayers[i].shieldCooldown <= 0 && gamePlayers[i].shieldHealth <= 0)
  {
    gamePlayers[i].shieldHealth = 22;
  }
  //players[i].walkingSound.volume = 1;
  if (Math.abs(gamePlayers[i].velocityX) > 5 && gamePlayers[i].y > 0)
   {
     //players[i].walkingSound.play();
   }
  else
  {
    //players[i].walkingSound.pause();
    //players[i].walkingSound.currentTime = 0;
  }
  if (gamePlayers[i].dead)
  {
    //if (!players[i].element.style.transform.includes("rotate"))
    //{
    //players[i].element.style.transform += `rotate(90deg)`;
    //}
    //alert(players[i].element.style.transform)
  }
  else
  {
    gameRooms[roomID].winner = gamePlayers[i];
  }
}

    if (gameRooms[roomID].beginGame)
    {
    handleCharacterInput(roomID);
    }
  if (true)
  {
    updateCharacterPositions(roomID);
  }
  //      handleCameraControl(roomID);    
  }
}
function handleCharacterInput(roomID)
{
  //alert(yourPlayer.y)
  let gamePlayers = [gameRooms[roomID].player1Fighter, gameRooms[roomID].player2Fighter]
  for (let i in gamePlayers)
  {
    let daPlayer = gamePlayers[i]
    //console.log(deltaTime);
    //console.log(daPlayer.currentPunchCooldown)
    daPlayer.currentPunchCooldown -= deltaTime;
  if (daPlayer.y > 0)
    {
      daPlayer.velocityY = 0;
      if ((!daPlayer.inputs.includes("shield") || daPlayer.shieldHealth == 0) && !daPlayer.frozen)
      {
      daPlayer.isJumping = false;
      daPlayer.flyTimeLimit = 50;
      }
    }
    else
  {
    if (daPlayer.inputs.includes("jump") && daPlayer.abilities.includes("flight") && daPlayer.knockBackY == 0 && daPlayer.flyTimeLimit > 0 && !daPlayer.frozen)
    {
      daPlayer.flyTimeLimit -= deltaTime;
      if (!daPlayer.inputs.includes("down") && !daPlayer.inputs.includes("up"))
      {
        
        daPlayer.velocityY--;
        daPlayer.velocityY = Math.max(daPlayer.velocityY, 0);
      }
      else
      {
        if (daPlayer.inputs.includes("down"))
         {
           daPlayer.velocityY = -daPlayer.speed;
         }
        if (daPlayer.inputs.includes("up") && daPlayer.y > -350)
        {
          daPlayer.velocityY = daPlayer.speed;
        }
        else
        {
          if (daPlayer.inputs.includes("up"))
          {
            daPlayer.velocityY = 0;
          }
        }
      }
    }
    else
    {
      daPlayer.velocityY--;
    }
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
        webSockets[gameRooms[roomID].player1ID].send(JSON.stringify({type:"playJumpSound", payload: {}}))
        webSockets[gameRooms[roomID].player2ID].send(JSON.stringify({type:"playJumpSound", payload: {}}))

        //daPlayer.jumpSound.play();
        daPlayer.velocityY = daPlayer.jumpPower;
      }
    if (daPlayer.inputs.includes("laser") && daPlayer.laserCooldown <= 0  && !daPlayer.frozen)
      {
        let daID;
        let daNumber;
        if (daPlayer == gameRooms[roomID].player1Fighter)
         {
           daID = gameRooms[roomID].player1ID;
           daNumber = 0;
         }
        if (daPlayer == gameRooms[roomID].player2Fighter)
        {
           daID = gameRooms[roomID].player2ID;
            daNumber = 1;
        }
        let playerOffset = 200;
        if (daNumber == 1)
        {
          playerOffset = -200;
        }
        let daAngle = Math.atan2(gamePlayers[1-daNumber].y - daPlayer.y, gamePlayers[1-daNumber].x + playerOffset - daPlayer.x);
        //alert(daAngle)
        //daLaser.x += Math.cos(daAngle)*1;
        //daLaser.y += Math.sin(daAngle)*1;
        daPlayer.laserCooldown = 15;
        
        //console.log(daNumber)
        webSockets[gameRooms[roomID].player1ID].send(JSON.stringify({type:"createLaser", payload: {ownerNumber: daNumber, x:daPlayer.x, y:daPlayer.y, velocityX:Math.cos(daAngle)*10, velocityY:Math.sin(daAngle)*10, angle:daAngle, isIceBreath:false}}))
        webSockets[gameRooms[roomID].player2ID].send(JSON.stringify({type:"createLaser", payload: {ownerNumber: daNumber, x:daPlayer.x, y:daPlayer.y, velocityX:Math.cos(daAngle)*10, velocityY:Math.sin(daAngle)*10, angle:daAngle, isIceBreath:false}}))
        gameRooms[roomID].lasers.push(new Laser(daNumber, Math.cos(daAngle)*10, Math.sin(daAngle)*10, daPlayer.x, daPlayer.y,daAngle, false));
        //CreateLaser(daPlayer, daPlayer.x,daPlayer.y, Math.cos(daAngle)*10,Math.sin(daAngle)*10, daAngle, false)
      }
    if (daPlayer.inputs.includes("iceBreath") && daPlayer.iceBreathCooldown <= 0  && !daPlayer.frozen)
      {
        let daID;
        let daNumber;
        if (daPlayer == gameRooms[roomID].player1Fighter)
         {
           daID = gameRooms[roomID].player1ID;
           daNumber = 0;
         }
        if (daPlayer == gameRooms[roomID].player2Fighter)
        {
           daID = gameRooms[roomID].player2ID;
            daNumber = 1;
        }
        let playerOffset = 200;
        if (daNumber == 1)
        {
          playerOffset = -200;
        }
        let daAngle = Math.atan2(gamePlayers[1-daNumber].y - daPlayer.y, gamePlayers[1-daNumber].x+playerOffset - daPlayer.x);
        //alert(daAngle)
        //daLaser.x += Math.cos(daAngle)*1;
        //daLaser.y += Math.sin(daAngle)*1;
        
        daPlayer.iceBreathCooldown = 300;
        
        //console.log("evil mario")
        webSockets[gameRooms[roomID].player1ID].send(JSON.stringify({type:"createLaser", payload: {ownerNumber: daNumber, x:daPlayer.x, y:daPlayer.y, velocityX:Math.cos(daAngle)*10, velocityY:Math.sin(daAngle)*10, angle:daAngle, isIceBreath:true}}))
        webSockets[gameRooms[roomID].player2ID].send(JSON.stringify({type:"createLaser", payload: {ownerNumber: daNumber, x:daPlayer.x, y:daPlayer.y, velocityX:Math.cos(daAngle)*10, velocityY:Math.sin(daAngle)*10, angle:daAngle, isIceBreath:true}}))
        gameRooms[roomID].lasers.push(new Laser(daNumber, Math.cos(daAngle)*10, Math.sin(daAngle)*10, daPlayer.x, daPlayer.y,daAngle, true));
        //CreateLaser(daPlayer, daPlayer.x,daPlayer.y, Math.cos(daAngle)*10,Math.sin(daAngle)*10, daAngle, true)
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
    }
    if(daPlayer.inputs.includes("punch") && !daPlayer.frozen)
      {
        let punchType = "forward";
        //console.log(daPlayer.inputs)
        if (daPlayer.inputs.includes("up"))
         {
            punchType = "uppercut"
         }
        if (daPlayer.currentPunchCooldown <= 0)
        {
          daPlayer.currentPunchCooldown = daPlayer.punchCooldown;
          //io.in(roomID).emit("punch", i, punchType)
          webSockets[gameRooms[roomID].player1ID].send(JSON.stringify({type:"punch", payload:{number: i, type:punchType}}));
          webSockets[gameRooms[roomID].player2ID].send(JSON.stringify({type:"punch", payload:{number: i, type:punchType}}));
          daPlayer.inputs = daPlayer.inputs.filter((item) => !item.includes("punch") );
        }
        //alert(daPlayer.currentPunchCooldown)
        
         
      }
    else
    {
      if (daPlayer.inputs.includes("punch") && daPlayer.frozen)
        {
          daPlayer.iceHealth--;
          if (daPlayer.iceHealth == 0)
          {
            daPlayer.frozen = false;
          }
          let daNumber;
        if (daPlayer == gameRooms[roomID].player1Fighter)
         {
           daNumber = 0;
         }
        if (daPlayer == gameRooms[roomID].player2Fighter)
        {
            daNumber = 1;
        }
          gameRooms[roomID].playerInputs[daNumber] = gameRooms[roomID].playerInputs[daNumber].filter((item) => item !== "punch");
          daPlayer.inputs = daPlayer.inputs.filter((item) => item !== "punch");
          console.log(daPlayer.iceHealth)
          //daPlayer.inputs = daPlayer.inputs.filter((item) => !item.includes("punch") );
        }
    }
  }
}
let deadCharacterRotate = 0;
function updateCharacterPositions(roomID)
{
  let gamePlayers = [gameRooms[roomID].player1Fighter, gameRooms[roomID].player2Fighter]
  for (let i in gamePlayers)
    {
      let daCharacter = gamePlayers[i];
      if (daCharacter.velocityX > 0)
      {
        daCharacter.direction = 1;
      }
      if (daCharacter.velocityX < 0)
        {
          daCharacter.direction = -1;
        }
      if (daCharacter.knockBackX < 15 && daCharacter.knockBackX > -15 && (!daCharacter.inputs.includes("shield") || daCharacter.shieldHealth <= 0) && !daCharacter.frozen)
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
        }
      let deadRot = "";
      if (daCharacter.dead)
      {
        deadRot = `rotate(${deadCharacterRotate}deg)`;
      }
      daCharacter.knockBackX /= 1.01;
      daCharacter.x += (daCharacter.velocityX + daCharacter.unaffectedVelocityX + daCharacter.knockBackX) * deltaTime;
      daCharacter.y -= (daCharacter.velocityY + daCharacter.unaffectedVelocityY + daCharacter.knockBackY) * deltaTime;
      //daCharacter.element.style.transform = `translateX(${daCharacter.x}px) translateY(${daCharacter.y}px) scaleX(${daCharacter.direction}) ${deadRot}`;
      //daCharacter.hitbox.style.transform = `translateX(${daCharacter.x}px) translateY(${daCharacter.y}px) scaleX(${daCharacter.direction})`
    }
  if (gameRooms[roomID].gameEnd)
  {
    deadCharacterRotate += (90-deadCharacterRotate)/250;
  }
}
/*function handleCameraControl()
{
  //let point1 = document.querySelector("#p1Guide");
  //let point2 = document.querySelector("#p2Guide");
  //point1.style.transform = players[0].element.style.transform//`translateX(${players[0].x}px) translateY(${players[0].y}px)`
  //point2.style.transform = `translateX(${players[1].x}px) translateY(${players[1].y}px)`
  let point1X = 516+ players[0].x*2;
  let point1Y = 784.5 + players[0].y;
  let point2X = 516+ players[1].x*2;
  let point2Y = 784.5 + players[1].y;
    //cameraX = ((players[0].x-444)+(players[1].x-444))
    //cameraY = ((players[0].y-444)+(players[1].y-444))
  //const rect1 = point1.getBoundingClientRect();
      //const rect2 = point2.getBoundingClientRect();
let dist = getDistance(players[0].x-150,players[0].y,players[1].x+150,players[1].y);
   //console.log(dist)
  //console.log((players[0].x+players[1].x)/-2)
  //console.log(players[0].element.getBoundingClientRect());
  const distance = getDistance(point1X, point1Y, point2X, point2Y);

      // Set scale based on distance (adjust 300 as needed for sensitivity)
      const scale = Math.pow(Math.max(1, 750 / distance), 0.5);

    cameraPercent = Math.min(scale*100,500);
      // Calculate the midpoint between the two images
      let centerX = (point1X + point2X.left) / 2;
      let centerY = (point1Y.top + point2Y.top) / 2;
      centerX = lerp(point1X+50, point2X, 0.5)
  centerY = lerp(point1Y, point2Y, 0.5)
      cameraX = lerp(players[0].x-75, players[1].x+75, 1);
  cameraY = lerp(players[1].y-5, players[0].y-5, 0.5);
  centerX = Math.min(Math.max(0,centerX),1920)
  cameraX = centerX;
  cameraY = centerY;
  if (bgMusicVolume <= 0)
  {
    //point1.style.transform = `translateX(${players[0].x+37.5}px) translateY(${players[0].y-75}px)`
    //point2.style.transform = `translateX(${players[0].x+75}px) translateY(${players[0].y-75}px)`
    if (winner == players[0])
        {
          cameraX = point1X;
          cameraY = point1Y;
        }
      else
        {
          cameraX = point2X;
          cameraY = point2Y;
        }
        cameraPercent = 500;
  }
  //document.querySelector("#debugOrigin").style.left =  `${centerX}px`
  //document.querySelector("#debugOrigin").style.top =  `${centerY}px`
}*/
function lerp( a, b, alpha ) {
 return a + alpha * ( b - a )
}
function getDistance(x1, y1, x2, y2) {
  // Use the Pythagorean theorem to calculate the distance
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}
let currentRoomsAvaliable = []
wss.on("connection", (ws) => {
  console.log("A user connected");
  numUsers++;

  // Assign unique ID to each WebSocket connection
  ws.id = makeid(8);
  ws.send(JSON.stringify({ type: "returnID", payload: {id: ws.id} }));

  sockets[ws.id] = new LobbyPlayer(ws.id);
  socketsNumberList.push(sockets[ws.id]);
  webSockets[ws.id] = ws;
  setInterval(function(){
    for (let i in rooms)
    {
      if (rooms[i])
      {
      rooms[i].currentAmountReady = 0;
      for (let j in rooms[i].peopleReady)
      {
        if (rooms[i].peopleReady[j])
        {
          rooms[i].currentAmountReady++;
        }
      }
      if (rooms[i].previousAmountReady != rooms[i].currentAmountReady)
      {
        let gameCountdown;
        console.log(rooms[i].currentAmountReady + ", " + rooms[i].previousAmountReady)
        if (rooms[i].currentAmountReady == 2)
        {
            setTimeout(function(){
              rooms[i].messageLog.push([`SYSTEM MESSAGE: INITIATING GAME⠀`, true]);
              rooms[i].initiatingGame = true;
              //io.in(i).emit("updateMessageLog", `SYSTEM MESSAGE: INITIATING GAME⠀`, true);
              webSockets[rooms[i].player1ID].send(JSON.stringify({ type: "updateMessageLog", payload: {message: "SYSTEM MESSAGE: INITIATING GAME", isSystemMessage: true} }));
              webSockets[rooms[i].player2ID].send(JSON.stringify({ type: "updateMessageLog", payload: {message: "SYSTEM MESSAGE: INITIATING GAME", isSystemMessage: true} }));
      
              gameCountdown = setTimeout(function(){
                let daGameRoom = new GameRoom();
                daGameRoom.player1Fighter = rooms[i].player1Fighter;
                daGameRoom.player1Username = rooms[i].player1Username;
                daGameRoom.player2Fighter = rooms[i].player2Fighter;
                daGameRoom.player2Username = rooms[i].player2Username;
                daGameRoom.gameID = i;
                let musIndex = Math.round(Math.random()*(fightPlaylist.length-1));
                let playerApiData = {player1: rooms[i].player1FetchedJson, player2:rooms[i].player2FetchedJson, musicSrc: fightPlaylist[musIndex], creditSrc:playlistCredits[musIndex]};
               // console.log(playerA[])
                gameRooms[i] = daGameRoom;
                //io.in(i).emit("initGame", rooms[i]);
                webSockets[rooms[i].player1ID].send(JSON.stringify({type:"initGame", payload:{ data: rooms[i], apiData: playerApiData}}));
                webSockets[rooms[i].player2ID].send(JSON.stringify({type:"initGame", payload:{ data: rooms[i], apiData: playerApiData}}));
                rooms[i] = undefined;
              },3000)
            },750); 
        }
        if (rooms[i].currentAmountReady != 2 && rooms[i].previousAmountReady == 2)
          {
            rooms[i].messageLog.push([`SYSTEM MESSAGE: TERMINATING INITIATION`, true]);
            ///io.in(i).emit("updateMessageLog", `SYSTEM MESSAGE: TERMINATING INITIATION`, true);
            webSockets[rooms[i].player1ID].send(JSON.stringify({ type: "updateMessageLog", payload: {message: "SYSTEM MESSAGE: TERMINATING INITIATION", isSystemMessage: true} }));
            webSockets[rooms[i].player2ID].send(JSON.stringify({ type: "updateMessageLog", payload: {message: "SYSTEM MESSAGE: TERMINATING INITIATION", isSystemMessage: true} }));
            if (gameCountdown)
             {
               clearTimeout(gameCountdown);
             }
          }
        rooms[i].previousAmountReady = rooms[i].currentAmountReady;
      }
      }
    }
  }, 0);
  ws.on("message", (message) => {
    try {
      const parsedMessage = JSON.parse(message);
      handleWebSocketMessage(ws, parsedMessage);
    } catch (error) {
      console.error("Failed to parse message:", error);
    }
  });

  ws.on("close", () => {
    console.log("A user disconnected");
    numUsers--;
    handleDisconnect(ws);
  });
});
  function submitMessage(ws, payload){
    let playerNumber = 0;
    let daRoom;
    let daMessage = "";
    for (let i in rooms)
      {
        if (rooms[i])
        {
        if ((rooms[i].player1ID == payload.id.split(" ")[0] || rooms[i].player2ID == payload.id.toString().split(" ")[0]) && !daRoom)
        {
          daRoom = rooms[i];
          if (rooms[i].player1ID == payload.id)
            {
              playerNumber = 1;
            }
          else
            {
              playerNumber = 2;
            }
          }
        }
      }
    if (playerNumber == 0)
      {
        console.log("Can't find parents")
      }
    else
      {
        //console.log(payload)
        if (payload.id.includes("SYSTEM_MESSAGE"))
          {
            daRoom.messageLog.push([`SYSTEM MESSAGE: ${payload.message}`, true]);
            daMessage = `SYSTEM MESSAGE: ${payload.message}`;
          }
        else
          {
        switch(playerNumber){
          case 1:
            daRoom.messageLog.push([`${daRoom.player1Username}: ${payload.message}`, false]);
            daMessage = `${daRoom.player1Username}: ${payload.message}`;
            break;
          case 2:
            daRoom.messageLog.push([`${daRoom.player2Username}: ${payload.message}`, false]);
            daMessage = `${daRoom.player2Username}: ${payload.message}`
            break;
        }
          }
        //console.log(daRoom.player1ID)
        webSockets[daRoom.player1ID].send(JSON.stringify({ type: "updateMessageLog", payload: {message: daMessage, isSystemMessage: payload.id.includes("SYSTEM_MESSAGE")} }));
        if (webSockets[daRoom.player2ID])
        {
        webSockets[daRoom.player2ID].send(JSON.stringify({ type: "updateMessageLog", payload: {message: daMessage, isSystemMessage: payload.id.includes("SYSTEM_MESSAGE")} }));
        }
        
        //io.in(daRoom.gameID).emit("updateMessageLog", daMessage, id.includes("SYSTEM_MESSAGE"));
      }
  }
function handleApiDetails(ws, payload)
{
  for (let i in rooms)
  {
    if (rooms[i])
    {
    if (rooms[i].player1ID == ws.id)
    {
      rooms[i].player1FetchedJson = payload;
    }
    if (rooms[i].player2ID == ws.id)
    {
      rooms[i].player2FetchedJson = payload;
    }
    }
  }
}
function handleWebSocketMessage(ws, { type, payload }) {
  switch (type) {
    case "createRoom":
      createRoom(ws, payload);
      break;
    case "joinRoom":
      joinRoom(ws, payload);
      break;
    case "sendApiDetails":
      handleApiDetails(ws, payload);
      break;
    case "readyClick":
      handleReadyClick(ws, payload);
      break;
    case "submitUsername":
      submitUsername(ws, payload);
      break;
    case "submitMessage":
      submitMessage(ws, payload);
      break;
    case "requestAvailableRooms":
      requestAvailableRooms(ws, payload);
      break;
    case "requestRoomData":
      requestRoomData(ws, payload);
      break;
    case "requestLeave":
      console.log(payload);
      requestLeave(ws,payload);
      break;
    case "requestKick":
      requestKick(ws, payload);
      webSockets[rooms[payload.roomID].player1ID].send(JSON.stringify({ type: "returnRoomRequest", payload: {room: rooms[payload.roomID]} }));
      break;
    case "requestSetBG":
      webSockets[gameRooms[payload.roomID].player1ID].send(JSON.stringify({ type: "returnBG", payload: {src: payload.source} }));
      webSockets[gameRooms[payload.roomID].player2ID].send(JSON.stringify({ type: "returnBG", payload: {src: payload.source} }));
      break;
    case "estimateCharacterStats":
  
      break;
    // GAME CASES
    case "setGameRoomPlayerID":
      //console.log(payload.playerNumber)
      if (payload.playerNumber == 1)
     {
       gameRooms[payload.roomID].player1ID = ws.id;
     }
    if (payload.playerNumber == 2)
    {
      gameRooms[payload.roomID].player2ID = ws.id;
    }
      ws.send(JSON.stringify({ type: "returnSocketID", payload: {id: ws.id} }));
      break;
    
    case "setGameRoomPlayerFighter":
      //console.log("gha")
      if (payload.playerNumber == 1)
     {
       gameRooms[payload.roomID].player1Fighter = payload.data;
     }
    if (payload.playerNumber == 2)
    {
      gameRooms[payload.roomID].player2Fighter = payload.data;
    }
      ws.send(JSON.stringify({ type: "returnSocketID", payload: {id: ws.id} }));
      break;
    case "needPlayerNumber":
      console.log("take a number")
     
      ws.send(JSON.stringify({type:"returnPlayerNumber", payload:{number:1}}));
      //io.to(socket.id).emit("returnPlayerNumber", daNumber)
      break;
    case "requestNametags":
      ws.send(JSON.stringify({type:"returnUsername", payload:{username:[gameRooms[payload.roomID].player1Username, gameRooms[payload.roomID].player2Username]}}))
    break;
    case "claimNumber":
      ws.send(JSON.stringify({type:"returnPlayerNumber", payload:{number:1}}));
      break;
    case "publishInfo":
      let daRoom = rooms[payload.roomID];
    if (!daRoom) return;

    if (payload.data.playerNumber === 1) {
      daRoom.player1Fighter = payload.data;
    } else if (payload.data.playerNumber === 2) {
      daRoom.player2Fighter = payload.data;
    }

    players.push(payload.data);
      break;
    case "infoSend":
      let daRoom2 = rooms[payload.roomID];
    if (!daRoom2) return;

    if (players[payload.number]) {
      players[payload.number].inputs = payload.data;
      playerInputs[payload.number] = payload.data;
    }
      break;
    case "keyDown":
      keyDown(ws, payload);
      break;
    case "keyUp":
      keyUp(ws, payload);
      break;
    case "requestGameStart":
      requestGameStart(ws, payload);
      break;
    case "requestPunchCooldownChange":
      let daPlayers = [gameRooms[payload.roomID].player1Fighter, gameRooms[payload.roomID].player2Fighter];
        daPlayers[payload.number].currentPunchCooldown = payload.time;
      break;
    case "requestPlayerDamage":
        let daPlayers2 = [gameRooms[payload.roomID].player1Fighter, gameRooms[payload.roomID].player2Fighter];
       // daPlayers2[payload.number].health -= payload.damage;
      if (!payload.shielded)
          {
          daPlayers2[payload.number].health -= payload.damage;
          }
          else
          {
            daPlayers2[payload.number].shieldHealth--;
            if (daPlayers2[payload.number].shieldHealth == 0)
            {
              //players[i].shieldBreakAudio.play();
              daPlayers2[payload.number].shieldCooldown = 150;
              //setTimeout(function(){daPlayers2[payload.number].shieldHealth = 20}, 30000)
            }
            
          }
      break;
    case "requestKnockback":
      let daPlayers3 = [gameRooms[payload.roomID].player1Fighter, gameRooms[payload.roomID].player2Fighter];
          daPlayers3[payload.number].stunned = true;
          daPlayers3[payload.number].knockBackX = payload.x;
          daPlayers3[payload.number].knockBackY = payload.y;
          daPlayers3[payload.number].velocityY = 0;
      break;
    case "sendDataToPlayer":
      ws.send(JSON.stringify({type:"returnData", payload:{number: payload.number, data: playerInputs}}));
      break;
    case "ready":
      ready(ws,payload);
      break;
    case "freezePlayer":
      let daPlayers4 = [gameRooms[payload.roomID].player1Fighter, gameRooms[payload.roomID].player2Fighter];
      daPlayers4[payload.number].frozen = true;
      daPlayers4[payload.number].iceHealth = 20;
      //console.log("Let it go")
      break;
    
    case "removeLaserFromServer":
      //console.log(gameRooms[payload.roomID].lasers);
      for (let i in gameRooms[payload.roomID].lasers)
       {
          if (gameRooms[payload.roomID].lasers[i].owner = payload.laser.owner && gameRooms[payload.roomID].lasers[i].velocityX == payload.lasers.velocityX && gameRooms[payload.roomID].lasers[i].velocityY == payload.lasers.velocityY && gameRooms[payload.roomID].lasers[i].x == payload.lasers.x && gameRooms[payload.roomID].lasers[i].y == payload.lasers.y && gameRooms[payload.roomID].lasers[i].angle == payload.lasers.angle && gameRooms[payload.roomID].lasers[i].aliveTime == payload.lasers.aliveTime && gameRooms[payload.roomID].lasers[i].isIceBreath == payload.lasers.isIceBreath)
            {
              gameRooms[payload.roomID].lasers.splice(i,1);
            }
       }
      //console.log(gameRooms[payload.roomID].lasers.filter((item) => item !== payload.laser));
      break;
    default:
      console.log("Unknown message type:", type);
  }
}

function keyDown(ws, {roomID, number, input}){
  let daPlayers = [gameRooms[roomID].player1Fighter, gameRooms[roomID].player2Fighter];
    //console.log(input)
    
    if (!gameRooms[roomID].forbiddenPlayerInputs[number].includes(input))
    {
      if (input == "laser" || input == "iceBreath")
       {
        // console.log(input);
       }
    if (!gameRooms[roomID].playerInputs[number].includes(input)) {
      daPlayers[number].inputs.push(input);
      gameRooms[roomID].playerInputs[number].push(input);
      if (input == "laser" || input == "iceBreath" || input == "punch")
       {
         //console.log(input)
         gameRooms[roomID].forbiddenPlayerInputs[number].push(input);
       }
    }
    }
  else
    {
      if (gameRooms[roomID].playerInputs[number].includes(input))
      {
        gameRooms[roomID].playerInputs[number] = gameRooms[roomID].playerInputs[number].filter((item) => item !== input);
    daPlayers[number].inputs = daPlayers[number].inputs.filter((item) => item !== input);
      }
    }
}

function keyUp(ws, {roomID, number, input}){
 let daPlayers = [gameRooms[roomID].player1Fighter, gameRooms[roomID].player2Fighter];

    gameRooms[roomID].playerInputs[number] = gameRooms[roomID].playerInputs[number].filter((item) => item !== input);
    daPlayers[number].inputs = daPlayers[number].inputs.filter((item) => item !== input); 
    gameRooms[roomID].forbiddenPlayerInputs[number] = gameRooms[roomID].forbiddenPlayerInputs[number].filter((item) => item !== input);
}

function requestGameStart(ws, {roomID})
{
  gameRooms[roomID].amountReady++;
    
    if (gameRooms[roomID].amountReady == 2)
    {
      //io.in(roomID).emit('beginGame');
      //console.log(gameRooms[roomID]);
      webSockets[gameRooms[roomID].player1ID].send(JSON.stringify({type:"beginGame"}))
      webSockets[gameRooms[roomID].player2ID].send(JSON.stringify({type:"beginGame"}))
      gameRooms[roomID].unPause = true;
      let daPlayers = [gameRooms[roomID].player1Fighter, gameRooms[roomID].player2Fighter];
      
      console.log(daPlayers[0])
      
      var myInterval = setInterval(function(){
              //console.log(deltaTime);
      let playerX = daPlayers[0].x;
      tick(roomID);
      //console.log(deltaTime)
      if (daPlayers[0].x != playerX)
      {
        //console.log(players[0].x)
      }
      let oldPlayer1Inputs = daPlayers[0].inputs;
      let oldPlayer2Inputs = daPlayers[1].inputs;
        let playersToUpdate = [];
      if (gameRooms[roomID].oldPlayerData[0] != daPlayers[0]){
          playersToUpdate.push(daPlayers[0])
      }
      if (gameRooms[roomID].oldPlayerData[1] != daPlayers[1])
      {
        playersToUpdate.push(daPlayers[1])
      }
      //daPlayers[0].inputs = daPlayers[0].inputs.filter((item) => item.includes("punch"));
      //daPlayers[1].inputs = daPlayers[1].inputs.filter((item) => item.includes("punch"));
      
      if (playersToUpdate.length>0)
      {
      //io.in(roomID).emit("updatePlayerInfo", [daPlayers[0],daPlayers[1]]);
        if (webSockets[gameRooms[roomID].player1ID])
        {
        webSockets[gameRooms[roomID].player1ID].send(JSON.stringify({type:"updatePlayerInfo", payload:{data:[daPlayers[0], daPlayers[1]]}}))
        }
        if (webSockets[gameRooms[roomID].player2ID])
        {
        webSockets[gameRooms[roomID].player2ID].send(JSON.stringify({type:"updatePlayerInfo", payload:{data:[daPlayers[0], daPlayers[1]]}}))
        }
      }
      daPlayers[0].inputs = oldPlayer1Inputs;
      daPlayers[1].inputs = oldPlayer2Inputs;
        
    }, 1/240*1000);
    }
}

function ready(ws, {roomID, number}){
  let daRoom = rooms[roomID];
    if (!daRoom) return;

    //daRoom.amountReady++;
    //io.to(roomID).emit('updateReadyCount', daRoom.amountReady);

    if (daRoom.amountReady === 2) {
      daRoom.player1Fighter.x = 50;
      daRoom.player1Fighter.y = 0;
      daRoom.player2Fighter.x = 249;
      daRoom.player2Fighter.y = 0;

      daRoom.player1Fighter.health = daRoom.player1Fighter.maxHealth;
      daRoom.player2Fighter.health = daRoom.player2Fighter.maxHealth;

      //io.to(roomID).emit('beginGame');
      webSockets[gameRooms[roomID].player1ID].send(JSON.stringify({type:"beginGame"}))
      webSockets[gameRooms[roomID].player2ID].send(JSON.stringify({type:"beginGame"}))
      daRoom.tickInterval = setInterval(function () {
        console.log("aa"); tick(daRoom.gameID);
      }, 1 / 240 * 1000);
    }
}

function requestKick(ws, payload)
{
  //console.log("GAWRSH")
    //console.log(gameID)
    //io.to(rooms[gameID].player2ID).emit("kick", `${reason}`);
    webSockets[rooms[roomIDS[roomOwnerIDS.indexOf(ws.id)]].player2ID].send(JSON.stringify({type:"kick", payload:{reason:payload.reason}}));
    rooms[payload.roomID].peopleReady[rooms[payload.roomID].player2ID] = false;
    let amountReady = 0;
    for (let i in rooms[payload.roomID].peopleReady)
    {
      if (rooms[payload.roomID].peopleReady[i])
      {
        amountReady++;
      }
    }
    //io.in(gameID).emit("updateReadyCount", amountReady);
    webSockets[rooms[payload.roomID].player1ID].send(JSON.stringify({ type: "updateReadyCount", payload: {amount:amountReady} }));
      rooms[payload.roomID].messageLog.push([`SYSTEM MESSAGE: ${rooms[payload.roomID].player1Username} kicked ${rooms[payload.roomID].player2Username} out of the room for the following reason: ${payload.reason}`, true]);
        //io.in(rooms[gameID].gameID).emit("updateMessageLog", `SYSTEM MESSAGE: ${rooms[gameID].player1Username} kicked ${rooms[gameID].player2Username} out of the room for the following reason: ${reason}`, true);
      webSockets[rooms[payload.roomID].player1ID].send(JSON.stringify({ type: "updateMessageLog", payload: {message: `SYSTEM MESSAGE: ${rooms[payload.roomID].player1Username} kicked ${rooms[payload.roomID].player2Username} out of the room for the following reason: ${payload.reason}`, isSystemMessage: true} }));
    if (payload.blacklisted)
     {
       console.log("oiajsoijfioasj")
       //io.to(rooms[gameID].player2ID).emit("blacklisted", gameID);
       webSockets[rooms[payload.roomID].player2ID].send(JSON.stringify({type:"blacklisted", payload:{roomCode: payload.roomID}}))
     }
  //console.log("ASSAODKS " + payload.blacklisted)
    //updateRoomLog();
    rooms[payload.roomID].player2ID = "";
        rooms[payload.roomID].player2Username = "";
        rooms[payload.roomID].numUsers--;
    updateRoomLog();
    //console.log(rooms[gameID])  
}

function requestLeave(ws, payload)
{
  let daNumber = 1;
  //console.log(payload)
  //console.log(rooms[payload.roomID].player2ID )
  console.log(payload.roomID)
  if (rooms[payload.roomID])
  {
  if (rooms[payload.roomID].player2ID)
  {
    if (rooms[payload.roomID].player2ID == ws.id)
    {
      daNumber = 2;
      rooms[payload.roomID].peopleReady[rooms[payload.roomID].player2ID] = false;
      let amountReady = 0;
    for (let i in rooms[payload.roomID].peopleReady)
    {
      if (rooms[payload.roomID].peopleReady[i])
      {
        amountReady++;
      }
    }
    //io.in(roomID).emit("updateReadyCount", amountReady);
    webSockets[rooms[payload.roomID].player1ID].send(JSON.stringify({ type: "updateReadyCount", payload: {amount: amountReady} }));
    }
  }
    
    switch(daNumber){
      case 1:
        let index = roomOwnerIDS.indexOf(ws.id);
        //console.log(`wowowiwow ${rooms[roomIDS[roomOwnerIDS.indexOf(socket.id)]].player1ID}`)
        console.log(`woops. gotta start kicking ${rooms[payload.roomID].player2ID} in room ${payload.roomID}. PLAYER 1 LEFT :D`)
        //io.to(rooms[roomID].player2ID).emit("kick", "Host has left the game.");
        if (rooms[payload.roomID])
        {
        if (rooms[payload.roomID].player2ID)
        {
        webSockets[rooms[payload.roomID].player2ID].send(JSON.stringify({type:"kick", payload:{reason:"Host has left the game."}}));
        }
        }
        //console.log(rooms[roomIDS[roomOwnerIDS.indexOf(socket.id)]]);
        //rooms[payload.roomID].player1ID = "";
        rooms[payload.roomID] = null;
        roomOwnerIDS = roomOwnerIDS.splice(index,1);
        roomIDS = roomIDS.splice(index,1);
      //console.log("APAAOPKAPOKA")
          //console.log(rooms[payload.roomID]);
    //console.log(rooms);
        
        updateRoomLog();
        break;
      case 2:
        rooms[payload.roomID].player2ID = "";
        rooms[payload.roomID].player2Username = "";
        rooms[payload.roomID].numUsers--;
        rooms[payload.roomID].messageLog.push([`SYSTEM MESSAGE: ${sockets[ws.id].username} left the room!`, true]);
        //io.in(rooms[roomID].gameID).emit("updateMessageLog", `SYSTEM MESSAGE: ${sockets[playerID].username} left the room!`, true);
        webSockets[rooms[payload.roomID].player1ID].send(JSON.stringify({ type: "updateMessageLog", payload: {message: `SYSTEM MESSAGE: ${sockets[ws.id].username} left the room!`, isSystemMessage: true} }));
        webSockets[rooms[payload.roomID].player1ID].send(JSON.stringify({ type: "returnRoomRequest", payload: {room: rooms[payload.roomID]} }));
        //webSockets[rooms[payload.roomID].player2ID].send(JSON.stringify({ type: "updateMessageLog", payload: {message: `SYSTEM MESSAGE: ${sockets[ws.id].username} left the room!`, isSystemMessage: true} }));
        updateRoomLog();
        break;
    }
  }
  webSockets[ws.id].send(JSON.stringify({ type: "finishLeave", payload: {} }));
  updateRoomLog();
}

function requestRoomData(ws, {roomID, socketID}){
  console.log(rooms[roomID])
  ws.send(JSON.stringify({ type: "returnRoomRequest", payload: {room: rooms[roomID]} }));
}

function handleDisconnect(ws) {
  const index = socketsNumberList.indexOf(sockets[ws.id]);
  for (let i in gameRooms)
  {
    if (gameRooms[i].player1ID == ws.id)
    {
      if (gameRooms[i].player1Fighter)
      {
      gameRooms[i].player1Fighter.health = 0;
        if (webSockets[gameRooms[i].player2ID])
        {
      webSockets[gameRooms[i].player2ID].send(JSON.stringify({type: "disconnectMessage", payload:{msg: `${gameRooms[i].player2Username} left the game`}}))
        }
      }
    }
    if (gameRooms[i].player2ID == ws.id)
    {
      if (gameRooms[i].player2Fighter)
      {
      gameRooms[i].player2Fighter.health = 0;
        if (webSockets[gameRooms[i].player1ID])
        {
      webSockets[gameRooms[i].player2ID].send(JSON.stringify({type: "disconnectMessage", payload:{msg: `${gameRooms[i].player1Username} left the game`}}))
        }
      }
    }
  }
  for (let i in rooms)
    {
      //console.log(i+ ", "+ rooms[i])
      if (rooms[i])
      {
      if (rooms[i].player2ID == ws.id)
      {
        rooms[i].player2ID = "";
        rooms[i].player2Username = "";
        rooms[i].numUsers--;
        if (!rooms[i].initiatingGame)
        {
      rooms[i].messageLog.push([`SYSTEM MESSAGE: ${sockets[ws.id].username} left the room!`, true]);
        //io.in(rooms[i].gameID).emit("updateMessageLog", `SYSTEM MESSAGE: ${sockets[socket.id].username} left the room!`, true);
          if (webSockets[rooms[i].player1ID])
           {
        webSockets[rooms[i].player1ID].send(JSON.stringify({ type: "updateMessageLog", payload: {message: `SYSTEM MESSAGE: ${sockets[ws.id].username} left the room!`, isSystemMessage: true} }));
           }
        }
        //webSockets[rooms[i].player2ID].send(JSON.stringify({ type: "updateMessageLog", payload: {message: `SYSTEM MESSAGE: ${sockets[ws.id].username} left the room!`, isSystemMessage: true} }));
        
        
        
    updateRoomLog();
      }
      }
    }
   
    
  if (index !== -1) {
    if (rooms[roomIDS[roomOwnerIDS.indexOf(ws.id)]])
    {
      if (rooms[roomIDS[roomOwnerIDS.indexOf(ws.id)]].player2ID)
      {
        //io.to(rooms[roomIDS[roomOwnerIDS.indexOf(socket.id)]].player2ID).emit("kick", "Host has left the game.");
        webSockets[rooms[roomIDS[roomOwnerIDS.indexOf(ws.id)]].player2ID].send(JSON.stringify({type:"kick", payload:{reason:"Host has left the game."}}));
      }
    }
    
    //console.log(rooms[roomIDS[roomOwnerIDS.indexOf(ws.id)]]);
      
    rooms[roomIDS[roomOwnerIDS.indexOf(ws.id)]] = undefined;
    roomOwnerIDS = roomOwnerIDS.splice(index,1);
    roomIDS = roomIDS.splice(index,1);
      
    //console.log(rooms);
    
    
    updateRoomLog();
    numUsers--;
    socketsNumberList.splice(index, 1);
    sockets[ws.id] = undefined;
    delete webSockets[ws.id];
  }
  // Handle room cleanup or user-specific logic
}
function submitUsername (ws, {id, name}){
  
  if (socketsNumberList[socketsNumberList.indexOf(sockets[ws.id])])
      {
        socketsNumberList[socketsNumberList.indexOf(sockets[ws.id])].username = name;
    sockets[ws.id].username = name;
        //console.log(name)
      }
}
function requestAvailableRooms(ws, {id }){
  let availableRooms = [];
    let totalRooms = [];
    for (let i in rooms){
     if (rooms[i] != null && rooms[i] != undefined){
       if(rooms[i].numUsers != 2)
        {
          totalRooms.push(rooms[i]);
          if (!rooms[i].isPrivate)
          {
            availableRooms.push(rooms[i]);
          }
        }
     }
    }
    
    currentRoomsAvaliable = availableRooms;
    
    ws.send(JSON.stringify({ type: "returnRooms", payload: {rooms: availableRooms, totalRooms: totalRooms} }));
}

function updateRoomLog(){
  let availableRooms = [];
    let totalRooms = [];
  let nonNullRooms = [];
  //let rooms = rooms.filter((item) => item.player1ID != "")
    for (let i in rooms){
      //console.log('uiu')
      //console.log(rooms[i])
      if (!rooms[i])
      {
        //console.log("oh hnos ")
        //console.log(i)
      }
     if (rooms[i]){
       
       nonNullRooms[i] = rooms[i]
       if(rooms[i].numUsers != 2 && rooms[i].player1ID != "")
        {
          totalRooms.push(rooms[i]);
          if (!rooms[i].isPrivate)
          {
            availableRooms.push(rooms[i]);
          }
        }
     }
      //rooms = nonNullRooms;
    }
    
    currentRoomsAvaliable = availableRooms;
  for (let i in webSockets)
    {
    webSockets[i].send(JSON.stringify({ type: "returnRooms", payload: {rooms: availableRooms, totalRooms: totalRooms} }));
    }
}
function createRoom(ws, { isPrivate }) {
  let daRoom = new Room();
    daRoom.player1ID = ws.id;
    daRoom.gameID = makeid(5);
    daRoom.numUsers = 1;
    daRoom.player1Username = sockets[ws.id].username
    daRoom.messageLog = [];
    daRoom.isPrivate = isPrivate;
    daRoom.peopleReady = [];
    daRoom.currentAmountReady = 0;
    daRoom.previousAmountReady = 0;
    daRoom.initiatingGame = false;
    while (rooms[daRoom.gameID] != null) {
      daRoom.gameID = makeid(5);
    }
    //console.log(daRoom)
    rooms[daRoom.gameID] = daRoom;
    roomIDS.push(daRoom.gameID);
    roomOwnerIDS.push(daRoom.player1ID);
  updateRoomLog();
  ws.send(JSON.stringify({ type: "returnRoomRequest", payload: {room: daRoom} }));
  ws.send(JSON.stringify({ type: "roomCreated", payload: daRoom.gameID }));
  console.log(`Room ${daRoom.gameID} created by ${ws.id}`);
}

function joinRoom(ws, { roomID }) {
  const room = rooms[roomID];
  if (!room) {
    ws.send(JSON.stringify({ type: "error", payload: "Room does not exist" }));
    return;
  }

  if (!room.player2ID) {
    room.numUsers++;
    room.player2ID = ws.id;
    room.player2Username = sockets[ws.id].username
    ws.send(JSON.stringify({ type: "roomJoined", payload: roomID }));
    webSockets[room.player1ID].send(JSON.stringify({ type: "returnRoomRequest", payload: {room: room} }));
    webSockets[room.player2ID].send(JSON.stringify({ type: "returnRoomRequest", payload: {room: room} }));
    room.messageLog.push([`SYSTEM MESSAGE: ${room.player2Username} joined the room!`, true]);
    webSockets[room.player1ID].send(JSON.stringify({ type: "updateMessageLogByList", payload: {messageLog: room.messageLog} }));
    webSockets[room.player2ID].send(JSON.stringify({ type: "updateMessageLogByList", payload: {messageLog: room.messageLog} }));
    updateRoomLog();
    console.log(`Player ${ws.id} joined Room ${roomID}`);
  } else {
    ws.send(JSON.stringify({ type: "error", payload: "Room is full" }));
  }
}

function handleReadyClick(ws, { roomID, isReady }) {
  console.log(roomID)
  const room = rooms[roomID];
  if (!room) return;
  //console.log("succ")
  room.peopleReady[ws.id] = isReady;
  const amountReady = Object.values(room.peopleReady).filter(Boolean).length;
  //console.log(amountReady);
  /*wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({ type: "updateReadyCount", payload: amountReady })
      );
    }
  });*/
  webSockets[rooms[roomID].player1ID].send(JSON.stringify({ type: "updateReadyCount", payload: {amount: amountReady} }));
  if (rooms[roomID].player2ID)
  {
    if (rooms[roomID].player2ID != "")
    {
      webSockets[rooms[roomID].player2ID].send(JSON.stringify({ type: "updateReadyCount", payload: {amount: amountReady} }));      
    }
  }
}

// Serve static files
app.use(express.static("public"));

// Basic routing
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
