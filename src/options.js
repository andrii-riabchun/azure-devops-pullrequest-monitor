if (typeof browser === 'undefined'){
  browser = chrome;
}

function saveOptions(e) {
  browser.storage.local.set({
    organizations: (document.querySelector("#organizations").value || "").split(/\r?\n/),
    refreshInterval: parseInt(document.querySelector("#refreshInterval").value)
  });
  e.preventDefault();
}

function restoreOptions() {
  browser.storage.local.get(null,(res) => {
    document.querySelector("#organizations").value = (res.organizations || []).join('\r\n');
    document.querySelector("#refreshInterval").value = (res.refreshInterval || 5);
  })
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);