let cognitiveRating = document.getElementById("cognitiveRating");

chrome.storage.sync.get('analysisResultElement', function(data) {
    cognitiveRating.innerHTML = data.analysisResultElement;
    cognitiveRating.setAttribute('value', data.analysisResultElement);
  });