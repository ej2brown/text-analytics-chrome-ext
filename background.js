chrome.runtime.onInstalled.addListener(function() {
    console.log('The extension has loaded!');
    // TODO Take a look at intercepting all web requests using:
    // https://developer.chrome.com/extensions/webRequest
});