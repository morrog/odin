var Base = require("./base"),
    Injector = require("./injector"),
    isNumber = require("mout/lang/isNumber"),
    isObject = require("mout/lang/isObject"),
    trim = require("mout/string/trim");

module.exports = Base.extend({

    rules: {
        required: function(value) {
            return !!trim(value);
        },

        number: function(value) {
            return isNumber(value) || /^[0-9]+\.*[0-9]*$/.test(value);
        },

        minLength: function(value, len) {
            return ("" + value).length >= len;
        },

        maxLength: function(value, len) {
            return ("" + value).length <= len;
        },

        exactLength: function(value, len) {
            return ("" + value).length == len;
        },

        range: function(value, range) {
            var len = ("" + value).length;
            return len >= range[0] && len <= range[1];
        },

        int: function(value) {
            return /^[0-9]+$/.test(value);
        },

        float: function(value) {
            return /^[0-9]+\.[0-9]+$/.test(value);
        },

        equals: function(value, prop, properties) {
            return value == properties[prop];
        },

        is: function(value, prop, properties) {
            return value === properties[prop];
        },

        regexp: function(value, regexp) {
            return regexp.test(value);
        },

        email: function(value) {
            return /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(value);
        },

        url: function(value) {
            return /^(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})$/.test(value);
        }
    },

    run: function(rules, key, value, options) {
        var valid = true, result, failed = {}, props;

        if(isObject(key)) {
            props = key;
            options = value;
        } else {
            (props = {})[key] = value;
        }

        options = options || {};

        for(key in rules) {
            result = this.runRules(key, rules[key], props[key], props, options);
            if(result.length) {
                valid = false;
                failed[key] = result;
            }
        }

        if(!valid && !options.silent) {
            this.trigger("invalid", failed);
        }

        return valid;
    },

    runRules: function(key, rules, value, props, options) {
        var rule, failed = [];

        options = options || {};

        for(rule in rules) {
            if(!this.rules[rule]) {
                continue;
            }

            if(!this.rules[rule](value, rules[rule], props)) {
                failed.push(rule);
            }
        }

        if(failed.length && !options.silent) {
            this.trigger("invalid:" + key, failed);
        }

        return failed;
    }

});

Injector.set("validator", module.exports.defineMe());