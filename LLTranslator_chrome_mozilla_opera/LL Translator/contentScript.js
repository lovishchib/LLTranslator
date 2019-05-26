
/*
**This listener hears from popup.js to change the add the suffix to url and update it.
** Although this can be achieved via chrome.tab api from popup.
*/
chrome.runtime.onMessage.addListener(function loadScripts(request, sender, sendResponse) {
    if(request.sourceLang || request.targetLang) {
   var url = window.location.href;
    console.log("inside update url with " + url);
    if(request.sourceLang == undefined) request.sourceLang = "en";
    var newArg = request.sourceLang + "|" + request.targetLang;
    //if(url.includes("#googtrans")) //to check if there is an existing suffix and remove it in below code.
        url = url.substring(0, url.lastIndexOf("#googtrans"));
    console.log("removing the last " + url);
    url = url.concat("#googtrans(" + newArg + ")");
    window.location = url; //adding the newly suffixed url
    console.log("url updated as " + url);
    location.reload(); //reloading the url with new suffix
    sendResponse(); //telling popup.js that process completed, continue with your next method.
    }
});

//---------*-----------*---------- Script to be injected --------*------------*--------------------

/*
**Here filtering out the pages having hash attribute of there location containing our suffix or not.
**I Should be using matches attribute of content-script in manifest.json file, but unable to find a matcher for all urls having
**suffix as '%googtrans%', with optional pathname so resorted to this conditional
*/
    if((window.location.hash).includes("googtrans")) {
        console.log("inside loadscript");

        var head= document.getElementsByTagName('head')[0];
        var script1= document.createElement('script');
        script1.type= 'text/javascript';
        script1.src= 'https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js';

        var script2= document.createElement('script');
        script2.type= 'text/javascript';
        script2.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';

        let scripts = Array.from(document.querySelectorAll('script')).map(scr => scr.src); //fetching all of script src from page

        if (!scripts.includes(script1.src)) { //matching to our own script to reduce duplicate injection
            head.appendChild(script1);
        }

        var script3 = document.createElement('script');
        script3.id = "scriptWithCode";
        script3.type = 'text/javascript';

        var code = "function googleTranslateElementInit() { new google.translate.TranslateElement({pageLanguage: '', layout:"
        +"google.translate.TranslateElement.FloatPosition.TOP_LEFT}, 'google_translate_element'); }"
        + "function triggerHtmlEvent(element, eventName) {  var event;  if (document.createEvent) {"
        +"event = document.createEvent('HTMLEvents');	event.initEvent(eventName, true, true);"
        + "element.dispatchEvent(event);  } else {	event = document.createEventObject(); event.eventType = eventName;"
        +"element.fireEvent('on' + event.eventType, event);}} ";

        console.log("script declared");
        script3.appendChild(document.createTextNode(code));
        var body = document.getElementsByTagName('body')[0];

        //similarly checking if our page contains script2, if no then inject both the required ones.
        if(!scripts.includes(script2.src)) {
            body.appendChild(script3);
            body.appendChild(script2);
            console.log("scripts loaded");
        }
}
//--------------*---------*----------End Of Scripts--------*-----------*-----------*---------------