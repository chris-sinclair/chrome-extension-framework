/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 Chris Sinclair
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

//namespace
this.wcef = this.wcef || {
    /**
     * Static port name Panel -> Background
     */
    PANEL_TO_BACKGROUND_PORT_NAME: "panel-to-background-port",
    /**
     * Static port name Content -> Background
     */
    CONTENT_TO_BACKGROUND_PORT_NAME: "content-script-to-background-port",
    /**
     * Static port name Background -> Panel
     */
    BACKGROUND_TO_PANEL_PORT_NAME: "background-to-panel-port",
    /**
     * Static port name Background -> Content
     */
    BACKGROUND_TO_CONTENT_PORT_NAME: "background-to-content-script-port",
    /**
     * Static DIV id for Content -> Page
     */
    CONTENT_TO_PAGE_DIV_ID: "wcef-c2p",
    /**
     * Static Event id for Content -> Page
     */
    CONTENT_TO_PAGE_EVENT_ID: "wcef-c2p-event",
    /**
     * Static DIV id for Page -> Content
     */
    PAGE_TO_CONTENT_DIV_ID: "wcef-p2c",
    /**
     * Static Event id for Page -> Content
     */
    PAGE_TO_CONTENT_EVENT_ID: "wcef-p2c-event",
    /**
     * Static event id for Panel Communication Event
     */
    PANEL_COMMUNICATION_EVENT: "wcef.event.PANEL_COMMUNICATION_EVENT",
    /**
     * Static event id for Content Communication Event
     */
    CONTENT_COMMUNICATION_EVENT: "wcef.event.CONTENT_COMMUNICATION_EVENT",
    /**
     * Static event id for Background Communication Event
     */
    BACKGROUND_COMMUNICATION_EVENT: "wcef.event.BACKGROUND_COMMUNICATION_EVENT",
    /**
     * Static event id for Page Communication Event
     */
    PAGE_COMMUNICATION_EVENT: "wcef.event.PAGE_COMMUNICATION_EVENT",
    /**
     * Static Message Action - Diagnostic PING.
     */
    MESSAGE_ACTION_DIAGNOSTIC_PING: "wcef.action.MESSAGE_ACTION_DIAGNOSTIC_PING",
    /**
     * Static script location.
     */
    FRAMEWORK_SCRIPT_LOCATION: "js/vendor/webnetic/"
};

/**
 * Really basic event object.
 * @param type
 * @param data
 * @constructor
 */
var Event = function (type, data) {
    this.type = type;
    this.data = data;
    this.target = data;
};

wcef.Event = Event;

/**
 * Really basic event dispatcher class, extended by all the controller classes.
 * @constructor
 */
var EventDispatcher = function () {
};

EventDispatcher.prototype._events = {};

/**
 * Use this method to add a listener to be notified when an event occurs.
 *
 * @param eventType
 * @param handler
 */
EventDispatcher.prototype.listen = function (eventType, handler) {
    if (!this._events.hasOwnProperty(eventType))this._events[eventType] = [];
    this._events[eventType].push(handler);
};

/**
 * Use this method to dispatch an event from the event dispatcher.
 *
 * @param eventObject
 */
EventDispatcher.prototype.dispatch = function (eventObject) {
    if (this._events[eventObject.type]) {
        for (var i = 0; i < this._events[eventObject.type].length; i++) {
            eventObject.target = this;
            this._events[eventObject.type][i](eventObject);
        }
    }
};

wcef.EventDispatcher = EventDispatcher;

/**
 * Class to control in page functionality of the extension. This should be instantiated in the page app,
 * should be listened to for the CONTENT_COMMUNICATION_EVENT, notifying of inbound communication for the
 * Content Script.
 *
 * Constructor
 * @constructor
 */
var WCEFPageController = function () {

};

/**
 * Extends the EventDispatcher class.
 * @type {EventDispatcher}
 */
WCEFPageController.prototype = new EventDispatcher();

/**
 * Initialisation, finds the communication DIVs that have been generated in the DOM by the Content Script.
 * Reads the @_extensionURL that has been set, allowing the page to load any externally available resources
 * supplied by the extension. Adds a listener to the inbound communication DIV.
 */
WCEFPageController.prototype.initialise = function () {
    var scope = this;
    this._contentScriptToPageCommunicationDiv = document.getElementById(wcef.CONTENT_TO_PAGE_DIV_ID);
    this._pageToContentScriptCommunicationDiv = document.getElementById(wcef.PAGE_TO_CONTENT_DIV_ID);
    this._extensionURL = this._contentScriptToPageCommunicationDiv.innerText;
    this._contentScriptToPageCommunicationDiv.innerText = "";
    this._contentScriptToPageCommunicationDiv.addEventListener(wcef.CONTENT_TO_PAGE_EVENT_ID, function (e) {
        scope._handleContentScriptToPageCommand(e);
    });
};

