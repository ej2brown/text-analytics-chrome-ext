const cognitiveRating = document.getElementById("cognitiveRating");
const displayResults = document.getElementById("displayResults");
const button = document.getElementById("btn");

button.addEventListener("click", () => {
  chrome.storage.sync.get("analyticsResult", ({analyticsResult}) => {
    console.log('Value currently is ' + analyticsResult);
    cognitiveRating.innerHTML = analyticsResult;
    cognitiveRating.setAttribute('value', analyticsResult);
    displayResults.classList.remove("hidden")
  });
});