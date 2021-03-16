if (typeof browser === 'undefined'){
  browser = chrome;
}

const alarmName = "checkPullRequests";

let organizationData = {};
loadOrganizations();
setupRefresh();

function setupRefresh(){
  browser.storage.local.get("refreshInterval", function(results) { 
    const interval = results.refreshInterval || 5;
    browser.alarms.create(alarmName, {periodInMinutes: interval});
  });
}

function loadOrganizations(){
  getOrganizations((organizations) => {
    organizationData = {};
    organizations.forEach(v => organizationData[v] = 0);
  })
}

function getPageLink(orgName) {
  return `https://dev.azure.com/${orgName}/_pulls`;
}

function getOrganizations(callback) {
  browser.storage.local.get("organizations", function(results) { 
    callback(results.organizations || []);
  });
}

function checkPullRequestUpdates(){
  for (const org of Object.keys(organizationData)){
    organizationData[org] = 0;
  }

  browser.browserAction.setBadgeText({text: "..."});

  const body = document.getElementById('body');

  [...document.getElementsByClassName('generated')].forEach(s => s.remove());

  const iframes = Object.keys(organizationData).map(org => {
    const iframe = document.createElement('iframe');
    iframe.classList.add("generated");
    iframe.style.width = '1000px';
    iframe.src = getPageLink(org);
    return iframe;
  })

  iframes.forEach(f => body.appendChild(f));
}

window.addEventListener("message", function(event){
  if (event.data.key != "unreadPullRequests"){
    return;
  }

  console.log(event.data);
  organizationData[event.data.organization] = event.data.count;

  const count = Object.values(organizationData).reduce((x, y) => x + y) || "";
  browser.browserAction.setBadgeText({text: count.toString()});
});

function openPullRequestPages(){
  const entries = Object.entries(organizationData);

  if (entries.length === 0) {
    browser.runtime.openOptionsPage();
    return;
  }

  if (entries.length === 1) {
    browser.tabs.create({url: getPageLink(entries[0][0])});
    return;
  }


  for (const [org, count] of entries) {
    if (count > 0) {
      browser.tabs.create({url: getPageLink(org)});
    }
  }
}


browser.storage.onChanged.addListener((changes) => {
  if (changes.organizations){
    loadOrganizations();
    checkPullRequestUpdates();
  }
  if (changes.refreshInterval) {
    setupRefresh();
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
  ['blocking', 'responseHeaders', 'extraHeaders']
);

browser.alarms.onAlarm.addListener(function(alarm){
  if (alarm.name != alarmName)
    return;
  checkPullRequestUpdates();
});

browser.browserAction.onClicked.addListener(function(){
  openPullRequestPages();
  checkPullRequestUpdates();
});