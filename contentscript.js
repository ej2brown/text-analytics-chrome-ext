// ====== PREP TEXT FOR API ====== //

// Extract text in the body using jQuery
var webpageBody = $(document).find("body");
const webpageBodyText = webpageBody.text();

var webpageBodyText = webpageBody.text();

const webpageTextTrim = webpageBodyText.replace(/\s+/g, ' ').trim();

function chunkString(str, length) {
  return str.match(new RegExp('.{1,' + length + '}', 'g'));
}

const strChunksArr = chunkString(webpageTextTrim, 5120)
console.log(strChunksArr);

var apiKey = "";

var params = {
  showStats: "true",
};


let documentId = 0;
const documentsArr = []
const requestContentResult = strChunksArr.map((chunk) => {
  documentId ++;
  documentsArr.push(
    {
      language: "en",
      id: index,
      text: chunk, // Text being sent to analyze.
    }
  )
})
console.log(documentsArr)

var requestContent = {
  "documents": documentsArr,
}

// Header containing API Key

// ====== SEND REQUEST TO SERVER ====== //

$.ajax({
  url:
    "https://eastus.api.cognitive.microsoft.com/text/analytics/v2.1/sentiment?" + $.param(params),
  beforeSend: function (xhrObj) {
    xhrObj.setRequestHeader("Content-Type", "application/json");
    xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", apiKey);
  },
  type: "POST",
  data: JSON.stringify(requestContent),
  data: JSON.stringify(requestContent1),
})
  .done(( {documents} ) => {
    // ====== DETERMINE RATING ====== //
  .done(function (data) {

    var returnedDocuments = data.documents;

    // Let's average the sentiment scores so we can have a singular 'positive' 'neutral' 'negative' flags we can show
    // to the users
    var totalScore = 0;
    var numberOfScores = 0;

    returnedDocuments.forEach((item) => {
      totalScore = totalScore + item.score;
      numberOfScores++;
    });

    var averageScore = totalScore / numberOfScores;
    console.log("AVG:", averageScore)
    // Ascording to Azure Sentiment Analysis, score of 0.5 is absulte neutral, 0 is more negative, 1 is most positive.
    const averageScore = totalScore / documents.length;
    if (averageScore >= 0.4 && averageScore <= 0.6) {
      analyticsResult = "NEUTRAL";
      analysisResultElement.innerHTML = "NEUTRAL";
      analyticsResult = "NEGATIVE";
      analysisResultElement.style.color = "white";
    }

      analyticsResult = "Undetermined";
    if (averageScore < 0.4) {
      analysisResultElement.innerHTML = "NEGATIVE";
      analysisResultElement.style.color = "red";
    }

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