
var BulletClass = function () {
    var _self = this,
        _events = {};

    _self.on = function (event, fn, once) {
        if (arguments.length < 2 ||
            typeof event !== "string" ||
            typeof fn !== "function") return;

        var fnString = fn.toString();

        // if the named event object already exists in the dictionary...
        if (typeof _events[event] !== "undefined") {
            // add a callback object to the named event object if one doesn't already exist.
            if (typeof _events[event].callbacks[fnString] === "undefined") {
                _events[event].callbacks[fnString] = {
                    cb: fn,
                    once: !!once
                };
            }
            else if (typeof once === "boolean") {
                // the function already exists, so update it's 'once' value.
                _events[event].callbacks[fnString].once = once;
            }
        }
        else {
            // create a new event object in the dictionary with the specified name and callback.
            _events[event] = {
                callbacks: {}
            };

            _events[event].callbacks[fnString] = { cb: fn, once: !!once };
        }
    };

    _self.once = function (event, fn) {
        _self.on(event, fn, true);
    };

    _self.off = function (event, fn) {
        if (typeof event !== "string" ||
            typeof _events[event] === "undefined") return;

        // remove just the function, if passed as a parameter and in the dictionary.
        if (typeof fn === "function") {
            var fnString = fn.toString(),
                fnToRemove = _events[event].callbacks[fnString];

            if (typeof fnToRemove !== "undefined") {
                // delete the callback object from the dictionary.
                delete _events[event].callbacks[fnString];
            }
        }
        else {
            // delete all functions in the dictionary that are
            // registered to this event by deleting the named event object.
            delete _events[event];
        }
    };

    _self.trigger = function (event, data) {
        if (typeof event !== "string" ||
            typeof _events[event] === "undefined") return;

        for (var fnString in _events[event].callbacks) {
            var callbackObject = _events[event].callbacks[fnString];

            if (typeof callbackObject.cb === "function") callbackObject.cb(data);
            if (typeof callbackObject.once === "boolean" && callbackObject.once === true) _self.off(event, callbackObject.cb);
        }
    };

};


export var Bullet = new BulletClass();