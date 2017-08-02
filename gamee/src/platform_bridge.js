import { core } from "./core.js"

/**
 * 
 * @requires core
 * 
 * @typedef PlatformAPI
 * @param {EventTarget} emitter
 * @param {function} _pause
 * @param {function} _resume
 * @param {function} _ghostShow
 * @param {function} _ghostHide
 * @param {function} _mute
 * @param {function} _unmute
 * @param {function} _start
 */
export var PlatformAPI = {
	emitter: null,
	pause: function (cb) {
		var event = new CustomEvent('pause', {
			detail: {
				callback: cb
			}
		});
		this.emitter.dispatchEvent(event);
	},
	resume: function (cb) {
		var event = new CustomEvent('resume', {
			detail: {
				callback: cb
			}
		});
		this.emitter.dispatchEvent(event);
	},
	ghostShow: function (cb) {
		var event = new CustomEvent('ghostShow', {
			detail: {
				callback: cb
			}
		});
		this.emitter.dispatchEvent(event);
	},
	ghostHide: function (cb) {
		var event = new CustomEvent('ghostHide', {
			detail: {
				callback: cb
			}
		});
		this.emitter.dispatchEvent(event);
	},
	mute: function (cb) {
		var event = new CustomEvent('mute', {
			detail: {
				callback: cb
			}
		});
		this.emitter.dispatchEvent(event);
	},
	unmute: function (cb) {
		var event = new CustomEvent('unmute', {
			detail: {
				callback: cb
			}
		});
		this.emitter.dispatchEvent(event);
	},
	start: function (data, cb) {
		var event = new CustomEvent('start', {
			detail: {
				callback: cb
			}
		});

		var error = core.startSignal(data);
		if (error) {
			cb(error);
			return;
		}

		if (data.replay)
			event.detail.opt_replay = true;
		if (data.ghostMode)
			event.detail.opt_ghostMode = true;
		if (data.resetState)
			event.detail.opt_resetState = true;

		this.emitter.dispatchEvent(event);
	}
};


/**
 * @class PlatformBridge
 * 
 */
export function PlatformBridge() {
	this.requests = {};
	this.platform = "";
	this._init();
}

PlatformBridge.prototype = {
	instCount: 0,
	_init: function () {
	},
	createRequest: function (method, opt_requestData, opt_callback) {
		if (!this.validateMethod(method))
			return;
		if (typeof opt_requestData === 'function') {
			opt_callback = opt_requestData;
			opt_requestData = undefined;
		}

		var messId = this.instCount++;

		if (typeof opt_callback !== 'undefined') {
			this.requests[messId] = opt_callback;
		}

		var preparedObject = {
			request: {
				method: method,
				messageId: messId,
				data: null
			}
		};

		this.doCall(preparedObject, opt_requestData);
	},
	validateMethod: function (method) {
		return method === "gameLoadingProgress" ? false : true;
	},
	/**
	 * @abstract
	 */
	doCall: function (preparedObject, requestData) {
		throw "Not implemented";
	},
	_callback: function (id, responseData) {
		var cb = this.requests[id];
		delete this.requests[id];
		if (cb)
			cb(responseData);
	},
	/**
	 * @abstract
	 */
	doResponse: function (preparedObject, responseData) {
		throw "Not implemented";
	},
};


/**
 * @class PostMessageBridge
 * @requires PlatformBridge
 */
export function PostMessageBridge(endpoint) {
	this._gameeWin = endpoint;
	PlatformBridge.call(this);
	this.platform = "web";
}

PostMessageBridge.prototype = Object.create(PlatformBridge.prototype);
PostMessageBridge.prototype.constructor = PostMessageBridge;

PostMessageBridge.prototype._init = function () {

	window.addEventListener('message', function (ev) {
		// if(ev.origin === "source we want")
		// console.log("_triggerMessage detail: " + ev.detail);
		// console.log("_triggerMessage data: " + ev.data);
		var data;
		if (typeof ev.detail === "object" && typeof ev.detail !== null) {
			data = ev.detail;
		} else if (typeof ev.data === "object") {
			data = ev.data;
		} else {
			// message is not from native platform
			return;
		}
		// this is request
		if (data.request && data.request.method && typeof data.request.messageId !== "undefined") {
			this._resolveAPICall(data.request.method, data.request.messageId, data.request.data);
		}
		// this is reponse
		else if (data.response && typeof data.response.messageId !== "undefined") {
			if (data.error)
				throw data.error;
			this._callback(data.response.messageId, data.response.data);
		}
		// else this message target is not this framework
	}.bind(this), false);
};


