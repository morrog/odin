var Base = require("./base"),
    Injector = require("./injector"),

    clone = require("mout/lang/clone"),
    isObject = require("mout/lang/isObject"),
    isArray = require("mout/lang/isArray"),

    merge = require("mout/object/merge"),
    keys = require("mout/object/keys"),
    pick = require("mout/object/pick"),
    hasOwn = require("mout/object/hasOwn"),

    forEach = require("mout/array/forEach"),

Model = Base.extend({

    id: null,
    primary: "id",
    properties: {},
    mutators: {},
    changed: {},
    previousProperties: {},
    rules: {},
    validator: {},
    inject: { validator: "validator" },

    constructor: function(properties) {
        this.properties = clone(this.properties);

        // Setting values might require dependencies (see .validator)
        // so it's best to resolve these before calling .set()
        this._resolveDependencies();

        this.set(merge(this.properties, properties));
        
        // Define mutator properties after defining actual properties
        // to prevent mutators overwriting properties
        this.defineMutators();

        return Model.super_.apply(this, arguments);
    },

    set: function(key, value, options) {
        var props;

        if(isObject(key)) {
            props = key;
            options = value;
        } else {
            (props = {})[key] = value;
        }

        options = options || {};

        this.changed = {};
        this.previousProperties = clone(this.properties);

        for(key in props) {
            this.defineProperty(key);
            
            if(props[key] === this.get(key) || !this.validator.run(this.rules, key, props[key], options)) {
                continue;
            }

            this.changed[key] = this.properties[key];
            this.properties[key] = this.mutate("set", key, props[key]);

            if(key === this.primary) {
                this.id = this.properties[key];
            }
        }

        if(!options.silent) {
            for(key in this.changed) {
                this.trigger("change:" + key, props[key], this.changed[key]);
            }

            this.trigger("change");
        }

        return this;
    },

    unset: function(keys, options) {
        var value, i, len;

        keys = isArray(keys) ? keys : keys.split(" ");
        options = options || {};

        for(i = 0, len = keys.length; i < len; i++) {
            value = this.get(keys[i]);
            delete this.properties[keys[i]];
            delete this[keys[i]];
            
            if(!options.silent) {
                this.trigger("unset:" + keys[i], value);
            }
        }

        if(!options.silent) {
            this.trigger("change");
        }

        return this;
    },

    get: function(key) {
        if(this.hasMutator(key)) {
            return this.mutate("get", key);
        }

        return this.properties[key];
    },

    mutate: function(method, key, value) {
        var mutator = this.mutators[key];

        if(!mutator) {
            return value;
        }

        if(method === "set" && mutator.set) {
            value = mutator.set.call(this, value);
        } else if(method === "get" && mutator.get) {
            value = mutator.get.call(this);
        } else if(typeof mutator === "function") {
            value = mutator.call(this, value);
        }

        return value;
    },

    hasMutator: function(key) {
        return this.mutators[key] && this.isMutator(this.mutators[key]);
    },

    isMutator: function(mutator) {
        return mutator.get || mutator.set || typeof mutator === "function";
    },

    keys: function() {
        return keys(merge(this.properties, this.mutators));
    },

    values: function() {
        var values = [];

        forEach(this.keys(), function(key) {
            values.push(this.get(key));
        }, this);

        return values;
    },

    toObject: function() {
        return pick(this, this.keys());
    },

    toJSON: function() {
        return JSON.stringify(this.toObject());
    },

    clone: function() {
        return new this.constructor(this.toObject());
    },

    defineProperty: function(key) {
        if(hasOwn(this, key)) {
            return;
        }

        Object.defineProperty(this, key, {
            get: function() {
                return this.get(key);
            },

            set: function(value) {
                return this.set(key, value);
            },

            enumerable : true
        });

        if(this.hasMutator(key) && this.mutators[key].rules) {
            // Set rules
        }
    },

    defineMutators: function() {
        var key;

        for(key in this.mutators) {
            if(this.isMutator(this.mutators[key])) {
                this.defineProperty(key);
            }
        }
    }

});

Injector.static("Model", Model);

module.exports = Model.defineMe();