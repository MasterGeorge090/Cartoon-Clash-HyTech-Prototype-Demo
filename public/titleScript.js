let characterReady = false;
let amountOfTimeCreditsShown = 0;
let menuPlaylist = [
  "https://cdn.glitch.global/8682bce0-587a-4e77-b4f1-d6bfb8e7389c/y2mate.com%20-%20Menu%202%20%20Super%20Smash%20Bros%20Melee.mp3?v=1733680291563",
  "https://cdn.glitch.global/8682bce0-587a-4e77-b4f1-d6bfb8e7389c/y2mate.com%20-%20SpongeBob%20SquarePants%20Production%20Music%20%20The%20Lineman%20Full%20version.mp3?v=1733688571642",
  "https://cdn.glitch.global/8682bce0-587a-4e77-b4f1-d6bfb8e7389c/y2mate.com%20-%20Street%20Fighter%203rd%20Strike%20OST%203rd%20Strike%20by%20Infinite.mp3?v=1733688978002",
  "https://cdn.glitch.global/8682bce0-587a-4e77-b4f1-d6bfb8e7389c/y2mate.com%20-%20Chip%20Skylark%20%20My%20Shiny%20Teeth%20and%20Me.mp3?v=1733690729672",
  "https://cdn.glitch.global/8682bce0-587a-4e77-b4f1-d6bfb8e7389c/y2mate.com%20-%20Danny%20Phantom%20Theme%20Instrumental%20No%20Billionfold.mp3?v=1733691607011"
  
]
let playlistCredits = [
  "https://cdn.glitch.global/8682bce0-587a-4e77-b4f1-d6bfb8e7389c/Menu2.png?v=1733684602778",
  "https://cdn.glitch.global/8682bce0-587a-4e77-b4f1-d6bfb8e7389c/TheLineMan.png?v=1733688339480",
  "https://cdn.glitch.global/8682bce0-587a-4e77-b4f1-d6bfb8e7389c/3rdStrikeTheme.png?v=1733689337983",
  "https://cdn.glitch.global/8682bce0-587a-4e77-b4f1-d6bfb8e7389c/MyShinyTeeth.png?v=1733690721017",
  "https://cdn.glitch.global/8682bce0-587a-4e77-b4f1-d6bfb8e7389c/DannyPhantomThemeInstrumental.png?v=1733687583921"
]
let fightPlaylist = [
  "https://cdn.glitch.global/5dc85c69-4523-4b77-a54c-c3bf09afefaf/StadiumCombat.mp3?v=1731978201363",
  "https://cdn.glitch.global/8682bce0-587a-4e77-b4f1-d6bfb8e7389c/y2mate.com%20-%20Ed%20Edd%20n%20Eddy%20Soundtrack%20%20Background%20Music%203%20HQ%20Audio.mp3?v=1733706756712",
  "https://cdn.glitch.global/8682bce0-587a-4e77-b4f1-d6bfb8e7389c/y2mate.com%20-%20The%20Beets%20%20%20Killer%20Tofu%20Best%20Audio%20Quality.mp3?v=1733707409478",
  "https://cdn.glitch.global/8682bce0-587a-4e77-b4f1-d6bfb8e7389c/y2mate.com%20-%20Yakety%20Sax%20Music.mp3?v=1733707217356",
  "https://cdn.glitch.global/8682bce0-587a-4e77-b4f1-d6bfb8e7389c/y2mate.com%20-%20Dragon%20ball%20Z%20soundtrack%20Battle%20theme%20Fight%20music.mp3?v=1733708367511"
]
let fightCredits = [
  "https://cdn.glitch.global/5dc85c69-4523-4b77-a54c-c3bf09afefaf/StadiumRaveMortalKombat.png?v=1731972949601",
  "https://cdn.glitch.global/8682bce0-587a-4e77-b4f1-d6bfb8e7389c/BGM3.png?v=1733684581768",
  "https://cdn.glitch.global/8682bce0-587a-4e77-b4f1-d6bfb8e7389c/KillerTofu.png?v=1733684593696",
  "https://cdn.glitch.global/8682bce0-587a-4e77-b4f1-d6bfb8e7389c/YacketySax.png?v=1733684604877",
  "https://cdn.glitch.global/8682bce0-587a-4e77-b4f1-d6bfb8e7389c/DragonBallBattle.png?v=1733708381110"
]
let playlistIndex = Math.round(Math.random() * (Math.max(0,menuPlaylist.length-1)))
let fightIndex = Math.round(Math.random() * (Math.max(0,fightPlaylist.length-1)))
let currentIndex = playlistIndex;
let menuMusic = new Audio(menuPlaylist[playlistIndex]);
let clickAudio = new Audio("")
let singlePlayerData = [];
let currentTime = 0;
let fadeIn = true;
let loadingSomething = false;

