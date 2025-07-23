let querySelectCaching = {}

function querySelect(selector, callback) {
  // if (selector in querySelectCaching) {
    // callback(querySelectCaching[selector])
    // return;
  // }
  
  const existing = document.querySelector(selector);
  if (existing) {
    querySelectCaching[selector] = existing;
    callback(existing);
    return;
  }

  const observer = new MutationObserver((mutations, obs) => {
    const found = document.querySelector(selector);
    if (found) {
      obs.disconnect();
      querySelectCaching[selector] = existing;
      callback(found);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

let uiState = null

function enterDefaultState() {
  uiState = "default"
  
  querySelect('[class^="base_"]', (o) => o.style.gridTemplateColumns = "[start] min-content [guildsEnd] 1fr [channelsEnd] 0fr [end]");
}

function leaveDefaultState() {
  querySelect('[class^="base_"]', (o) => o.style.gridTemplateColumns = "[start] min-content [guildsEnd] min-content [channelsEnd] 1fr [end]");
}

function enterChatState() {
  uiState = "chat"
  
  querySelect('[class^="base_"]', (o) => o.style.gridTemplateColumns = "[start] 0fr [guildsEnd] 0fr [channelsEnd] 1fr [end]");
  querySelect('[class^="panels_"]', (o) => o.style.display = "none");
  querySelect('[class^="wrapper_"]', (o) => o.style.width = "0");

  querySelect('[class^="bar_"] > [class^="leading"]', (o) => {
    let leaveButton = document.createElement("div")
    leaveButton.innerHTML = '<svg aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M17.3 18.7a1 1 0 0 0 1.4-1.4L13.42 12l5.3-5.3a1 1 0 0 0-1.42-1.4L12 10.58l-5.3-5.3a1 1 0 0 0-1.4 1.42L10.58 12l-5.3 5.3a1 1 0 1 0 1.42 1.4L12 13.42l5.3 5.3Z" class=""></path></svg>'
    leaveButton.children[0].style.color = "var(--icon-tertiary)";
    leaveButton.style.cursor = "pointer";
    leaveButton.style.marginTop = "4px";
    leaveButton.onclick = () => {
      leaveChatState()
      enterDefaultState()
    }
    o.appendChild(leaveButton)
  });

  // querySelect('[class^="search_"]', (o) => o.style.display = "none");
}

function leaveChatState() {
  querySelect('[class^="base_"]', (o) => o.style.gridTemplateColumns = "[start] min-content [guildsEnd] min-content [channelsEnd] 1fr [end]");
  querySelect('[class^="panels_"]', (o) => o.style.display = null);
  querySelect('[class^="wrapper_"]', (o) => o.style.width = null);
  querySelect('[class^="bar_"] > [class^="leading"]', (o) => o.children[0].remove());
  // querySelect('[class^="search_"]', (o) => o.style.display = null);
}

function onHorizSwipe(from_x, to_x) {
  if (uiState == "default" && from_x > to_x && from_x > 0.5) {
    leaveDefaultState()
    enterChatState()
  }
  
  if (uiState == "chat" && from_x < to_x && from_x < 0.5) {
    leaveChatState()
    enterDefaultState()
  }
}

let startSwipe = null
let startSwipeDate = null

function doAlways() {
  querySelect('[class^="sidebarResizeHandle_"]', (o) => o.remove());
  querySelect('[class^="sidebarList_"]', (o) => o.style.width = "100%");

  document.ondragstart = () => { return false; };
  
  let on_click = o => {
    console.log(o.target)
    
    if (o.target.closest('[class^="link_"]')) {
      if (uiState == "default") {
        leaveDefaultState();
        enterChatState();
      }
    }
    
    // if (o.target.closest('div[data-list-item-id^="guildsnav"]')) {
      // document.addEventListener("click", on_click);
    // }
  };
  
  document.addEventListener("click", on_click, true);

  let styles = document.createElement("style")
  styles.innerHTML = `
    [class^="upperContainer_"] > div[class^="children_"]:after {
      background: none;
    }
    
    [class^="upperContainer_"] {
      overflow-x: scroll;
      overflow-y: hidden;
    }
    
    [class^="upperContainer_"] > [class^="children_"] {
      min-width: max-content;
    }

    [class^="upperContainer_"]::-webkit-scrollbar {
      display: none;
    }
    
    [class^="layerContainer_"] {
      display: none;
    }
  `;
  document.body.appendChild(styles);

  document.body.addEventListener("mousedown", (event) => {
    if (event.button == 0) {
      startSwipe = [event.clientX, event.clientY];
      startSwipeDate = Date.now()
    }
  });
  
  document.body.addEventListener("mouseup", (event) => {
    if (event.button == 0 && startSwipe != null && startSwipeDate != null && Date.now() - startSwipeDate < 5000) {
      onHorizSwipe(startSwipe[0] / document.documentElement.clientWidth, event.clientX / document.documentElement.clientWidth)
    }
  })
}

function onStart() {
  doAlways();
  enterDefaultState();
}

onStart()
