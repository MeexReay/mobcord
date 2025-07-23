let querySelectCaching = {}

function querySelect(selector, callback) {
  if (selector in querySelectCaching) {
    callback(querySelectCaching[selector])
    return;
  }
  
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
  querySelect('[class^="search_"]', (o) => o.style.display = "none");
}

function leaveChatState() {
  querySelect('[class^="base_"]', (o) => o.style.gridTemplateColumns = "[start] min-content [guildsEnd] min-content [channelsEnd] 1fr [end]");
  querySelect('[class^="panels_"]', (o) => o.style.display = null);
  querySelect('[class^="wrapper_"]', (o) => o.style.width = null);
  querySelect('[class^="search_"]', (o) => o.style.display = null);
}

function onHorizSwipe(from_x, to_x) {
  console.log(from_x, to_x)

  if (uiState == "default" && from_x > to_x && from_x > 0.5) {
    leaveDefaultState()
    enterChatState()
  }
  
  if (uiState == "chat" && from_x < to_x && from_x < 0.5) {
    leaveChatState()
    enterDefaultState()
  }
}

function doAlways() {
  querySelect('[class^="sidebarResizeHandle_"]', (o) => o.remove());
  querySelect('[class^="sidebarList_"]', (o) => o.style.width = "100%");
  querySelect('[class^="upperContainer_"] > div', (o) => o.style.overflowX = "scroll");

  let styles = document.createElement("style")
  styles.innerHTML = `
    [class^="upperContainer_"] > div[class^="children_"]:after {
      background: none;
    }
  `;
  document.body.appendChild(styles);
}

function onStart() {
  doAlways();
  enterDefaultState();
}

onStart()
