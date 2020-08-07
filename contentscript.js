// ====== PREP TEXT FOR API ====== //

// Extract text in the body using jQuery
var webpageBody = $(document).find("body");
const webpageBodyText = webpageBody.text();

// Removes any extra white spaces to significantly reduce length count
const webpageTextTrim = webpageBodyText.replace(/\s+/g, ' ').trim();

// Breaks text into chunk sizes the API can handle 
const chunkString = (str, length) => {
  return str.match(new RegExp('.{1,' + length + '}', 'g'));
}
const strChunksArr = chunkString(webpageTextTrim, 5120)

const documentsArr = []
strChunksArr.map((chunk, index) => {
  documentsArr.push(
    {
      language: "en",
      id: index,
      text: chunk, // Text being sent to analyze.
    }
  )
});

// Request data
const requestContent = {
  "documents": documentsArr,
};

// Header containing API Key
const apiKey = "";

// URL parameter query 
const params = {
  showStats: "true",
};

// ====== SEND REQUEST TO SERVER ====== //

// The following code is taken from: https://westcentralus.dev.cognitive.microsoft.com/docs/services/TextAnalytics-v2-1/operations/56f30ceeeda5650db055a3c9
$.ajax({
  url:
    "https://eastus.api.cognitive.microsoft.com/text/analytics/v2.1/sentiment?" + $.param(params),
  beforeSend: function (xhrObj) {
    xhrObj.setRequestHeader("Content-Type", "application/json");
    xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", apiKey);
  },
  type: "POST",
  data: JSON.stringify(requestContent),
})
  .done(( {documents} ) => {
    // ====== DETERMINE RATING ====== //

    // Let's average the sentiment scores so we can have a singular 'positive' 'neutral' 'negative' flags we can show
    // to the users
    let totalScore = 0;
    let analyticsResult = "";
    documents.forEach((item) => {
      totalScore = totalScore + item.score;
    });

    // Ascording to Azure Sentiment Analysis, score of 0.5 is absulte neutral, 0 is more negative, 1 is most positive.
    const averageScore = totalScore / documents.length;
    if (averageScore >= 0.4 && averageScore <= 0.6) {
      analyticsResult = "NEUTRAL";
    } else if (averageScore < 0.4) {
      analyticsResult = "NEGATIVE";
    } else if (averageScore > 0.6) {
      analyticsResult = "POSITIVE";
    } else {
      analyticsResult = "Undetermined";
    }
    chrome.storage.sync.set({ analyticsResult }, () => {
      return analyticsResult;
    });

  })
  // If the server request fails, we will need to handle the case here in .fail method.
  .fail(() => {
    if (documentsArr.length = 0) alert("Error - unable to scrap any text. Try another site.");
    else if (apiKey === "") alert("Error - the API isn't working, are you using a valid Azure API key?");
    else alert("error");
  });