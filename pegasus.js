// ==UserScript==
// @name         Margonem Pegasus
// @namespace    http://tampermonkey.net/
// @version      2025-10-14
// @description  podsłuch xd
// @author       Fan Grzibów (fobos)
// @match        https://*.margonem.pl/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=margonem.pl
// @grant        none
// @downloadURL  https://github.com/Capischon/margonem-pegasus/blob/main/pegasus.js
// @updateURL    https://github.com/Capischon/margonem-pegasus/blob/main/pegasus.js
// ==/UserScript==

const delay = (time) => new Promise(resolve => setTimeout(resolve, time * 1000));

const keywords = ["lambo", "sopel", "sopla"];

(async function() {
    'use strict';
    while (!document.querySelector(".game-window-positioner.default-cursor.classic-interface.eq-column-size-1.chat-size-1")){
        await delay(0.1);
    }
    requestNotificationPermission();
    createButton();
    pegasus();
    localStorage.getItem("observingStatus") === "ON" ? chatCheck() : null;
})();

function createButton(){
    const widgetButton = document.createElement("div");

    widgetButton.className = "widget-button";
    Object.assign(widgetButton.style, {
        width: "44px",
        height: "44px",
        left: "308px",
        position: "absolute",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    });

    localStorage.getItem("observingStatus") === "ON" || null ? widgetButton.classList.add("green") : widgetButton.classList.remove("green");

    widgetButton.innerHTML = `<img src="https://micc.garmory-cdn.cloud/obrazki/npc/mez/npc275.gif" style="max-height: 80%;">`;
    widgetButton.addEventListener("click", extensionButtonClick => {
        if (widgetButton.classList.contains("green")){
            widgetButton.classList.remove("green")
            localStorage.setItem("observingStatus","OFF");
        }
        else {
            widgetButton.classList.add("green");
            localStorage.setItem("observingStatus","ON");
        pegasus();
        }
    });

    document.querySelector(".top-left.main-buttons-container.ui-droppable.static-widget-position").appendChild(widgetButton);
}

function chatCheck(){
    const chat = document.querySelector(".one-message-wrapper.active").children;
    console.error(`Checking ${chat.length} messages...`);

    let wasSoundPlayed = false;

    for (let i = chat.length-1; i>=0; i--){
        const messageContainer = chat[i];
        const message = messageContainer.querySelector(".message-section").textContent;
        const soundPlayed = messageCheck(message, messageContainer, !wasSoundPlayed);

        if (soundPlayed && !wasSoundPlayed) {
            wasSoundPlayed = true;
        }
    }

    console.error("Done!");
}

function messageCheck(message, messageContainer, wasSoundPlayed){
    for (let keyword of keywords){
        if (message.toLowerCase().includes(keyword.toLowerCase())){
            messageContainer.style.backgroundColor = "rgba(100,255,255,0.2)";
            if (wasSoundPlayed) soundAlert(message);
            return true;
        }
    }
    return false;
}

function soundAlert(message){
    const notificationSound = new Audio("https://cdn.freesound.org/previews/758/758966_14213757-lq.mp3");
    notificationSound.volume = 0.4;
    notificationSound.play();
    if (Notification.permission === "granted" && document.hidden) {
        new Notification("Nowa wiadomość!", {icon: "https://micc.garmory-cdn.cloud/obrazki/npc/mez/npc275.gif", body: `${message}`});
    }
}

function pegasus() {

    const target = document.querySelector(".one-message-wrapper.active");
    const config = {childList: true};

    const callback = (mutationList, observer) => {
        for (const mutation of mutationList) {
            for (const addedNode of mutation.addedNodes) {
                const message = addedNode.querySelector(".message-section").textContent;
                messageCheck(message, addedNode);
            }
        }
    }
    const observer = new MutationObserver(callback);
    if (localStorage.getItem("observingStatus") === "ON"){
        observer.observe(target, config);
        console.error("Started observing!");
    }
    else {
        observer.disconnect();
        console.error("Not observing!");
    }
}

function requestNotificationPermission() {
    if (Notification.permission !== "granted") Notification.requestPermission();

}
