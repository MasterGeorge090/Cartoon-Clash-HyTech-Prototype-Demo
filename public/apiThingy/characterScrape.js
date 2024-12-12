let chosenIndex;
let chosenTitle;
let chosenImage;
let chosenDescription;
//let characterImage;

//FetchMaleCategory();

function FetchMaleCategory()
{
  
  chosenIndex = Math.round(Math.random()*335);
  var url = "https://en.wikipedia.org/w/api.php"; 

var params = {
    action: "query",
    list: "categorymembers",
    cmtitle: "Category:Male_characters_in_animated_television_series",
    cmlimit: "335",
    format: "json"
};

url = url + "?origin=*";
Object.keys(params).forEach(function(key){url += "&" + key + "=" + params[key];});

fetch(url)
    .then(function(response){return response.json();})
    .then(function(response) {
        var pages = response.query.categorymembers;
  
            chosenTitle = pages[chosenIndex].title
           //alert(chosenTitle)
  //alert(pages[chosenIndex].pageid)
    FetchPage(pages[chosenIndex].pageid);
    return pages[chosenIndex].title;
            //FetchPage(pages[chosenIndex].pageid);
    })
    .catch(function(error){console.log(error);});
}
function FetchFemaleCategory()
{
  var url = "https://en.wikipedia.org/w/api.php"; 
chosenIndex = Math.round(Math.random()*145);
var params = {
    action: "query",
    list: "categorymembers",
    cmtitle: "Category:Female_characters_in_animation",
    cmlimit: "145",
    format: "json"
};

url = url + "?origin=*";
Object.keys(params).forEach(function(key){url += "&" + key + "=" + params[key];});

fetch(url)
    .then(function(response){return response.json();})
    .then(function(response) {
        var pages = response.query.categorymembers;
  
            chosenTitle = pages[chosenIndex].title
            //alert(chosenTitle)
  //alert(pages[chosenIndex].pageid)
    //document.querySelector("#name").textContent = chosenTitle;
  
            FetchPage(pages[chosenIndex].pageid);
    })
    .catch(function(error){console.log(error);});
}

function FetchPage(daID)
{
  //document.querySelector("#pfp").src = "";
  //alert('assy')
  
  fetch(`https://en.wikipedia.org/w/api.php?action=parse&format=json&origin=*&prop=wikitext&pageid=${daID}`)
    .then(function(response){return response.json();})
    .then(function(response) {
        
//alert(response.parse.wikitext["*"])
    chosenDescription = response.parse.wikitext["*"]
    //document.querySelector("#description").textContent = description;
    if (response.parse.wikitext["*"].toLowerCase().includes("#redirect"))
      {
        //let fandomDescription = FetchFandomPage(getCharacter(chosenTitle));
        getCharacter(chosenTitle)
        
        //FetchFandomPage()
        //return fandomDescription;
        //setTimeout(function(){GetCharacterImage(); },1000);
       // FetchMaleCategory();
      }
      else{
        //alert("ene")
        getImageOnly(chosenTitle);
        //alert('ana')
        return chosenDescription;
        //setTimeout(function(){GetCharacterImage(); },1000);
      //GetInfoboxImage(daID);
          //FetchThumbnail(daID);
        //GetImageFromHTMLAndDetectMatchingName(chosenTitle);
      }
    })
    .catch(function(error){alert(error);});
  
}

function FetchFandomPage(url)
{
  console.log(url)
  let newUrl = `https://${url.split("/")[2]}/api.php?action=parse&format=json&origin=*&prop=wikitext&page=${url.split("/")[4]}`;
  //alert(newUrl);
  fetch(newUrl)
    .then(function(response){return response.json();})
    .then(function(response) {
        
//alert(response.parse.wikitext["*"])
    analyzeCharacter(response.parse.wikitext["*"])
    return response.parse.wikitext["*"]
    //document.querySelector("#description").textContent = description;
    //GetInfoboxImageFandom(url);
    })
    .catch(function(error){alert(error);});
  
}

async function getCharacter(name){
  //let loadingImg = document.querySelector("#loading");
  //loadingImg.style.display = "inline-flex";
  
  let response;
  let responseJson;
  let response2;
  let response2Json;
  try{
    response = await fetch(`https://cartoon-clash-scraper-api.glitch.me/article?character=${name}`);
    responseJson = await response.json();
    response2 = await fetch(`https://cartoon-clash-scraper-api.glitch.me/image?character=${name}`)
    response2Json = await response2.json();
  }catch(err){
    //alert(err);
    FetchMaleCategory();
    return;
  }finally{
    //loadingImg.style.display="none"
    //enableReadyButton();
    chosenImage = response2Json[0].source;
    if (responseJson.link)
    {
      FetchMaleCategory();
    }
    else{
  FetchFandomPage(responseJson.link)
    }
    //alert(chosenImage)
  }
  //alert(responseJson.link)
  //alert(response2Json[0].source);
    return [responseJson.link, response2Json]
}

async function getImageOnly(name)
{
  let response;
  let responseJson;
  try{
    response = await fetch(`https://cartoon-clash-scraper-api.glitch.me/image?character=${name}`)
    responseJson = await response.json();
  }catch(err){
    //alert(err);
    FetchMaleCategory();
    return;
  }finally{
    //loadingImg.style.display="none"
    //alert(chosenImage)
    chosenImage = responseJson[0].source;
    
    analyzeCharacter(chosenDescription);
  }
  //alert(responseJson.link)
  //FetchFandomPage(responseJson.link)
  //alert(response2Json[0].source);
  
    return responseJson
}
async function getImageOnlyNoAnalysis(name)
{
  let response;
  let responseJson;
  try{
    response = await fetch(`https://cartoon-clash-scraper-api.glitch.me/image?character=${name}`)
    responseJson = await response.json();
  }catch(err){
    //alert(err);
    return;
  }finally{
    //loadingImg.style.display="none"
  }
  //alert(responseJson.link)
  //FetchFandomPage(responseJson.link)
  //alert(response2Json[0].source);
  
    return responseJson
}