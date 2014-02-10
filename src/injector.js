"use strict";

var ctorApply = require("mout/lang/ctorApply"),
    clone = require("mout/lang/clone");

module.exports = {

    dependencies: {},
    root: "./",

    set: function(name, dependency, args, singleton) {
        var dep;

        if(singleton) {
            dep = dependency;
            dependency = this.createSingleton(this.factory(dependency), args);
        }

        this.dependencies[name] = { factory: dependency, args: (args || []), singleton: singleton };
        return this;
    },

    single: function(name, dependency, args) {
        return this.set(name, dependency, args, true);
    },

    static: function(name, dependency) {
        this.dependencies[name] = { factory: this.factory(dependency), args: [], singleton: true };
        return this;
    },

    require: function(name, path, args, singleton) {
        this.dependencies[name] = { path: path, args: (args || []), singleton: singleton };
        return this;
    },

    requireSingle: function(name, path, args) {
        var dependency = this.createSingleton(this.requireFactory(path), args);
        this.dependencies[name] = { factory: dependency, args: (args || []), singleton: true };
        return this;
    },

    createSingleton: function(factory, args) {
        var instance = null;

        args = args || [];
        
        return function() {
            if(instance === null) {
                instance = module.exports.create(factory(), args);
            }

            return instance;
        };
    },

    factory: function(dependency) {
        return function() {
            return dependency;
        };
    },

    requireFactory: function(path) {
        path = path.indexOf("!") === 0 ? path.replace("!", "") : this.root + path;
        
        return function() {
            return require(path);
        };
    },

    get: function(name, target) {
        var dependency = this.dependencies[name];
        if(!dependency) {
            return null;
        }
        
        if(dependency.path && !dependency.factory) {
            dependency.factory = this.requireFactory(dependency.path)();
        }

        return dependency.singleton ? dependency.factory() : this.create(dependency.factory, dependency.args, target);
    },

    create: function(factory, args, target) {
        if(target) {
            args = clone(args);
            args.push(target);
        }

        return ctorApply(factory, args);
    }

};

if(typeof define === "function" && define.amd) {
    define([], module.exports);
}