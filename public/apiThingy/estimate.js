function analyzeCharacter(description){
  let defaultSpeed = 20;
  let abilities = [];
  let defaultHealth = 100;
  let lowercaseDesc = description.toLowerCase();
  let defaultMoveset = ["punch"];
  let attack = 5;
  let defense = 3;
  
  if (description.includes("flight") || description.includes("can fly") || description.includes("is able to fly") || description.includes("jet pack") || description.includes("jetpack") || description.includes("jet-pack") || description.includes("can levitate") || description.includes("is able to levitate") || description.includes("levitation"))
    {
      if (!description.includes("th flight") && !description.includes("flight list"))
      {
      abilities.push("flight");
      }
    }
  if (description.includes("run fast") || description.includes("sprint fast") || description.includes("speed"))
    {
      defaultSpeed += 5;
      if (description.includes("superhuman speed") || description.includes("super-human speed") || description.includes("super human speed"))
      {
        defaultSpeed += 10;
      }
    }
  if (description.includes("is slow") || description.includes("pretty slow") || description.includes("pretty much slow") || description.includes("generally slow"))
  {
      defaultSpeed -= 2.5;
      if (description.includes("is very slow") || description.includes("is really slow"))
      {
        defaultSpeed-=5;
      }
  }
  if (description.includes("stamina") && !description.includes("low stamina"))
  {
    defaultHealth += 100;
  }
  if (description.includes("low stamina"))
  {
    defaultHealth -= 25;
  }
  if (description.includes("has a shield") || description.includes("equips a shield") || description.includes("shield") || description.includes("uses a shield") || description.includes("use a shield"))
  {
    defaultMoveset.push("shield");
    defense+= 1;
  }
  if (description.includes("strength") || description.includes("is strong") || description.includes("is very strong") || description.includes("has strength") || description.includes("is pretty strong") || description.includes("pretty much strong") || description.includes("generally strong") || description.includes("combatist") || description.includes("martial artist"))
  {
    attack += 5;
    defense += 2;
    if (description.includes("superhuman strength") || description.includes("super human strength") || description.includes("super-human strength"))
    {
        attack += 8;
        defense += 2;
    }
  }
  if (description.includes("is weak") || description.includes("pretty weak") || description.includes("pretty much weak") || description.includes("generally weak"))
  {
    attack -= 2;
    defense -= 2;
    if (description.includes("is very weak") || description.includes("is really weak"))
      {
        attack -= 2;
        defense--;
      }
  }
  if (description.includes("heat vision") || description.includes("laser vision") || description.includes("lazer vision") || description.includes("heatvision") || description.includes("heat-vision") || description.includes("laser-vision") || description.includes("lazer-vision") || description.includes("laservision") || description.includes("lazervision") || description.includes("eye laser"))
  {
    if (!description.includes("'s heat vision") && !description.includes("'s laser vision"))
    {
      defaultMoveset.push("laser")
    }
  }
  if (description.includes("ice vision") || description.includes("cold vision") || description.includes("arctic vision") || description.includes("cryokinetic vision") || description.includes("cryokinesis") || description.includes("manipulate cold") || description.includes("manipulate ice") || description.includes("manipulate the cold") || description.includes("manipulate the ice") || description.includes("ice breath") || description.includes("arctic breath") || description.includes("cryokinetic breath"))
  {
    if (!description.includes("'s ice vision") && !description.includes("'s freeze vision") && !description.includes("'s cold vision") && !description.includes("'s cryokinetic vision") && !description.includes("'s ice breath") && !description.includes("'s freeze breath"))
    {
      defaultMoveset.push("iceBreath")
    }
  }
  //alert(`Name: ${chosenTitle}. ${JSON.stringify({speed: defaultSpeed, abilities, health: defaultHealth, moveset: defaultMoveset, attack, defense})}`);
  if (window.location == 'https://cartoon-clash.glitch.me/onlineLobby.html')
  {
  ws.send(JSON.stringify({type: "sendApiDetails", payload:{name: chosenTitle, image: chosenImage, speed: defaultSpeed, abilities, health: defaultHealth, moveset: defaultMoveset, attack, defense}}))
  enableReadyButton();
  }
  else
  {
    singlePlayerData.push({name: chosenTitle, image: chosenImage.split("/revision")[0], speed: defaultSpeed, abilities, health: defaultHealth, moveset: defaultMoveset, attack, defense})
  }
  return {speed: defaultSpeed, abilities, health: defaultHealth, moveset: defaultMoveset, attack, defense}
}