if (typeof browser === 'undefined'){
  browser = chrome;
}

function saveOptions(e) {
  browser.storage.local.set({
    orgUrl: document.querySelector("#orgUrl").value
  });
  e.preventDefault();
}

function restoreOptions() {
  browser.storage.local.get('orgUrl',(res) => {
    document.querySelector("#orgUrl").value = res.orgUrl || "";
  })
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);