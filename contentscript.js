// This script runs after webpage loads. See manifest.json "content_scripts" section. It includes "contentscript.js" (this file!)
// and it specifies "run_at": "document_idle", which tells Chrome to run this file after webpage fully loads.

// We are using jQuery (the $ character is how we use jQuery) to find the body of the webpage.
// Note standard webpage's HTML structure. <html><head></head><body></body></html>.
// $document returns us the whole webpage including everything in <html></html>.
// by doing .find('body'), we are grabbing the <body></body> and everything that's in the body element.
var webpageBody = $(document).find("body");
// jQuery lets us extract every text that's in an element. In our case, we are extracting all text in the body.
// This way, we have the texts in the given article that we can use for text analysis.

var webpageBodyText = webpageBody.text();

// removes any extra white spaces to significantly reduce length count
const webpageTextTrim = webpageBodyText.replace(/\s+/g, ' ').trim();
console.log(webpageTextTrim);
console.log(webpageTextTrim.length);

function chunkString(str, length) {
  return str.match(new RegExp('.{1,' + length + '}', 'g'));
}

const strChunksArr = chunkString(webpageTextTrim, 5120)
console.log(strChunksArr);

// We are now creating a new element to insert into the html structure.
// This element is <div></div>
const analysisResultElement = document.createElement("div");
// We set element id so that it looks like <div id="analysisResultDiv"></div>
analysisResultElement.id = "analysisResultDiv";
// We set the inner content of this element. Now the element looks like <div id="analysisResultDiv">TODO - ANALYSIS CONTENT</div>
analysisResultElement.innerHTML = "TODO - ANALYSIS CONTENT";
// TODO We need to dress up this element and make it always appear on top of the page. Use css styles to achieve this.
// This is an example of how to modify css styles in javascript. It is same as doing style="{color: red}".
// To get an element to always appear at the top of the page, take a look at css style {position: absolute; top: 0; left: 0;}
analysisResultElement.style.color = "red";
analysisResultElement.style.position = "absolute";
analysisResultElement.style.left = 0;
analysisResultElement.style.top = 0;

// We again use jQuery to insert this new div element into the webpage's html.
// This will end up modifying html to something like <html><head></head><body><div id="analysisResultDiv">TODO - ANALYSIS CONTENT</div></body>
// We should see the text 'TODO - ANALYSIS CONTENT' appear somewhere on every webpage we visit.
webpageBody.append(analysisResultElement);
console.log(analysisResultElement);
// We are going to extract Azure subscription key from chrome extention options. The subscription key is a sensitive
var apiKey = "";

// We are now going to send a snippet of the website's text and send for analysis.
// The following code is taken from: https://westcentralus.dev.cognitive.microsoft.com/docs/services/TextAnalytics-v2-1/operations/56f30ceeeda5650db055a3c9
var params = {
  // Request parameters
  showStats: "true",
};

// We now put together set of instructions for the server to perform. In this case, we are telling the server that we have
// 1 group of texts that need to be analyzed. (Notice 'documents' is an array - [] signify an array. An array of objects
// can be expressed in JavaScript as the following: [{'name': 'object1'}, {'name': 'object2'}].
// This array contains 2 objects that has names object1 and object2)

let documentId = 0;
const documentsArr = []
const requestContentResult = strChunksArr.map((chunk) => {
  documentId ++;
  documentsArr.push(
    {
      language: "en",
      id: documentId,
      text: chunk, // This is the text that we are sending to analyze. Sends in the text from the webpage to be analyzed.
    }
  )
})
console.log(documentsArr)

var requestContent = {
  "documents": documentsArr,
}

console.log(requestContent)

// This is how we send a request to Azure's Text Analytics service. This pattern can be used to send any request to any
// server (Relisted server included!)

$.ajax({
  url:
    "https://eastus.api.cognitive.microsoft.com/text/analytics/v2.1/sentiment?" + $.param(params),
  beforeSend: function (xhrObj) {
    // Request headers
    xhrObj.setRequestHeader("Content-Type", "application/json");
    xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", apiKey);
  },
  type: "POST",
  // Request body
  data: JSON.stringify(requestContent1),
})
  // This server request call is an asynchronous one. $.ajax gives us an ability to handle the data that's returned by the
  // server here via .done method.
  .done(function (data) {
    console.log(data)
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
      numberOfScores++;
    });

    // We now calculate the average scores
    var averageScore = totalScore / numberOfScores;
    console.log("AVG:", averageScore)
    // Ascording to Azure Sentiment Analysis, score of 0.5 is absulte neutral, 0 is more negative, 1 is most positive.
    // Let's consider score in between 0.4 and 0.6 to be neutral
    if (averageScore >= 0.4 && averageScore <= 0.6) {
      // We are modifying the <div> element we created above to have text 'NEUTRAL' instead of 'TODO - ANALYSIS CONTENT'
      analysisResultElement.innerHTML = "NEUTRAL";
      // turns label white
      analysisResultElement.style.color = "white";
    }

    // score of less than 0.4 to be negative. Do the same thing as above but for average score of < 0.4 and the text 'NEGATIVE' here. Turns label red
    if (averageScore < 0.4) {
      analysisResultElement.innerHTML = "NEGATIVE";
      analysisResultElement.style.color = "red";
    }

    // score of greater than 0.6 to be positive. Turns label green
    if (averageScore > 0.6) {
      analysisResultElement.innerHTML = "POSITIVE";
      analysisResultElement.style.color = "green";
    }
    chrome.storage.sync.set({ analysisResultElement: analysisResultElement.innerHTML }, function () {
      console.log('The element is ready.');
    })

  })
  // If the server request fails, we will need to handle the case here in .fail method.
  .fail(function () {
    alert("error");
  });