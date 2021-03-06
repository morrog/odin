    var Base = require("./base"),
    Injector = require("./injector"),
    mixIn = require("mout/object/mixIn"),
    size = require("mout/object/size"),
    isObject = require("mout/lang/isObject"),
    isArray = require("mout/lang/isArray"),
    stores = {},

wrapHandler = function(context, event, data, handler, silent) {
    return function() {
        if(!silent) {
            context.trigger(event, data);
        }

        if(handler) {
            handler.apply(handler, arguments);
        }
    };
},

Storage = module.exports = Base.extend({

    constructor: function() {
        return Storage.super_.call(this);
    },

    add: function(data, options) {
        options = options || {};

        if(options.reset) {
            this.reset(options.store, { silent: true });
        }

        options.done = wrapHandler(this, "add:" + options.store, data, options.done, options.silent);

        if(options.key) {
            this.setObject(options.store, options.key, data, options);
        } else {
            this.setHash(options.store, data, options);
        }

        return this;
    },

    update: function(data, options) {
        var storeName = options.store;

        if(options.key) {
            storeName += "." + options.key;
        }

        options.done = wrapHandler(this, "update:" + storeName, data, options.done, options.silent);

        if(options.key) {
            this.updateObject(options.store, options.key, data, options);
        } else {
            this.updateHash(options.store, data, options);
        }

        return this;
    },

    get: function(name, key, done) {
        var self = this;

        if(typeof done === "undefined") {
            done = key;
            key = null;
        }

        if(key) {
            self.getObject(name, key, done);
        } else {
            self.getHash(name, done);
        }

        return this;
    },

    remove: function(name, key, options) {
        var storeName = name;

        if(isObject(key) || typeof key === "undefined") {
            options = key;
            key = null;
        }

        options = options || {};
        if(key) {
            storeName += "." + key;
        }

        options.done = wrapHandler(this, "remove:" + storeName, null, options.done, options.silent);

        if(key) {
            this.removeObject(name, key, options);
        } else {
            this.removeHash(name, options);
        }

        return this;
    },

    reset: function(name, options) {
        options = options || {};
        options.done = wrapHandler(this, "reset:" + name, null, options.done, options.silent);

        this.removeHash(name, options);

        return this;
    },

    count: function(name, done) {
        return this.getStore(name, function(store) {
            done(size(store));
        });
    },

    setObject: function(name, key, data, options) {
        this.getStore(name, function(store) {
            store[key] = data;

            if(options.done) {
                options.done();
            }
        });
    },

    setHash: function(name, data, options) {
        if(!isArray(data)) {
            data = mixIn({}, data);
        }

        this.getStore(name, function(store) {
            mixIn(store, data);

            if(options.done) {
                options.done();
            }
        });
    },

    updateObject: function(name, key, data, options) {
        this.setObject(name, key, data, options);
    },

    updateHash: function(name, data, options) {
        this.setHash(name, data, options);
    },

    removeObject: function(name, key, options) {
        this.getStore(name, function(store) {
            if(store[key]) {
                delete store[key];

                if(options.done) {
                    options.done();
                }
            }
        });
    },

    removeHash: function(name, options) {
        if(stores[name]) {
            delete stores[name];

            if(options.done) {
                options.done();
            }
        }
    },

    getObject: function(name, key, done) {
        this.getStore(name, function(store) {
            done(store[key]);
        });
    },

    getHash: function(name, done) {
        this.getStore(name, function(store) {
            done(store);
        });
    },

    getStore: function(name, done) {
        done(stores[name] || (stores[name] = {}));
    }

});

Injector.set("storage", Storage.defineMe());