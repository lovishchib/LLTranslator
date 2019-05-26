//declaring an array of all the languages dealing with
var languages = {"en" : "English", "hi" : "Hindi", "de" : "German", "fr" : "French", "ar" : "Arabic"};

//Creating an object to store the source and target language through out script 
var langObj = {"sourceLang" : "", "targetLang": ""};

//---------------------*---------------Events on extension loading begins here-------------*------------------*---------------

//loading fields of popup when the extension is loaded
document.addEventListener('DOMContentLoaded', function() {
   console.log("DOM loaded");

   chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
       console.log("inside chrome tab query" + tabs);
      chrome.tabs.detectLanguage(tabs[0].id, evaluateOtherLanguages); // calling chrome.tab's method to detect language with callback fxn
});
});

 // A function to use as callback  from detectLanguage fxn and evaluate the languages to be translated into
  function evaluateOtherLanguages(lang) {
      if(langObj.sourceLang == "") langObj.sourceLang = lang;
    console.log('I received the following language' + lang);
    document.getElementById("detect-lang").innerHTML = languages[lang]; //injecting detected language into code
    delete languages[lang];
    populateFields();
}


//filling dropdown dynamically with other languages to choose from inside select field of popup.html
   function populateFields() {
     var code = "";
      for(obj in languages) {
        code+= "<option value = \"" + obj + "\">" + languages[obj] + "</option> \n";
        console.log(obj);
    }
    document.getElementById("trans-lang").innerHTML = code; //injecting the select option items into code
}

//---------------*---------------*-------End of DOM loading events for extension---------*-------------*--------------------


//-------------*--------------Beginning of the events triggered by translate button click---------*--------------*---------

//translation begins from here, click event detected on translate button
document.getElementById("translate").addEventListener("click", function(){
    //console.log("entered translate");
    var e = document.getElementById("trans-lang");
    langObj.targetLang = e.options[e.selectedIndex].value; //setting the target language from input
    console.log("Hit Translate with value " + langObj.targetLang);
    document.getElementById("src-targ").innerHTML = languages[langObj.targetLang];
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
       console.log("Sending message to listener");
       chrome.tabs.sendMessage(tabs[0].id, langObj , triggerSecondPage);
       /*
       ** sending message to listener configured on contentScript to update the chrome tab url as well as reload
       ** and calling triggerSecondPage after that to switch UI for other options
       */
    });
});

//-------------*--------------Ending of the events triggered by translate button click---------*--------------*---------


//-------------*--------------Controlling the two interfaces of extension via css---------*--------------*---------

//toggling tne two blocks of codes acting as two pages on same html
function triggerSecondPage() {
    langObj.sourceLang = langObj.targetLang;
    /*after translation set source language to target language, the detectLanguage method of chrome
    only detects the original language, even the page is translated, For GodSake idk why ? So just added a little more dynamicity*/
    document.getElementById("blockOne").setAttribute("style", "display:none");
    document.getElementById("blockTwo").setAttribute("style","display:block");
}

/*Listening to back click from second page, to again toggle from second to first page,
Just in case you switched to language you can't understand*/
document.getElementById("revert").addEventListener("click", function() {
    document.getElementById("blockOne").setAttribute("style", "display:block");
    document.getElementById("blockTwo").setAttribute("style","display:none");
});

/*Listening to close button on second page to close the extension popup, otherwise you can click somewhere else also*/
document.getElementById("close").addEventListener("click", function() {
window.close();
});

//removes the suffix from url so it loads back to original
document.getElementById("original").addEventListener("click", function removeSuffix() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var url = tabs[0].url;
    console.log("inside update url with " + url);
    if(url.includes('googtrans'))
         url = url.substring(0, url.lastIndexOf('#googtrans'));
    
    //to update chrome tabs    
    chrome.tabs.update(tabs[0].id, {url: url});
    console.log("url updated as " + url);    
});
 
});
//---------*------------*-------The END--------*---------*---------------------