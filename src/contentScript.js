function sendUpdates() {
  if (window.parent == window) return;

  setTimeout(function(){
    const cards = [...document.querySelectorAll(".repos-pr-section-card")].map(card => {
        const title = card.querySelector(".repos-pr-section-header-title .text-ellipsis").textContent
        const buttons = [...card.querySelectorAll(".bolt-tab")];
        if (buttons.length == 0) {
            return {
                title,
                count: card.querySelectorAll(".bolt-list-row-marked").length
            }
        }

        const sections = buttons.map(button => {
            button.click();

            const label = button.querySelector(".bolt-tab-text").textContent;
            const allItems = card.querySelectorAll(".bolt-list-row").length;
            const updatedItems = card.querySelectorAll(".bolt-list-row-marked").length;
            return { label, allItems, updatedItems }; 
        });
        
        const count = sections.reduce((x, y) => x.updatedItems + y.updatedItems);
        return {
            title,
            count,
            sections
        }
    });

    const count = cards.map(_ => _.count).reduce((x, y) => x + y, 0);

    var payload = {
      key: "unreadPullRequests",
      count,
      cards,
      organization: window.location.pathname.replace('/_pulls','').replace('/', '')
    };
    window.parent.postMessage(payload, "*");
  }, 2000);
}

window.addEventListener("load", sendUpdates);