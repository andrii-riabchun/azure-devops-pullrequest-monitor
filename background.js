if (typeof browser === 'undefined'){
  browser = chrome;
}

function getPageUrl(callback) {
  browser.storage.local.get("organization", function(results) { 
    var pageLink = results.organization && "https://dev.azure.com/" + results.organization + "/_pulls"

    callback(pageLink);
  });
}

function checkPullRequestUpdates(){
  getPageUrl(function(pageLink){
    browser.browserAction.setBadgeText({text: "..."});
    frame.src = pageLink;
  });
}

window.addEventListener("message", function(event){
  if (event.data.key != "unreadPullRequests"){
    return;
  }

  var count = event.data.value || "";
  browser.browserAction.setBadgeText({text: count.toString()});
});

function openPullRequestPage(){
  getPageUrl(function(pageUrl){
    if (!pageUrl) {
      browser.runtime.openOptionsPage();
      return;
    }

    browser.tabs.create({url: pageUrl});
  });
}


browser.storage.onChanged.addListener((changes) => {
  if (changes.organization){
    checkPullRequestUpdates();
  }
})

browser.webRequest.onHeadersReceived.addListener(function(info) {
  var headers = info.responseHeaders;
  var index = headers.findIndex(x=>x.name.toLowerCase() == "x-frame-options");
  if (index !=-1) {
    headers.splice(index, 1);
  }
  return {responseHeaders: headers};
},
  {
      urls: ["https://dev.azure.com/*/_pulls"],
      types: ['sub_frame']
  },
  ['blocking', 'responseHeaders']
);

browser.alarms.onAlarm.addListener(function(alarm){
  if (alarm.name != 'checkPullRequests')
    return;

    checkPullRequestUpdates();
});
browser.alarms.create('checkPullRequests', {periodInMinutes: 5});

browser.browserAction.onClicked.addListener(function(){
  checkPullRequestUpdates();
  openPullRequestPage();
});