if (typeof browser === 'undefined'){
  browser = chrome;
}

function saveOptions(e) {
  browser.storage.local.set({
    organization: document.querySelector("#organization").value
  });
  e.preventDefault();
}

function restoreOptions() {
  browser.storage.local.get('organization',(res) => {
    document.querySelector("#organization").value = res.organization || "";
  })
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);