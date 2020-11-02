var pageLink = null;

if (typeof browser === 'undefined'){
  browser = chrome;
}

function getPageLink(orgUrl) {
  if (!orgUrl) return null;
  return "https://" + orgUrl + "/_pulls";
}

browser.storage.local.get("orgUrl", function(results) {
  console.log("init", results.orgUrl)
  pageLink = getPageLink(results.orgUrl);

  setRequestListener();
  checkPullRequests();
});
browser.storage.onChanged.addListener((changes) => {

  if (changes.orgUrl){
    pageLink = getPageLink(changes.orgUrl.newValue);

    if (changes.orgUrl.oldValue != changes.orgUrl.newValue){
      setRequestListener();
      checkPullRequests();
    }
  }
})

function setRequestListener(){
  var onHeadersReceived = browser.webRequest.onHeadersReceived;

  if (onHeadersReceived.hasListener(headerReceivedHandler)){
    onHeadersReceived.removeListener(headerReceivedHandler)
  }
  if (!pageLink) {
    return;
  }
  onHeadersReceived.addListener(headerReceivedHandler,
    {
        urls: [pageLink],
        types: ['sub_frame']
    },
    ['blocking', 'responseHeaders']
  );
} 

function headerReceivedHandler(info) {
  var headers = info.responseHeaders;
  var index = headers.findIndex(x=>x.name.toLowerCase() == "x-frame-options");
  if (index !=-1) {
    headers.splice(index, 1);
  }
  return {responseHeaders: headers};
}


window.addEventListener("message", function(event){
  if (event.data.key != "unreadPullRequests"){
    return;
  }

  var count = event.data.value || "";
  browser.browserAction.setBadgeText({text: count.toString()});
});

function checkPullRequests(){
  if (pageLink === null){
    return;
  }
  browser.browserAction.setBadgeText({text: "..."});
  frame.src = pageLink;
}

function openPullRequestPage(){
  if (pageLink === null){
    browser.runtime.openOptionsPage();
    return;
  }

  checkPullRequests();
  browser.tabs.create({url: pageLink});
}

browser.alarms.onAlarm.addListener(checkPullRequests);
browser.alarms.create('checkPullRequests', {periodInMinutes: 5});

browser.browserAction.onClicked.addListener(openPullRequestPage);