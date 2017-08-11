import { } from "../libs/shims.js"
import { Gamee } from "./gameeAPI.js"
import { core } from "./core.js"
import { PlatformAPI, PlatformBridge, PostMessageBridge, MobileBridge, FacebookBridge } from "./platform_bridge.js"


/**
 * Instance of gamee object with API for developers. 
 * Internal functions becomes private this way
 * 
 * @requires Gamee
 */
export var gamee;

/**
 * Resolves what platform is being used and make instance of platform API. 
 * 
 * @requires PlatformBridge
 */
var platformBridge = (function () {

    var platformBridge, platformType = "web";

    // Reslove Gamee enviroment
    /* current user agent */
    var userAgent = navigator.userAgent.toLowerCase();

    if ((window.parent !== window) && (/facebook\./.test(document.referrer) || /messenger\.com/.test(document.referrer))) { // FB
        // TODO fb platform
        platformType = "fb";
    } else if (/iphone|ipod|ipad/.test(userAgent)) { // test ios device
        // user agent is use to determine current enviroment

        // Test if window with game have a parent (loading in iframe)
        if (window.self !== window.top) {
            platformType = "web";
        } else {
            platformType = "ios";
        }
    } else if (/gamee\/[0-9\.]+$/.test(userAgent)) { // test android app
        // TODO do you really test android like that?
        platformType = "android";
    } else if (window.parent) { // TODO doesnt make sence, parent always exists!!
        platformType = "web";
    } else if (window.parent && window.parent.gameeSimulator) { // TODO doesnt make sence, parent always exist?
        platformType = "web";
    }

    gamee = new Gamee(platformType);

    window.gamee = gamee;

    switch (platformType) {
        case "web":
            if (window.parent === window) {
                console.error("Gamee must run in iframe on web platform");
            }
            platformBridge = new PostMessageBridge(window.parent);
            break;
        case "ios":
            platformBridge = new MobileBridge("ios");
            break;
        case "android":
            platformBridge = new MobileBridge("android");
            break;
        case "fb":
            platformBridge = new FacebookBridge("fb");
            break;
        default:
            throw "Can't identify the platform";
    }
    return platformBridge;
})();

core.PlatformAPI = PlatformAPI;
core.native = platformBridge;

PlatformAPI.emitter = gamee.emitter;


function loadScript(url, callback) {
    // Adding the script tag to the head as suggested before
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.src = url;

    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility.
    script.onreadystatechange = callback;
    script.onload = callback;

    // Fire the loading
    head.appendChild(script);
}