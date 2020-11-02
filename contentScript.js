function sendUpdates() {
  if (!window.parent) return;

  setTimeout(function(){
    var payload = {
      key: "unreadPullRequests", 
      value: document.getElementsByClassName("bolt-list-row-marked").length
    };
    window.parent.postMessage(payload, "*");
  }, 2000);
}

window.addEventListener("load", sendUpdates);