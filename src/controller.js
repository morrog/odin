var Base = require("./base"),
    Injector = require("./injector"),
    functions = require("mout/object/functions"),
    filter = require("mout/collection/filter"),
    forEach = require("mout/array/forEach"),
    isArray = require("mout/lang/isArray"),

Controller = module.exports = Base.extend({

    router: null,
    parent: null,
    ignore: false,
    el: null,

    inject: {
        $: "$"
    },

    constructor: function(router, segments, parent) {
        var initResult;

        this.router = router;
        this.segments = segments || [];
        this.parent = parent || null;

        this._resolveDependencies();

        if(!this.router) {
            this.ignore = true;
            return;
        }

        this._setEl("/" + this.segments[0]);
        forEach(this._getAllRoutes(), this._setEl, this);

        initResult = Base.call(this, router, parent);
        if(initResult === false) {
            this.ignore = true;
        } else if(typeof initResult === "string" && initResult.indexOf("/") === 0) {
            this.router.goto(initResult);
            return;
        }

        if(this.ignore) {
            return;
        }

        // Bind events here
        this.resolve(segments);
    },

    resolve: function(segments) {
        var routes,
            i = 0, len;
        
        if(this.ignore) {
            return;
        }

        this.segments = segments || [];

        /// If the only segment is the controller segment, then we need to call index
        if(this.segments.length === 1) {
            routes = this["/index"] ? ["/index"] : [];
        } else {
            routes = this._getRoutes();
        }

        for(len = routes.length; i < len; i++) {
            this._callRoute(routes[i]);
        }
    },

    _getRoutes: function() {
        return filter(this._getAllRoutes(), function(route) {
            var match = true,
                segments = this.segments.slice(),
                url = "";

            // Remove the first segment (the controller)
            segments.shift();

            while(segments.length) {
                url += "/" + segments.shift();

                if(route === url && this[route].prototype instanceof Controller) {
                    return true;
                } else if(route.indexOf(url) !== 0 && route.indexOf(":") === -1) {
                    match = false;
                    break;
                }
            }
            
            if(match && url.split("/").length !== route.split("/").length) {
                match = false;
            }

            return match;
        }, this);
    },

    _getAllRoutes: function() {
        return filter(functions(this), function(route) {
            return route.indexOf("/") === 0;
        });
    },

    _callRoute: function(route) {
        var controller, segments;

        if(!(this[route].prototype instanceof Controller)) {
            return this._callHandler(this[route], this._getArgs(route));
        }
        
        // Remove the sub controller segment
        segments = this.segments.slice();
        segments.shift();

        controller = new this[route](this.router, segments, this);
    },

    _callHandler: function(handler, args, context) {
        context = context || this;

        if(!isArray(args) || !args.length) {
            return handler.call(context);
        }

        switch(args.length) {
            case 1:
                return handler.call(context, args[0]);

            case 2:
                return handler.call(context, args[0], args[1]);

            case 3:
                return handler.call(context, args[0], args[1], args[2]);

            case 4:
                return handler.call(context, args[0], args[1], args[2], args[3]);
        }

        return handler.apply(context, args);
    },

    _getArgs: function(route) {
        var segments = route.split("/"),
            args = [],
            i = 0, len;

        segments.shift();

        for(len = segments.length; i < len; i++) {
            if(segments[i].indexOf(":") === 0) {
                args.push(this.segments[i + 1]);
            }
        }

        return args;
    },

    _setEl: function(name) {
        var el, context;
        
        if(!this.$) {
            return;
        }
        
        if(this.el && this.el.is("[odin-controller]")) {
            this.init.el = this.el;
            this[name].el = this.el.find("[odin-route='" + name + "']");
        } else {
            context = this.parent && this.parent.el ? this.parent.el : undefined;
            el = this.$("[odin-controller='" + name + "']", context);
        }

        if(el && el.length) {
            this.el = el;
            return el;
        }

        return null;
    }

});

Injector.set("controller", Controller.defineMe());