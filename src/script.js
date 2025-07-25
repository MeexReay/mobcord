// ==UserScript==
// @name            Mobcord
// @description     Discord client for mobile linux
// @author          MeexReay (https://github.com/MeexReay)
// @license         WTFPL
// @match           *://*.discord.com/*
// @run-at          document-start
// ==/UserScript==

let querySelectCache = {};

function querySelect(selector, callback, not_prev=false) {
  if (!not_prev && selector in querySelectCache) {
    callback(querySelectCache[selector]);
    return;
  }
  
  const existing = document.querySelector(selector);
  if (existing && (
    !not_prev ||
    !(selector in querySelectCache) ||
    existing != querySelectCache[selector]
  )) {
    querySelectCache[selector] = existing;
    callback(existing);
    return;
  }

  const observer = new MutationObserver((_, obs) => {
    const found = document.querySelector(selector);
    if (found && (
      !not_prev ||
      !(selector in querySelectCache) ||
      found != querySelectCache[selector]
    )) {
      obs.disconnect();
      querySelectCache[selector] = found;
      callback(found);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

function querySelectAlways(selector, callback) {
  const existing = document.querySelectorAll(selector);
  for (found of existing) {
    callback(found);
  }

  const observer = new MutationObserver((mutations, _) => {
    for (let mutation of mutations) {
      for (let node of mutation.addedNodes) {
        if (node.nodeType == 1) {
          if (node.matches(selector)) { 
            callback(node);
          }
          for (found of node.querySelectorAll(selector)) {
            callback(found);
          }
        }
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

let uiState = null;

let allowTextBoxFocus = false;

function enterDefaultState() {
  uiState = "default";

  allowTextBoxFocus = false;
  
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

  // setTimeout(() => {
  //   allowTextBoxFocus = true;
  // }, 3000)

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
    leaveButton.addEventListener("touchdown", () => {
      leaveChatState();
      enterDefaultState();
    }, true)
    leaveButton.addEventListener("mousedown", () => {
      leaveChatState();
      enterDefaultState();
    }, true)
    o.appendChild(leaveButton);
  });
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
  leaveButton.style.background = "var(--background-base-lowest)";
  leaveButton.id = "leave-options-button";
  
  leaveButton.onclick = () => {
    leaveOptionsState();
    enterDefaultState();
  }
  
  document.body.appendChild(leaveButton);

  document.body.style.zoom = "80%";
}

function leaveOptionsState() {
  window.dispatchEvent(new KeyboardEvent('keydown', {
    key: 'Escape',
    keyCode: 27,
    code: "Escape",
    which: 27,
    shiftKey: false,
    ctrlKey: false,
    metaKey: false
  }));
    
  document.body.querySelector('[id="leave-options-button"]').remove();

  document.body.style.zoom = "100%";
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
      let percent = Math.min((startSwipe[0] - x) * 100, 100);

      querySelect('[class^="page_"]', (o) => {
        o.style.right = (percent - 100) + "vw";
      });
    }
    
    if (uiState == "chat" &&
        startSwipe[0] < 0.2 &&
        startSwipe[0] < x) {
      let percent = Math.min((x - startSwipe[0]) * 100, 100);

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

function bindTextBoxFocus() {
  querySelectAlways(
    '[role="textbox"]',
    o => {
      o.blur();
      o.addEventListener("focus", e => {
        console.log(allowTextBoxFocus);
        if (!allowTextBoxFocus) {
          e.preventDefault();
          o.blur();
        }
      })
    }
  );
  
  document.addEventListener("focus", e => {
    console.log(allowTextBoxFocus);
    if (e.target.closest('[role="textbox"]') && !allowTextBoxFocus) {
      e.preventDefault();
      e.target.blur();
    }
  }, true);
  
  document.addEventListener("click", o => {
    let textbox = o.target.closest('[role="textbox"]')

    if (textbox) {
      allowTextBoxFocus = true;
      textbox.focus();
    }
  }, true);
}

function bindOptionsLayer() {
  querySelectAlways('[class^="layer_"][aria-hidden="false"] > [class^="standardSidebarView_"]', o => {
    console.log(o)
    if (uiState == "default") {
      leaveDefaultState();
      enterOptionsState();
    }
  })
}

function onLoadInternal() {
  catchUrlChange();
  
  querySelect('[class^="sidebarResizeHandle_"]', (o) => o.remove());
  querySelect('[class^="sidebarList_"]', (o) => o.style.width = "100%");
  querySelect('[class^="sidebar_"]', (o) => o.style.width = "100vw");
  // querySelect('[class^="content_"]', (o) => o.style.width = "100vw");

  document.ondragstart = () => { return false; };
  
  document.addEventListener("click", o => {
    if (o.target.closest('[class^="link_"]') && !o.target.closest('[class^="linkTop_"] > [class^="children_"] > [class^="iconItem_"]')) {
      if (uiState == "default") {
        leaveDefaultState();
        enterChatState();
      }
    }
  }, true);

  let styles = document.createElement("style");
  styles.innerHTML = `
    /* remove ugly shadow on top bar in chat */
    [class^="upperContainer_"] > div[class^="children_"]:after {
      background: none;
    }

    /* add scrollbar on top bar in chat */
    [class^="upperContainer_"] {
      overflow-x: scroll;
      overflow-y: hidden;
    }
    [class^="upperContainer_"] > [class^="children_"] {
      min-width: max-content;
    }

    /* remove scrollbar from top bar in chat but allow scrolling */
    [class^="upperContainer_"]::-webkit-scrollbar {
      display: none;
    }

    /* remove threads popups on channels */
    [class^="popout_"] {
      display: none;
    }

    /* fix profile view */
    .user-profile-modal-v2 {
      width: 400px;
      max-width: 100%;
      min-width: 0;
    }
    .user-profile-modal-v2 > [class^="inner_"] {
      flex-wrap: wrap;
      width: 100%;
      max-width: 100%;
      overflow: hidden scroll;
      box-sizing: border-box;
      padding: 0;
    }
    .user-profile-modal-v2 > [class^="inner_"] > [class^="container_"] {
      height: auto;
      box-sizing: border-box;
      width: 100%;
      padding: 20px 20px 0;
    }
    .user-profile-modal-v2 > [class^="inner_"] > [class^="profile_"] {
      width: 100%;
    }
    :where(.outer_c0bea0).user-profile-modal-v2 {
      width: 400px;
      max-width: 100%;
      min-width: 0;
      height: auto;
      max-height: 800px;
    }

    /* allow scrolling in settings */
    [class^="layer_"]:nth-of-type(2) {
      overflow: scroll;
    }

    /* remove download button */
    div:has(> div > div > svg > foreignObject > div[data-list-item-id="guildsnav___app-download-button"]) {
      display: none;
    }

    /* set base grid (for transitions between chat and sidebar) */
    [class^="base_"] {
      grid-template-columns: [start] min-content [guildsEnd] 1fr [channelsEnd] 0fr [end];
    }

    /* set transitions for chat and sidebar */
    [class^="page_"] {
      transition: right 0.1s, width 0.4s;
    }

    /* fix image view */
    [class^="carouselModal_"] [class^="author_"] {
      width: max-content;
    }
    [class^="carouselModal_"] [class^="topBar_"] {
      display: flex;
      width: 100%;
      margin-bottom: auto;
    }
    [class^="carouselModal_"] [class^="mediaArea_"] {
      margin-bottom: auto;
    }
    [class^="carouselModal_"] [class^="topBar_"] > div:nth-of-type(1) {
      align-self: start;
      justify-self: start;
      width: 40px;
      margin-right: 2px;
    }
    [class^="carouselModal_"] [class^="topBar_"] > [class^="actionButtons_"] {
      margin-left: auto;
      margin-right: 5px;
    }
    [class^="carouselModal_"] {
      width: 100%;
      height: 100%;
      position: unset;
      display: flex;
      padding: 30px 24px;
      box-sizing: border-box;
      flex-direction: column;
      justify-content: center;
      margin: 0;
    }
    [class^="focusLock_"] {
      width: 100%;
      height: 100%;
    }
    
    
    /* fix emoji picker */
    #emoji-picker-tab-panel,
    [class^="emojiPicker_"],  {
      width: 100%;
    }
    [class^="emojiPicker_"] > [class^="header_"]  {
      display: none;
    }
    #emoji-picker-tab-panel > [class^="wrapper_"] {
      top: 0;
    }

    /* remove ugly bottom spacing */
    [class^="channelTextArea"] {
      margin-bottom: 10px;
    }
  `;
  
  document.body.appendChild(styles);

  bindSwipes();
  bindRightClick();
  bindTextBoxFocus();
  bindOptionsLayer();
  
  if (document.location.pathname == "/login") {
    enterLoginState();
  } else {
    enterDefaultState();
  }
}

function onUnloadInternal() {
  
}
