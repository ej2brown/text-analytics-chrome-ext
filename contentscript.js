// This script runs after webpage loads. See manifest.json "content_scripts" section. It includes "contentscript.js" (this file!)
// and it specifies "run_at": "document_idle", which tells Chrome to run this file after webpage fully loads.

// We are using jQuery (the $ character is how we use jQuery) to find the body of the webpage.
// Note standard webpage's HTML structure. <html><head></head><body></body></html>.
// $document returns us the whole webpage including everything in <html></html>.
// by doing .find('body'), we are grabbing the <body></body> and everything that's in the body element.
var webpageBody = $(document).find('body');
// jQuery lets us extract every text that's in an element. In our case, we are extracting all text in the body.
// This way, we have the texts in the given article that we can use for text analysis.
var webpageBodyText = webpageBody.text();
// This is just a test output to browser console (so that we can see quckly read what's in the webpage)
console.log(webpageBodyText);

// We are now creating a new element to insert into the html structure.
// This element is <div></div>
const analysisResultElement = document.createElement('div');
// We set element id so that it looks like <div id="analysisResultDiv"></div>
analysisResultElement.id = 'analysisResultDiv';
// We set the inner content of this element. Now the element looks like <div id="analysisResultDiv">TODO - ANALYSIS CONTENT</div>
analysisResultElement.innerHTML = 'TODO - ANALYSIS CONTENT';
// TODO We need to dress up this element and make it always appear on top of the page. Use css styles to achieve this.
// This is an example of how to modify css styles in javascript. It is same as doing style="{color: red}".
// To get an element to always appear at the top of the page, take a look at css style {position: absolute; top: 0; left: 0;}
analysisResultElement.style.color = 'red';

// We again use jQuery to insert this new div element into the webpage's html.
// We should see the text 'TODO - ANALYSIS CONTENT' appear somewhere on every webpage we visit.
$(document).find('body').append(analysisResultElement);

// We are going to extract Azure subscription key from chrome extention options. The subscription key is a sensitive
// information - like a password. Don't want to publish it on an open source project!
var apiKey = ''; // TODO COPY AND PASTE THE API KEY HERE FOR NOW!

// We are now going to send a snippet of the website's text and send for analysis.
// The following code is taken from: https://westcentralus.dev.cognitive.microsoft.com/docs/services/TextAnalytics-v2-1/operations/56f30ceeeda5650db055a3c9
var params = {
            // Request parameters
            'showStats': 'true',
        };

// We now put together set of instructions for the server to perform. In this case, we are telling the server that we have
// 1 group of texts that need to be analyzed. (Notice 'documents' is an array - [] signify an array. An array of objects
// can be expressed in JavaScript as the following: [{'name': 'object1'}, {'name': 'object2'}].
// This array contains 2 objects that has names object1 and object2)
var requestContent = {
    'documents': [
        {
            'countryHint': 'US',
            'id': '1',
            'text': 'I am a sad boy' // TODO This is the text that we are sending to analyze. Let's work on sending in the text from the webpage to be analyzed.
        }
    ]
}
      
// This is how we send a request to Azure's Text Analytics service. This pattern can be used to send any request to any
// server (Relisted server included!)
$.ajax({
    url: 'https://eastus2.api.cognitive.microsoft.com/text/analytics/v2.1/sentiment?' + $.param(params),
    beforeSend: function(xhrObj) {
        // Request headers
        xhrObj.setRequestHeader('Content-Type','application/json');
        xhrObj.setRequestHeader('Ocp-Apim-Subscription-Key', '');
    },
    type: "POST",
    // Request body
    data: JSON.stringify(requestContent),
})
// This server request call is an asynchronous one. $.ajax gives us an ability to handle the data that's returned by the
// server here via .done method.
.done(function(data) {
    console.log(data);
    
    // We have the text analytics data from the service!! If we take a look at the browser console (F12 button), we can
    // examine the structure of the data. It's of the structure: {documents: [{id: xx, score: xx}, {id: xx, score: xx}]}
    // So we will extract the results by peeling one layer at a time.
    
    // First, "documents", which contains array of objects in the form {id: xx, score: xx}
    var returnedDocuments = data.documents;

    // Let's average the sentiment scores so we can have a singular 'positive' 'neutral' 'negative' flags we can show
    // to the users
    var totalScore = 0;
    var numberOfScores = 0;

    // We need to go through each of these data in the array like this:
    // This goes through each item in the array, and gives us access to each item.
    returnedDocuments.forEach((item) => {
        // We deal with item one by one here.
        // Let's add each of these scores so that we can calculate the average.
        totalScore = totalScore + item.score;
        // ++ is a shorthand to increment a variable by 1. It's the same as doing numberOfScores = numberOfScores + 1;
        numberOfScores ++;
    });

    // We now calculate the average scores
    var averageScore = totalScore / numberOfScores;

    // Ascording to Azure Sentiment Analysis, score of 0.5 is absulte neutral, 0 is more negative, 1 is most positive.
    // Let's consider score in between 0.4 and 0.6 to be neutral
    if (averageScore >= 0.4 && averageScore <= 0.6) {
        analysisResultElement.innerHTML = 'NEUTRAL';
        // TODO TURN THIS LABEL WHITE
    }
    // TODO Let's consider score of less than 0.4 to be negative
    // TODO TURN THIS LABEL RED 

    // TODO Let's consider score of greater than 0.6 to be positive
    // TODO TURN THIS LABEL GREEN 
})
// If the server request fails, we will need to handle the case here in .fail method.
.fail(function() {
    alert('error');
});