/**
 * Use this method to load JS from the extension directory directly into the page. Will notify @param callback
 * when the load is complete. The script must be referenced in the "web_accessible_resources" part of the manifest.json
 * @param filename
 * @param callback
 */
WCEFPageController.prototype.loadScriptFromExtensionDirectory = function (filename, callback) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.onload = function () {
        callback();
    };
    script.src = this._extensionURL + filename;
    document.getElementsByTagName("head")[0].appendChild(script);
};

/**
 * Use this method to communicate with the Content Script from the page.
 *
 * @param message
 */
WCEFPageController.prototype.sendMessageToContentScript = function (message) {
    var newEvent = document.createEvent('Event');
    newEvent.initEvent(wcef.PAGE_TO_CONTENT_EVENT_ID, true, true);
    this._pageToContentScriptCommunicationDiv.innerText = JSON.stringify(message);
    this._pageToContentScriptCommunicationDiv.dispatchEvent(newEvent);
};

/**
 * Listener for incoming communication for the the Content Script. Checks for internal action, and if not notifies
 * via an event.
 * @param e
 * @private
 */
WCEFPageController.prototype._handleContentScriptToPageCommand = function (e) {
    var message = JSON.parse(this._contentScriptToPageCommunicationDiv.innerText);
    this._contentScriptToPageCommunicationDiv.innerText = "";
    switch (message.action) {
        case wcef.MESSAGE_ACTION_DIAGNOSTIC_PING:
            this.sendMessageToContentScript({action: wcef.MESSAGE_ACTION_DIAGNOSTIC_PING, data: {originator: message.data.originator, from: "WCEFPageController", available: true}});
            break;
        default:
            this.dispatch(new wcef.Event(wcef.CONTENT_COMMUNICATION_EVENT, message));
            break;
    }
};

wcef.WCEFPageController = WCEFPageController;

/**
 * Class to control communication between Background <-> Content Script <-> In Page functionality
 *
 * Constructor
 * @constructor
 */
var WCEFContentController = function () {

};

/**
 * Extends EventDispatcher
 * @type {EventDispatcher}
 */
WCEFContentController.prototype = new EventDispatcher();

/**
 * Initialise
 */
WCEFContentController.prototype.initialise = function () {
    this._insertScriptTagsIntoPage();
    this._createPageCommunication();
    this._createBackgroundScriptCommunicationPorts();
};

/**
 * Use this method to communicate with the page. Populates the communication div with the message, and then
 * dispatches an event to notify the page.
 * @param message
 */
WCEFContentController.prototype.sendMessageToPage = function (message) {
    var newEvent = document.createEvent('Event');
    newEvent.initEvent(wcef.CONTENT_TO_PAGE_EVENT_ID, true, true);
    this._contentScriptToPageCommunicationDiv.innerText = JSON.stringify(message);
    this._contentScriptToPageCommunicationDiv.dispatchEvent(newEvent);
};

/**
 * Inserts script tags into the DOM of the page, allowing extension functionality to exist in any page that matches
 * the URL set in the content_scripts manifest.json setting.
 * @private
 */
WCEFContentController.prototype._insertScriptTagsIntoPage = function () {
    var domScriptTag = document.createElement("SCRIPT");
    domScriptTag.type = "text/javascript";
    domScriptTag.src = chrome.extension.getURL(wcef.FRAMEWORK_SCRIPT_LOCATION + "wcef.js");
    domScriptTag.defer = "defer";
    document.head.insertBefore(domScriptTag, document.head.lastChild);

    domScriptTag = document.createElement("SCRIPT");
    domScriptTag.type = "text/javascript";
    domScriptTag.src = chrome.extension.getURL("js/page.app.js");
    domScriptTag.defer = "defer";
    document.head.insertBefore(domScriptTag, document.head.lastChild);
};

/**
 * Creates the DIVs needed for communication between the Content Script and the In Page functionality. Then listens
 * to the incoming DIV for events dispatched.
 * @private
 */
WCEFContentController.prototype._createPageCommunication = function () {
    this._contentScriptToPageCommunicationDiv = document.createElement("div");
    this._contentScriptToPageCommunicationDiv.id = wcef.CONTENT_TO_PAGE_DIV_ID;
    this._contentScriptToPageCommunicationDiv.innerText = chrome.extension.getURL("js/content/");

    document.body.insertBefore(this._contentScriptToPageCommunicationDiv, document.body.lastChild);

    this._pageToContentScriptCommunicationDiv = document.createElement("div");
    this._pageToContentScriptCommunicationDiv.id = wcef.PAGE_TO_CONTENT_DIV_ID;
    document.body.insertBefore(this._pageToContentScriptCommunicationDiv, document.body.lastChild);

    var scope = this;
    this._pageToContentScriptCommunicationDiv.addEventListener(wcef.PAGE_TO_CONTENT_EVENT_ID, function (e) {
        scope._handleCommunicationFromPage(e);
    });
};