PostMessageBridge.prototype.doCall = function (preparedObject, requestData) {
	if (typeof requestData === "object") {
		preparedObject.request.data = requestData || {};
	}
	this._gameeWin.postMessage(preparedObject, "*");
};

PostMessageBridge.prototype.doResponse = function (messageId, responseData) {
	var preparedObject = {
		version: this.version,
		response: {
			messageId: messageId
		}
	};

	if (responseData)
		preparedObject.data = responseData;

	this._gameeWin.postMessage(preparedObject, "*");
};

PostMessageBridge.prototype._resolveAPICall = function (method, messageId, opt_data) {
	var cb = this.doResponse.bind(this, messageId);

	switch (method) {
		case "pause":
			PlatformAPI.pause(cb);
			break;
		case "resume":
			PlatformAPI.resume(cb);
			break;
		case "mute":
			PlatformAPI.mute(cb);
			break;
		case "unmute":
			PlatformAPI.unmute(cb);
			break;
		case "ghostShow":
			PlatformAPI.ghostShow(cb);
			break;
		case "ghostHide":
			PlatformAPI.ghostHide(cb);
			break;
		case "start":
			if (!opt_data) {
				throw "Method _start missing params";
			}
			PlatformAPI.start(opt_data, cb);
			break;
		default:
			console.error("Unknown method call");
	}
};


/**
 * @class MobileBridge
 * @requires PlatformBridge
 * 
 */
export function MobileBridge(device) {
	this.device = device;
	PostMessageBridge.call(this);
	this.platform = "mobile";
}

MobileBridge.prototype = Object.create(PostMessageBridge.prototype);
MobileBridge.prototype.constructor = MobileBridge;

MobileBridge.prototype._init = function () {
	PostMessageBridge.prototype._init.call(this);
	if (this.device === "ios") {
		this._gameeWin = webkit.messageHandlers.callbackHandler;
	} else if (this.device === "android") {
		this._gameeWin = _toDevice;
	} else {
		throw "Unknown device used in webkit bridge";
	}

	window._triggerMessage = function (data) {
		try {
			data = JSON.parse(data); // message is custom message from IOS/android platform
		} catch (err) {
			throw "Couldn't parse message from native app: \n" + data + "\n" + err;
		}
		this.dispatchEvent(new CustomEvent("message", { detail: data }));
	}.bind(window);

};

MobileBridge.prototype.doCall = function (preparedObject, requestData) {
	if (typeof requestData === "object") {
		preparedObject.request.data = requestData || {};
	}

	if (this.device === "android") // stringify data for android devices, but not for ios
		preparedObject = JSON.stringify(preparedObject);

	this._gameeWin.postMessage(preparedObject, "*");
};

/**
 * @class FacebookBridge
 * @requires PlatformBridge
 */
export function FacebookBridge() {
	PlatformBridge.call(this);
	this.platform = "fb";
}

FacebookBridge.prototype = Object.create(PlatformBridge.prototype);
FacebookBridge.prototype.constructor = FacebookBridge;

FacebookBridge.prototype._init = function () {
};

FacebookBridge.prototype.createRequest = function (method, opt_requestData, opt_callback) {
	if (typeof opt_requestData === 'function') {
		opt_callback = opt_requestData;
		opt_requestData = undefined;
	}

	try {
		this._methods[method](opt_callback, opt_requestData);
	} catch (err) {
		throw err;
	}
};

FacebookBridge.prototype.validateMethod = function (method) {
	return true;
};

FacebookBridge.prototype._methods = {
	init: function (cb, data) {
		var scripts = "https://connect.facebook.net/en_US/fbinstant.2.1.js"; // TODO?
		loadScript(scripts, function () {
			FBInstant.initializeAsync().then(function (v) {
				FBInstant.player.getDataAsync(['gamee']).then(function (data) {
					var saveState = data.gamee || null;
					cb({
						saveState: saveState,
						replayData: null,
						sound: true
					});
				});

			}, function (e) {
				throw e;
			});
		});
	},
	gameLoadingProgress: function (cb, data) {
		FBInstant.setLoadingProgress(data.percentage);
	},
	gameReady: function () {
		FBInstant.setLoadingProgress(100);
		FBInstant.startGameAsync().then(function () {
			PlatformAPI.start({}, function () { });
		});
	},
	updateScore: function (cb, data) {
		FBInstant.setScore(data.score);
	},
	gameOver: function () {
		FBInstant.endGameAsync().then(function () {
			PlatformAPI.start({}, function () { });
		});
	},
	saveState: function (cb, data) {
		FBInstant.player.setDataAsync({
			"gamee": data.state
		}).then(function () {
			console.log('FB: data is saved');
		});
	}
};