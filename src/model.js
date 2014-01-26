var Base = require("./base.js"),
    lang = require("mout/lang"),
    object = require("mout/object"),

Model = Base.extend({

    id: null,
    primary: "id",
    properties: {},
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
            this.properties[key] = props[key];

            if(key === this.primary) {
                this.id = props[key];
            }
        }

        for(key in this.changed) {
            this.trigger("change:" + key, props[key], this.changed[key]);
        }

        return this.trigger("change");
    },

    get: function(key) {
        return this.properties[key];
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
        })
    }

});

module.exports = Model;