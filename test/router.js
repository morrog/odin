describe("Odin.Router", function() {

    var Router = require("../src/router"),
        Base = require("../src/base"),
        Controller = require("../src/controller"),
        Injector = require("../src/injector"),
        forEach = require("mout/array/forEach"),
        jsdom = require("jsdom").jsdom,
        document = jsdom("<html><head></head><body>hello world</body></html>"),
        window = document.parentWindow;

    beforeEach(function() {
        window.location.hash = "";
        Injector.static("window", window);
        Injector.static("$", null);
    });

    it("Should be defined", function() {
        expect(Router).toBeDefined();
    });

    it("Should inherit from Odin.Base", function() {
        expect(new Router() instanceof Base).toBe(true);
    });

    it("Should have a default url", function() {
        expect(new Router().url).toBe("/");
    });

    it("Should use window.location.hash as a default url", function() {
        window.location.hash = "/foo";
        expect(new Router().url).toBe(Router.parseHash(window.location.hash));
    });

    it("Should set the url to the hash when it changes and broadcast it", function(done) {
        var router = new Router(),
            route = "/foo";

        router.once("change", function(url) {
            expect(router.url).toBe(route);
            expect(url).toBe(router.url);
            done();
        });

        window.location.hash = route;
    });

    it("Should set the segments from the hash when it changes", function(done) {
        var router = new Router(),
            segments = ["foo", "bar"];

        router.once("change", function() {
            expect(router.segments).toEqual(segments);
            done();
        });

        window.location.hash = segments.join("/");
    });

    it("Should store previous urls in a history array", function(done) {
        var router = new Router(),
            routes = ["/foo", "/bar", "/404"];

        router.once("change", function() {
            router.once("change", function() {
                router.once("change", function() {
                    router.once("change", function() {
                        expect(router.history).toContain(routes[0]);
                        expect(router.history).toContain(routes[1]);
                        expect(router.history).toContain(routes[2]);
                        done();
                    });

                    window.location.hash = "/done";
                });

                window.location.hash = routes[2];
            });

            window.location.hash = routes[1];
        });

        window.location.hash = routes[0];
    });

    it("Should go to an url", function(done) {
        var router = new Router(),
            url = "/foo";

        router.once("change", function() {
            expect(Router.parseHash(window.location.hash)).toBe(url);
            done();
        });

        router.goto(url);
    });

    it("Should go back in history", function(done) {
        var router = new Router(),
            routes = ["/foo", "/bar"];

        router.once("change", function() {
            router.once("change", function() {
                router.once("change", function() {
                    expect(Router.parseHash(window.location.hash)).toBe(routes[0]);
                    done();
                });

                router.back();
            });

            window.location.hash = routes[1];
        });

        window.location.hash = routes[0];
    });

    it("Should resolve a base controller from the route", function(done) {
        var router = new Router(),
            root = "/foo",
            route = root + "/bar/1",
            FooController = Controller.extend({ resolve: jasmine.createSpy("FooController.resolve") });

        Injector.static(root, FooController);

        router.once("change", function() {
            expect(router.baseController instanceof FooController).toBe(true);
            expect(FooController.prototype.resolve).toHaveBeenCalledWith(router.segments);
            done();
        });

        window.location.hash = route;
    });

});