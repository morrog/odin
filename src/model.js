var Base = require("./base.js"),
    lang = require("mout/lang"),
    object = require("mout/object"),
    array = require("mout/array"),

Model = Base.extend({

    id: null,
    primary: "id",
    properties: {},
    mutators: {},
    changed: {},
    previousProperties: {},

    constructor: function(properties, options) {
        this.properties = lang.clone(this.properties);
        this.set(object.merge(this.properties, properties));

        return Model.super_.apply(this, arguments);
    },

    set: function(key, value, options) {
        var props, prop;

        if(lang.isObject(key)) {
            props = key;
            options = value;
        } else {
            (props = {})[key] = value;
        }

        options = options || {};

        this.changed = {};
        this.previousProperties = lang.clone(this.properties);

        for(key in props) {
            if(!object.hasOwn(this, key)) {
                this.defineProperty(key);
            }

            if(props[key] === this.get(key)) {
                continue;
            }

            this.changed[key] = this.properties[key];
            this.properties[key] = this.mutate(key, props[key]);

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

        keys = lang.isArray(keys) ? keys : keys.split(" ");
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
        var mutated = this.mutate(key);
        return mutated || this.properties[key];
    },

    mutate: function(key, value) {
        var mutator = this.mutators[key];

        if(!mutator) {
            return value;
        }

        if(value && mutator.set) {
            value = mutator.set.call(this, value);
        } else if(value === undefined && mutator.get) {
            value = mutator.get.call(this);
        } else {
            value = mutator.call(this, value);
        }

        return value;
    },

    keys: function() {
        return object.keys(this.properties);
    },

    values: function() {
        var values = [];

        array.forEach(this.keys(), function(key) {
            values.push(this.get(key));
        }, this);

        return values;
    },

    toObject: function() {
        var properties = {};

        array.forEach(this.keys(), function(key) {
            properties[key] = this.get(key);
        }, this);

        return properties;
    },

    defineProperty: function(key) {
        Object.defineProperty(this, key, {
            get: function() {
                return this.get(key);
            },

            set: function(value) {
                return this.set(key, value);
            },

            enumerable : true
        });
    }

});

module.exports = Model;