/**
 * Creates the ports for communication between the Content Script and the Background. Then listens to the
 * inbound port for communication.
 * @private
 */
WCEFContentController.prototype._createBackgroundScriptCommunicationPorts = function () {
    var scope = this;
    this._backgroundToContentScriptPort = chrome.runtime.connect({name: wcef.BACKGROUND_TO_CONTENT_PORT_NAME});
    this._backgroundToContentScriptPort.onMessage.addListener(function (message) {
        scope._handleBackgroundScriptPortMessage(message);
    });
    this._contentToBackroundPort = chrome.runtime.connect({name: wcef.CONTENT_TO_BACKGROUND_PORT_NAME});
};

/**
 * Handles messages from the background script. Checks for internal messages, and if not then notifies
 * externals. Finally passes messages into the page.
 * @param message
 * @private
 */
WCEFContentController.prototype._handleBackgroundScriptPortMessage = function (message) {
    switch (message.action) {
        case wcef.MESSAGE_ACTION_DIAGNOSTIC_PING:
            this._contentToBackroundPort.postMessage({action: wcef.MESSAGE_ACTION_DIAGNOSTIC_PING, data: {originator: message.data.originator, from: "WCEFContentController", available: true}});
            this.sendMessageToPage(message);
            break;
        default:
            this.dispatch(new wcef.Event(wcef.BACKGROUND_COMMUNICATION_EVENT, message));
            this.sendMessageToPage(message);
            break;
    }
};

/**
 * Handles incoming communication for the page. Grabs the message from the communication DIV, clears the div,
 * parses the message. Passes the message on to the background script, and if not internal then notifies externals.
 * @private
 */
WCEFContentController.prototype._handleCommunicationFromPage = function () {
    var eventData = this._pageToContentScriptCommunicationDiv.innerText;
    var message = JSON.parse(eventData);
    this._pageToContentScriptCommunicationDiv.innerText = "";
    this._contentToBackroundPort.postMessage(message);

    switch (message.action) {
        case wcef.MESSAGE_ACTION_DIAGNOSTIC_PING:
            //Currently do nothing.
            break;
        default:
            this.dispatch(new wcef.Event(wcef.PAGE_COMMUNICATION_EVENT, message));
            break;
    }

};

wcef.WCEFContentController = WCEFContentController;

/**
 * Class to control extension Background functionality. Manages communication Panel <-> Background <-> Content Script.
 * Allows the Content Script and the Panel to define the communication ports, since they will instantiate later.
 *
 * Constructor
 * @constructor
 */
var WCEFBackgroundController = function () {

};

/**
 * Extends Event Dispatcher
 * @type {EventDispatcher}
 */
WCEFBackgroundController.prototype = new EventDispatcher();

/**
 * Initialse
 */
WCEFBackgroundController.prototype.initialise = function () {
    this._listenForPortConnections();
};

/**
 * Listens to all Chrome runtime port connections, looking for matches to the static port IDs
 * If a new connection matches an incoming port, then adds a listener for new messages.
 * @private
 */
WCEFBackgroundController.prototype._listenForPortConnections = function () {
    var scope = this;
    chrome.runtime.onConnect.addListener(function (port) {
        switch (port.name) {
            case wcef.CONTENT_TO_BACKGROUND_PORT_NAME:
                scope._contentScriptToBackgroundPort = port;
                scope._contentScriptToBackgroundPort.onMessage.addListener(function (message) {
                    scope._handleContentCommunication(message);
                });
                break;
            case wcef.PANEL_TO_BACKGROUND_PORT_NAME:
                scope._panelToBackgroundPort = port;
                scope._panelToBackgroundPort.onMessage.addListener(function (message) {
                    scope._handlePanelCommunication(message);
                });
                break;
            case wcef.BACKGROUND_TO_PANEL_PORT_NAME:
                scope._backgroundToPanelPort = port;
                break;
            case wcef.BACKGROUND_TO_CONTENT_PORT_NAME:
                scope._backgroundToContentScriptPort = port;
                break;
        }
    });
};

/**
 * Handle incoming communication for the panel. Checks for internal actions, notifies externals, and if Content Script
 * communication is available, then passes the message on.
 *
 * @param message
 * @private
 */