menuMusic.play();
document.querySelector("#songCredits").setAttribute("src", playlistCredits[playlistIndex]);
//document.querySelector("#songCredits").style.animation = "songLabel 5s forwards ease";
amountOfTimeCreditsShown++;
setInterval(function(){
      currentTime+= 1/240;
      if (fadeIn)
      {
      document.querySelector("#fadeToBlack").style.opacity = Math.max(0, document.querySelector("#fadeToBlack").style.opacity- 1/240);
      }
      if (document.querySelector("#fadeToBlack").style.opacity <= 0)
      {
        if (!loadingSomething)
        {
        document.querySelector("#fadeToBlack").style.display = "none";
        }
      document.querySelector("#songCredits").style.animation = "songLabel 5s forwards ease";
        fadeIn = false;
      }
    },0)
function initGame()
{
  let hasFetchedYet = false;
  if (Math.random() > 0.5)
  {
    FetchMaleCategory()
  }
  else
  {
    FetchMaleCategory()
  }
  loadingSomething = true
  let beginningGame = false;
  let currentTime = 0;
  
  setInterval(function(){
    currentTime += 1/240;
    menuMusic.volume = Math.max(menuMusic.volume-1/240,0);
    document.querySelector("#fadeToBlack").style.display = "block";
    document.querySelector("#fadeToBlack").style.opacity = `${Math.min(currentTime,1)*100}%`;    
    if (document.querySelector("#fadeToBlack").style.opacity >= 1)
    {
      document.querySelector("#loadingScreen").style.display = "block";
    }
    if (singlePlayerData.length > 0 && !hasFetchedYet)
    {
      hasFetchedYet = true;
      FetchMaleCategory();
    }
    if (singlePlayerData.length == 2 && !beginningGame)
    {
      beginningGame = true;
      let apiData = {player1: singlePlayerData[0], player2:singlePlayerData[1], musicSrc: fightPlaylist[fightIndex], creditSrc:fightCredits[fightIndex]};
      //alert(JSON.stringify(apiData))
      sessionStorage.setItem("fighterDetails", JSON.stringify(apiData))
      //alert(apiData);
      window.location = "singleplayerBattle.html";
    }
  }, 0)
}
function travelOnline()
{
  
  let currentTime = 0;
  loadingSomething = true;
  setInterval(function(){
    currentTime += 1/240;
    menuMusic.volume = Math.max(menuMusic.volume-1/240,0);
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
menuMusic.addEventListener("ended", function(){
  playlistIndex = Math.round(Math.random() * (Math.max(0,menuPlaylist.length-1)))
  menuMusic.src= menuPlaylist[playlistIndex];
  menuMusic.play();
  document.querySelector("#songCredits").setAttribute("src", playlistCredits[playlistIndex]);
  if (amountOfTimeCreditsShown % 2 == 1)
  {
    document.querySelector("#songCredits").style.animation = "songLabel1 5s forwards ease";
  }
  else
  {
    document.querySelector("#songCredits").style.animation = "songLabel 5s forwards ease";
  }
  amountOfTimeCreditsShown++;
});

let tutorialIsVisible = document.querySelector("#tutorialPopup").style.display != "none";
let previousFrameTutorialVisible = document.querySelector("#tutorialPopup").style.display != "none";
setInterval(function(){
  tutorialIsVisible = document.querySelector("#tutorialPopup").style.display != "none";
  if (!loadingSomething)
   {
  if (document.querySelector("#tutorialPopup").style.display != "none")
  {
    menuMusic.volume = Math.max(menuMusic.volume-1/240, 0);
    if (tutorialIsVisible != previousFrameTutorialVisible)
    {
    document.querySelector("#tutorialVideo").play();
    }
  }
  else
  {
    menuMusic.volume = Math.min(menuMusic.volume+1/240, 1);
    if (tutorialIsVisible != previousFrameTutorialVisible)
     {
    document.querySelector("#tutorialVideo").pause();
     }
  }
   }
  previousFrameTutorialVisible = document.querySelector("#tutorialPopup").style.display != "none";
  
}, 0)

function playCreditsAnimation()
{
}