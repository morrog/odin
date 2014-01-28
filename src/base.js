var object = require("mout/object"),
    lang = require("mout/lang"),
    array = require("mout/array"),

Base = function() {
    "use strict";

    var options = array.slice(arguments, -1);

    if(lang.isObject(options[0])) {
        this.setOptions(options[0]);
    }

    this._events = {};
    return this.init.apply(this, arguments);
};

Base.prototype = {
    constructor: Base,

    _events: {},
    mine: [],
    defaults: {},
    options: {},

    init: function() {
        return this;
    },

    setOptions: function(options) {
        object.deepMixIn(this.options, this.defaults, options);
        object.deepMixIn(this, object.pick(this.options, this.mine));

        return this;
    },

    on: function(names, handler, context) {
        var i, len, stack, ev;

        names = lang.isArray(names) ? names : names.split(" ");

        for(i = 0, len = names.length; i < len; i++) {
            ev = this._createEvent(names[i], handler, context);
            stack = this._getStack(ev.name);

            stack.push(ev);
        }

        return this;
    },

    once: function(names, handler, context) {
        var self = this, _handler = handler;

        handler = function() { self.off(names, handler, context); _handler.apply(context, arguments); };

        return this.on(names, handler, context);
    },

    off: function(names, handler, context) {
        return this._eachEvent(names, function(e) {
            var s = this._getStack(e.name);

            array.remove(s, e);

            if(!s.length) {
                delete this._events[e.name];
            }
        }, handler, context);
    },

    trigger: function(names) {
        var args = array.slice(arguments, 1);

        return this._eachEvent(names, function(e) {
            this._triggerEvent(e, args);
        });
    },

    _triggerEvent: function(ev, args) {
        var context = ev.context || this;

        if(!ev.handler) {
            return;
        }

        switch(args.length) {
            case 0:
                ev.handler.call(context);
                break;

            case 1:
                ev.handler.call(context, args[0]);
                break;

            case 2:
                ev.handler.call(context, args[0], args[1]);
                break;

            case 3:
                ev.handler.call(context, args[0], args[1], args[2]);
                break;

            case 4:
                ev.handler.call(context, args[0], args[1], args[2], args[3]);
                break;

            default:
                ev.handler.apply(context, args);
        }
    },

    _eachEvent: function(names, callback, handler, context) {
        var i, len, ev, stack, events;

        names = lang.isArray(names) ? names : names.split(" ");
        
        for(i = 0, len = names.length; i < len; i++) {
            ev = this._createEvent(names[i], handler, context);
            stack = this._getStack(ev.name);

            if(!stack.length) {
                continue;
            }

            events = array.filter(stack, ev);

            if(!events || !events.length) {
                continue;
            }

            array.forEach(events, this._createCaller(ev, callback, this));
        }

        return this;
    },

    _createCaller: function(ev, callback, context) {
        return function (e) {
            if(e.namespace && e.namespace !== ev.namespace) {
                return;
            }

            callback.call(context, e);
        };
    },

    _getStack: function(name) {
        if(!name) {
            return array.flatten(object.values(this._events));
        }

        return this._events[name] || (this._events[name] = []);
    },

    _createEvent: function(name, handler, context) {
        var namespace, ev = { context: context };

        name = name.split(":");
        namespace = name[1];
        name = name[0];

        if(name) {
            ev.name = name;
        }

        if(namespace) {
             ev.namespace = namespace;
        }
        
        if(handler) {
             ev.handler = handler;
        }

        return ev;
    }
};

Base.extend = function(proto, static) {
    var parent = this, derived;

    proto = proto || {};

    derived = object.hasOwn(proto, "constructor") ?
                    proto.constructor :
                    function() { parent.apply(this, arguments); };
    
    object.mixIn(derived, parent, static || {});
    
    lang.inheritPrototype(derived, parent);

    object.mixIn(derived.prototype, proto);
    
    derived.prototype.constructor = derived;
    
    return derived;
};

module.exports = Base;