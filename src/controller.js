var Base = require("./base"),
    Injector = require("./injector"),
    functions = require("mout/object/functions"),
    filter = require("mout/collection/filter"),

Controller = module.exports = Base.extend({

    router: null,
    baseController: null,
    ignore: false,

    constructor: function(router, baseController) {
        var initResult;

        this.router = router;
        this.baseController = baseController || null;

        initResult =  Base.call(this);

        if(!initResult) {
            this.ignore = true;
        } else if(typeof initResult === "string" && initResult.indexOf("/") === 0) {
            this.ignore = true;
            this.router.goto(initResult);
        }

        if(!this.ignore) {
            return;
        }

        // Bind events here

        return this;
    },

    resolve: function(segments) {
        var routes,
            i = 0, len;
        
        if(this.ignore) {
            return;
        }

        this.segments = segments;

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
        return filter(functions(this), function(route) {
            var match = route.indexOf("/") === 0,
                segments = this.segments.slice(),
                url = "";

            // Remove the first segment (the controller)
            segments.shift();

            if(!match) {
                return false;
            }
            
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

    _callRoute: function(route) {
        var args = this._getArgs(route),
            controller, segments;

        if(!(this[route].prototype instanceof Controller)) {
            return this._triggerEvent({
                handler: this[route],
                context: this
            }, args);
        }
        
        controller = new this[route](this.router, this);

        // Remove the sub controller segment
        segments = this.segments.slice();
        segments.shift();
        
        controller.resolve(segments);
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
    }

});

Injector.set("controller", Controller.defineMe());