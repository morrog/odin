var Base = require("./base"),
    Injector = require("./injector"),
    functions = require("mout/object/functions"),
    filter = require("mout/collection/filter"),

Controller = module.exports = Base.extend({

    router: null,
    baseController: null,

    constructor: function(router, baseController) {
        this.router = router;
        this.baseController = baseController || null;
        // Bind events
        return Base.call(this);
    },

    resolve: function(segments) {
        var routes = this._getRoutes(segments.slice()),
            i = 0, len = routes.length;
        
        this.segments = segments.slice();
        this.segments.shift();


        for(; i < len; i++) {
            this._callRoute(routes[i]);
        }
    },

    _getRoutes: function(segments) {
        // Remove the first segment (that's the controller segment)
        segments.shift();

        return filter(functions(this), function(route) {
            var match = route.indexOf("/") === 0,
                segs = segments.slice(),
                url = "";

            if(!match) {
                return false;
            }

            while(segs.length) {
                url += "/" + segs.shift();

                if(route.indexOf(url) === 0 && this[route].prototype instanceof Controller) {
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
        var args = this._getArgsFor(route),
            controller, segments;

        if(!(this[route].prototype instanceof Controller)) {
            return this._triggerEvent({
                handler: this[route],
                context: this
            }, args);
        }
        
        controller = new this[route](this.router, this);

        // Remove the sub controller segment
        segments = this.router.segments.slice();
        segments.shift();
        controller.resolve(segments);
    },

    _getArgsFor: function(route) {
        var segments = route.split("/"),
            args = [],
            i = 0, len;

        segments.shift();

        for(len = segments.length; i < len; i++) {
            if(segments[i].indexOf(":") === 0) {
                args.push(this.segments[i]);
            }
        }

        return args;
    }

});

Injector.set("controller", Controller.defineMe());