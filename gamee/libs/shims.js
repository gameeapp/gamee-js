/**
 * @class CustomEvent
 */
(function shimCustomEvent() {
	try {
		var ce = new window.CustomEvent('test');
		ce.preventDefault();
		if (ce.defaultPrevented !== true) {
			// IE has problems with .preventDefault() on custom events
			// http://stackoverflow.com/questions/23349191
			throw new Error('Could not prevent default');
		}
	} catch (e) {
		var CustomEvent = function (event, params) {
			var evt, origPrevent;
			params = params || {
				bubbles: false,
				cancelable: false,
				detail: undefined
			};

			evt = document.createEvent("CustomEvent");
			evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
			origPrevent = evt.preventDefault;
			evt.preventDefault = function () {
				origPrevent.call(this);
				try {
					Object.defineProperty(this, 'defaultPrevented', {
						get: function () {
							return true;
						}
					});
				} catch (e) {
					this.defaultPrevented = true;
				}
			};
			return evt;
		};

		CustomEvent.prototype = window.Event.prototype;
		window.CustomEvent = CustomEvent; // expose definition to window
	}
})();

//addEventListener polyfill 1.0 / Eirik Backer / MIT Licence
(function (win, doc) {
	if (win.addEventListener) return;		//No need to polyfill

	function docHijack(p) { var old = doc[p]; doc[p] = function (v) { return addListen(old(v)); }; }
	function addEvent(on, fn, self) {
		return (self = this).attachEvent('on' + on, function (e) {
			e = e || win.event;
			e.preventDefault = e.preventDefault || function () { e.returnValue = false; };
			e.stopPropagation = e.stopPropagation || function () { e.cancelBubble = true; };
			fn.call(self, e);
		});
	}
	function addListen(obj, i) {
		i = obj.length;
		if (i) {
			while (i--)
				obj[i].addEventListener = addEvent;
		} else {
			obj.addEventListener = addEvent;
		}
		return obj;
	}

	addListen([doc, win]);
	if ('Element' in win) win.Element.prototype.addEventListener = addEvent;			//IE8
	else {		//IE < 8
		doc.attachEvent('onreadystatechange', function () { addListen(doc.all); });		//Make sure we also init at domReady
		docHijack('getElementsByTagName');
		docHijack('getElementById');
		docHijack('createElement');
		addListen(doc.all);
	}
})(window, document);

// naomik event emiter http://stackoverflow.com/a/24216547/1866147
// usage:
// function Example() {
// 	CustomEmitter.call(this);
// }

// // run it
// var e = new Example();

// e.addEventListener("something", function (event) {
// 	console.log(event)
// });

// e.dispatchEvent(new Event("something"));
export function CustomEmitter() {
	var eventTarget = document.createDocumentFragment();

	function delegate(method) {
		this[method] = eventTarget[method].bind(eventTarget);
	}

	[
		"addEventListener",
		"dispatchEvent",
		"removeEventListener"
	].forEach(delegate, this);
}

/** ### wrapKeyEvent 
 * 
 * Handle old IE event differences for key events
 * 
 * @param {Function} fn callback
 */
export function wrapKeyEvent(fn) {
	return function (ev) {
		if (!ev || !ev.keyCode) {
			if (!ev) {
				ev = window.event;
			}

			if (ev.which) {
				ev.keyCode = ev.which;
			}
		}

		return fn(ev);
	};
}