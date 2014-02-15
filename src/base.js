var Injector = require("./injector"),
    slice = require("mout/array/slice"),
    filter = require("mout/array/filter"),
    flatten = require("mout/array/flatten"),
    remove = require("mout/array/remove"),
    isObject = require("mout/lang/isObject"),
    isArray = require("mout/lang/isArray"),
    inheritPrototype = require("mout/lang/inheritPrototype"),
    fillIn = require("mout/object/fillIn"),
    forOwn = require("mout/object/forOwn"),
    pick = require("mout/object/pick"),
    hasOwn = require("mout/object/hasOwn"),
    merge = require("mout/object/merge"),
    values = require("mout/object/values"),
    _uid = 1,


Base = function() {
    "use strict";

    var options = slice(arguments, -1);

    this.options = {};
    if(isObject(options[0])) {
        this.setOptions(options[0]);
    }

    this._resolveDependencies(options.inject);

    this._events = {};
    return this.init.apply(this, arguments);
};

Base.prototype = {
    constructor: Base,

    _events: {},
    mine: [],
    defaults: {},
    options: {},
    inject: {},

    init: function() {
        return this;
    },

    setOptions: function(options) {
        this.options = merge(this.options, this.defaults, options);
        fillIn(this, pick(this.options, this.mine));

        return this;
    },

    on: function(names, handler, context) {
        var i, len, stack, ev;

        names = isArray(names) ? names : names.split(" ");

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

            remove(s, e);

            if(!s.length) {
                delete this._events[e.name];
            }
        }, handler, context);
    },

    trigger: function(names) {
        var args = slice(arguments, 1);

        names = isArray(names) ? names : names.split(" ");
        names.push("all");

        return this._eachEvent(names, function(e) {
            this._triggerEvent(e, args);
        });
    },

    _triggerEvent: function(ev, args) {
        var context = ev.context || this;

        if(typeof ev.handler !== "function") {
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
        var i, j, len, ev, stack, events;

        names = isArray(names) ? names : names.split(" ");
        
        for(i = 0, len = names.length; i < len; i++) {
            ev = this._createEvent(names[i], handler, context);
            stack = this._getStack(ev.name);

            if(!stack.length) {
                continue;
            }

            events = filter(stack, ev);

            if(!events || !events.length) {
                continue;
            }

            for(j = 0; j < events.length; j++) {
                if(events[j].namespace && events[j].namespace !== ev.namespace) {
                    continue;
                }

                callback.call(this, events[j]);
            }
        }

        return this;
    },

    _getStack: function(name) {
        if(!name) {
            return flatten(values(this._events));
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
    },

    _resolveDependencies: function(dependencies) {
        dependencies = merge(this.inject, dependencies);
        
        forOwn(dependencies, function(dependency, key) {
            this[key] = Injector.get(dependency, this);
        }, this);
    },
};

Base.extend = function(proto, static) {
    var parent = this, derived;

    proto = proto || {};

    derived = hasOwn(proto, "constructor") ?
                    proto.constructor :
                    function() { parent.apply(this, arguments); };
    
    derived = merge(derived, parent, static || {});
    
    inheritPrototype(derived, parent);

    derived.prototype = merge(derived.prototype, proto);
    
    derived.prototype.constructor = derived;
    
    return derived;
};

Base.hasDefine = typeof define === "function" && define.amd;
Base.defineMe = function() {
    if(this.hasDefine) {
        define([], this);
    }

    return this;
};

Base.uid = function(prefix) {
    return (prefix || "") + (_uid++);
};

module.exports = Base.defineMe();