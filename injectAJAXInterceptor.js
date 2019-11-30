/**
 * Taken from:
 * https://stackoverflow.com/questions/8939467/chrome-extension-to-read-http-response/48134114#48134114
 * 
 * This script executes and injects injected.js into loaded website.
 * The injected.js will override XMLHttpRequest methods to spoof Http requests and responses.
 * TODO - Consider: categorize the captured responses and write useful tool to play around with the
 *      - captured requests on the the fly and to save those requests.
 *      - Consider: Also quick way to select and save the responses would be nice.
 */
var s = document.createElement('script');
s.src = chrome.extension.getURL('injected.js');
s.onload = function() {
    this.remove();
};
(document.head || document.documentElement).appendChild(s);