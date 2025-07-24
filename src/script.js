// ==UserScript==
// @name            Mobcord
// @description     Discord client for mobile linux
// @author          MeexReay (https://github.com/MeexReay)
// @license         WTFPL
// @match           *://*.discord.com/*
// @run-at          document-start
// ==/UserScript==

let querySelectCaching = {};

function querySelect(selector, callback) {
  if (selector in querySelectCaching) {
    callback(querySelectCaching[selector]);
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
      querySelectCaching[selector] = found;
      callback(found);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

let uiState = null;

function enterDefaultState() {
  uiState = "default";
  
  querySelect('[class^="page_"]', (o) => {
    // o.style.width = "100vw";
    o.style.right = "-100vw";
    o.style.position = "absolute";
    o.style.zIndex = "10";
  });
  querySelect('[class^="sidebar_"]', (o) => {
    o.style.right = "0%";
  });
}

function leaveDefaultState() {
  querySelect('[class^="page_"]', (o) => {
    // o.style.width = null;
    o.style.right = null;
    o.style.position = null;
    o.style.zIndex = null;
  });
  querySelect('[class^="sidebar_"]', (o) => {
    o.style.right = null;
  });
}

function enterChatState() {
  uiState = "chat";
  
  querySelect('[class^="page_"]', (o) => {
    o.style.width = "100vw";
    o.style.right = "0%";
    o.style.position = "absolute";
    o.style.zIndex = "10";
  });
  querySelect('[class^="sidebar_"]', (o) => {
    o.style.right = "0%";
    o.style.pointerEvents = "none";
  });
  
  querySelect('[class^="bar_"] > [class^="leading"]', (o) => {
    let leaveButton = document.createElement("div");
    leaveButton.innerHTML = '<svg aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M17.3 18.7a1 1 0 0 0 1.4-1.4L13.42 12l5.3-5.3a1 1 0 0 0-1.42-1.4L12 10.58l-5.3-5.3a1 1 0 0 0-1.4 1.42L10.58 12l-5.3 5.3a1 1 0 1 0 1.42 1.4L12 13.42l5.3 5.3Z" class=""></path></svg>'
    leaveButton.children[0].style.color = "var(--icon-tertiary)";
    leaveButton.style.cursor = "pointer";
    leaveButton.style.marginTop = "4px";
    leaveButton.onclick = () => {
      leaveChatState();
      enterDefaultState();
    }
    o.appendChild(leaveButton);
  });

  // querySelect('[class^="search_"]', (o) => o.style.display = "none");
}

function leaveChatState() {
  querySelect('[class^="page_"]', (o) => {
    o.style.width = null;
    o.style.right = null;
    o.style.position = null;
    o.style.zIndex = null;
  });
  querySelect('[class^="sidebar_"]', (o) => {
    o.style.right = null;
    o.style.pointerEvents = null;
  });
  
  querySelect('[class^="bar_"] > [class^="leading"]', (o) => o.children[0].remove());
  // querySelect('[class^="search_"]', (o) => o.style.display = null);
}

function enterOptionsState() {
  querySelect('[class^="layer_"]:nth-of-type(1)', o => {
    o.setAttribute("aria-hidden", "true");
    o.style.opacity = "0";
    o.style.display = "none";
  });
  querySelect('[class^="layer_"]:nth-of-type(2)', o => {
    o.setAttribute("aria-hidden", "false");
    o.style.opacity = null;
    o.style.display = null;
  });
  
  uiState = "options";

  let leaveButton = document.createElement("div")
  leaveButton.innerHTML = '<svg aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M17.3 18.7a1 1 0 0 0 1.4-1.4L13.42 12l5.3-5.3a1 1 0 0 0-1.42-1.4L12 10.58l-5.3-5.3a1 1 0 0 0-1.4 1.42L10.58 12l-5.3 5.3a1 1 0 1 0 1.42 1.4L12 13.42l5.3 5.3Z" class=""></path></svg>'
  leaveButton.children[0].style.color = "var(--icon-tertiary)";
  leaveButton.style.cursor = "pointer";
  leaveButton.style.position = "fixed";
  leaveButton.style.zIndex = "101";
  leaveButton.style.color = "var(--interactive-normal)";
  leaveButton.style.top = "15px";
  leaveButton.style.left = "15px";
  leaveButton.style.width = "36px";
  leaveButton.style.height = "36px";
  leaveButton.style.borderRadius = "50%";
  leaveButton.style.borderStyle = "solid";
  leaveButton.style.borderWidth = "2px";
  leaveButton.style.display = "flex";
  leaveButton.style.alignItems = "center";
  leaveButton.style.justifyContent = "center";
  leaveButton.id = "leave-options-button";
  
  leaveButton.onclick = () => {
    leaveOptionsState();
    enterDefaultState();
  }
  
  document.body.appendChild(leaveButton);
}

function leaveOptionsState() {
  querySelect('[class^="layer_"]:nth-of-type(1)', o => {
    o.setAttribute("aria-hidden", "false");
    o.style.opacity = null;
    o.style.display = null;
  });
  querySelect('[class^="layer_"]:nth-of-type(2)', o => {
    o.setAttribute("aria-hidden", "true");
    o.style.opacity = "0";
    o.style.display = "none";
  });
  
  document.body.querySelector('[id="leave-options-button"]').remove();
}

function enterLoginState() {
  uiState = "login";
  
  console.log("we are in login state");
  
  let styles = document.createElement("style");
  styles.innerHTML = `
    [class^="centeringWrapper_"] > div > [class^="verticalSeparator_"] {
      display: none;
    }
    
    [class^="centeringWrapper_"] > div > [class^="transitionGroup_"] {
      display: flex;
    }

    [class^="centeringWrapper_"] > div {
      flex-wrap: wrap;
      justify-content: center;
      gap: 50px;
    }
    
    [class^="centeringWrapper_"] [class^="qrLoginInner"] > div:nth-of-type(2) {
      display: none;
    }
  `;

  document.body.appendChild(styles);
}

function leaveLoginState() {
  // unused
}

let startSwipe = null;

function touchDown(x, y) {
  if (startSwipe == null) {
    if (uiState == "default" && x > 0.8) {
      querySelect('[class^="page_"]', (o) => {
        o.style.width = "100vw";
      });
      
      startSwipe = [x, y];
    }
    
    if (uiState == "chat" && x < 0.2) {
      startSwipe = [x, y];
    }

    if (startSwipe) {
      let noSelectStyle = document.createElement("style");
      noSelectStyle.innerHTML = `
        * {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }`;
      noSelectStyle.id = "no-select-style";
      document.body.appendChild(noSelectStyle);
    }
  }
}

function touchMove(x, y) {
  if (startSwipe != null) {
    if (uiState == "default" &&
        startSwipe[0] > 0.8 &&
        startSwipe[0] > x) {
      let percent = Math.min((startSwipe[0] - x) / 0.3 * 100, 100);

      querySelect('[class^="page_"]', (o) => {
        o.style.right = (percent - 100) + "vw";
      });
    }
    
    if (uiState == "chat" &&
        startSwipe[0] < 0.2 &&
        startSwipe[0] < x) {
      let percent = Math.min((x - startSwipe[0]) / 0.3 * 100, 100);

      querySelect('[class^="page_"]', (o) => {
        o.style.right = (0 - percent) + "vw";
      });
    }
  }
}

function touchUp(x, y) {
  if (startSwipe != null) {
    document.body.querySelector('[id="no-select-style"]').remove();
    
    if (uiState == "default") {
      querySelect('[class^="page_"]', (o) => {
        o.style.width = null;
      });
      
      leaveDefaultState();
      enterDefaultState();
      
      if (startSwipe[0] > x && startSwipe[0] > 0.8 && startSwipe[0] - x > 0.3) {
        leaveDefaultState();
        enterChatState();
      }
    }

    if (uiState == "chat") {
      leaveChatState();
      enterChatState();
      
      if (startSwipe[0] < x && startSwipe[0] < 0.2 && x - startSwipe[0] > 0.3) {
        leaveChatState();
        enterDefaultState();
      }
    }
    
    startSwipe = null;
  }
}

function bindSwipes() {
  document.body.addEventListener("mousedown", (event) => {
    if (event.button == 0) {
      touchDown(event.clientX / document.documentElement.clientWidth, event.clientY / document.documentElement.clientHeight);
    }
  }, true);
  
  document.body.addEventListener("mousemove", (event) => {
    if (event.button == 0) {
      touchMove(event.clientX / document.documentElement.clientWidth, event.clientY / document.documentElement.clientHeight);
    }
  });
  
  document.body.addEventListener("mouseup", (event) => {
    if (event.button == 0) {
      touchUp(event.clientX / document.documentElement.clientWidth, event.clientY / document.documentElement.clientHeight);
    }
  });

  document.body.addEventListener("touchstart", (event) => {
    if (event.touches.length == 1) {
      touchDown(event.touches[0].clientX / document.documentElement.clientWidth, event.touches[0].clientY / document.documentElement.clientHeight);
    }
  }, true);
  
  document.body.addEventListener("touchmove", (event) => {
    if (event.changedTouches.length == 1) {
      touchMove(event.changedTouches[0].clientX / document.documentElement.clientWidth, event.changedTouches[0].clientY / document.documentElement.clientHeight);
    }
  });
  
  document.body.addEventListener("touchend", (event) => {
    if (event.changedTouches.length == 1) {
      touchUp(event.changedTouches[0].clientX / document.documentElement.clientWidth, event.changedTouches[0].clientY / document.documentElement.clientHeight);
    }
  });
}

let startHold = null
let startHoldTime = null

function bindRightClick() {
  document.body.addEventListener("touchstart", (event) => {
    if (startHold == null && event.touches.length == 1) {
      startHold = [event.touches[0].clientX, event.touches[1].clientY];
      startHoldTime = Date.now();
    }
  }, true);
  
  document.body.addEventListener("touchend", (event) => {
    if (startHold != null && event.changedTouches.length == 1 &&
        Math.abs(event.changedTouches[0].clientX - event.clientX) < 20 &&
        Math.abs(event.changedTouches[0].clientY - event.clientY) < 20) {
      const event = Object.assign(event.changedTouches[0], event);
      document.dispatchEvent(new MouseEvent("contextmenu", event));
    }
  });
}

function catchUrlChange() {
  const { pushState, replaceState } = window.history;

  window.history.pushState = function (...args) {
    pushState.apply(window.history, args);
    window.dispatchEvent(new Event('pushState'));
  };

  window.history.replaceState = function (...args) {
    replaceState.apply(window.history, args);
    window.dispatchEvent(new Event('replaceState'));
  };

  function onChangeUrl() {
    if (document.location.pathname == "/login" && uiState != "login") {
      doAlways();
    }
  }

  window.addEventListener('popstate', onChangeUrl);
  window.addEventListener('replaceState', onChangeUrl);
  window.addEventListener('pushState', onChangeUrl);
}

function doAlways() {
  catchUrlChange();
  
  querySelect('[class^="sidebarResizeHandle_"]', (o) => o.remove());
  querySelect('[class^="sidebarList_"]', (o) => o.style.width = "100%");
  querySelect('[class^="sidebar_"]', (o) => o.style.width = "100vw");
  // querySelect('[class^="content_"]', (o) => o.style.width = "100vw");

  document.ondragstart = () => { return false; };
  
  document.addEventListener("click", o => {
    if (o.target.closest('[class^="link_"]')) {
      if (uiState == "default") {
        leaveDefaultState();
        enterChatState();
      }
    }
    
    if (o.target.closest('[class^="buttons_"] > button:nth-of-type(2)')) {
      if (uiState == "default") {
        leaveDefaultState();
        enterOptionsState();
      }
    }
  }, true);

  let styles = document.createElement("style");
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
    
    [class^="popout_"] {
      display: none;
    }
    
    [class^="focusLock_"] > div,
    [class^="focusLock_"] > div > div,
    [class^="focusLock_"] > div > div > div {
      max-width: 100%;
      width: 100%;
    }

    [class^="focusLock_"] > div > div > div > [class^="body_"] > div:nth-of-type(2) > [class^="scroller"] > section:nth-of-type(2) > ul,
    [class^="focusLock_"] > div > div > div > [class^="body_"] > div:nth-of-type(2) > [role="tablist"] {
      flex-wrap: wrap;
      gap: 10px;
    }
    
    [class^="focusLock_"] > div > div > div > [class^="body_"] > div:nth-of-type(2) > [class^="scroller"] > section:nth-of-type(2) > ul > * {
      margin-left: 0;
    }
    
    [class^="layer_"]:nth-of-type(2) {
      overflow: scroll;
    }

    div:has(> div > div > svg > foreignObject > div[data-list-item-id="guildsnav___app-download-button"]) {
      display: none;
    }
    
    [class^="base_"] {
      grid-template-columns: [start] min-content [guildsEnd] 1fr [channelsEnd] 0fr [end];
    }
  `;
  
  document.body.appendChild(styles);

  bindSwipes();
  bindRightClick();
  
  if (document.location.pathname == "/login") {
    enterLoginState();
  } else {
    enterDefaultState();
  }
}

doAlways()