WCEFBackgroundController.prototype._handlePanelCommunication = function (message) {
    switch (message.action) {
        case wcef.MESSAGE_ACTION_DIAGNOSTIC_PING:
            this._backgroundToPanelPort.postMessage({action: wcef.MESSAGE_ACTION_DIAGNOSTIC_PING, data: {originator: message.data.originator, from: "WCEFBackgroundController", available: true}});
            if (!this._backgroundToContentScriptPort)this._backgroundToPanelPort.postMessage({action: wcef.MESSAGE_ACTION_DIAGNOSTIC_PING, data: {originator: message.data.originator, from: "WCEFContentController", available: false}});
            else this._backgroundToContentScriptPort.postMessage(message);
            break;
        default:
            this.dispatch(new wcef.Event(wcef.PANEL_COMMUNICATION_EVENT, message));
            if (this._backgroundToContentScriptPort)this._backgroundToContentScriptPort.postMessage(message);
            else console.log("App has no configured Content Script to pass message to.");
            break;
    }
};

/**
 * Handles incoming communication for the content script. Checks for internal, and notifies externals. Passes
 * the message on to the panel if available.
 *
 * @param message
 * @private
 */
WCEFBackgroundController.prototype._handleContentCommunication = function (message) {
    switch (message.action) {
        case wcef.MESSAGE_ACTION_DIAGNOSTIC_PING:
            this._backgroundToPanelPort.postMessage({action: wcef.MESSAGE_ACTION_DIAGNOSTIC_PING, data: {originator: message.data.originator, from: message.data.from, available: message.data.available}});
            break;
        default:
            this.dispatch(new wcef.Event(wcef.CONTENT_COMMUNICATION_EVENT, message));
            if (this._backgroundToPanelPort)this._backgroundToPanelPort.postMessage(message);
            break;
    }
};

wcef.WCEFBackgroundController = WCEFBackgroundController;

/**
 * Class to control extension Panel functionality. Manages communication between the panel and the
 * Background script.
 *
 * Constructor
 * @constructor
 */
var WCEFPanelController = function () {

};

/**
 * Extends EventDispatcher
 * @type {EventDispatcher}
 */
WCEFPanelController.prototype = new EventDispatcher();

/**
 * Initialise. Trigger connection diagnostic.
 */
WCEFPanelController.prototype.initialise = function () {
    this._createBackgroundCommunicationPorts();
    console.info("Initialising WCEF");
    this.sendMessageToBackground({action: wcef.MESSAGE_ACTION_DIAGNOSTIC_PING, data: {originator: "WCEFPanelController"}});
};

/**
 * Use this method to send messages to the Background Script.
 * @param message
 */
WCEFPanelController.prototype.sendMessageToBackground = function (message) {
    this._panelToBackgroundPort.postMessage(message);
};

/**
 * Creates the communication ports for data exchange between the panel and the background script.
 * Listens to the inbound port for new messages.
 * @private
 */
WCEFPanelController.prototype._createBackgroundCommunicationPorts = function () {
    var scope = this;
    this._backgroundToPanelPort = chrome.runtime.connect({name: wcef.BACKGROUND_TO_PANEL_PORT_NAME});
    this._backgroundToPanelPort.onMessage.addListener(function (e) {
        scope._handleBackgroundCommunication(e);
    });
    this._panelToBackgroundPort = chrome.runtime.connect({name: wcef.PANEL_TO_BACKGROUND_PORT_NAME });
};

/**
 * Handles incoming messages for the background script. Routes internal actions or notifies externals.
 *
 * @param message
 * @private
 */
WCEFPanelController.prototype._handleBackgroundCommunication = function (message) {
    switch (message.action) {
        case wcef.MESSAGE_ACTION_DIAGNOSTIC_PING:
            this._handleDiagnosticPing(message);
            break;
        default:
            this.dispatch(new wcef.Event(wcef.BACKGROUND_COMMUNICATION_EVENT, message));
            break;
    }
};

/**
 * Handles the results from a MESSAGE_ACTION_DIAGNOSTIC_PING, logging them to the console.
 * @param message
 * @private
 */
WCEFPanelController.prototype._handleDiagnosticPing = function (message) {
    var element;
    var logmessage = "DIAGNOSTIC RESPONSE:";
    switch (message.data.from) {
        case "WCEFBackgroundController":
            element = $("#background-comm-check");
            logmessage += " Background Controller ";
            break;
        case "WCEFContentController":
            element = $("#content-comm-check");
            logmessage += " Content Controller ";
            break;
        case "WCEFPageController":
            element = $("#page-comm-check");
            logmessage += " Page Controller ";
            break;
        default:
            logmessage += " Unknown diagnostic response from " + message.data.from;
            break;
    }
    if (element)element.removeClass("label-default");
    switch (message.data.available) {
        case true:
            if (element)element.addClass("label-success");
            logmessage += " good to go :) ";
            break;
        case false:
            if (element)element.addClass("label-danger");
            logmessage += " not available :( ";
            break;
        default:
            if (element)element.addClass("label-warning");
            logmessage += " indeterminate state??? ";
            break;
    }
    console.log(logmessage);
};

wcef.WCEFPanelController = WCEFPanelController;