describe("Odin.Router", function() {

    var Router = require("../src/router"),
        Base = require("../src/base"),
        Injector = require("../src/injector"),
        forEach = require("mout/array/forEach"),
        jsdom = require("jsdom").jsdom,
        document = jsdom("<html><head></head><body>hello world</body></html>"),
        window = document.parentWindow;

    beforeEach(function() {
        window.location.hash = "";
        Injector.static("window", window);
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
            routes = ["/foo", "/bar", "/404"],
            i = 0;

        router.once("change", function() {
            router.once("change", function() {
                expect(router.history).toContain(routes[0]);
                router.once("change", function() {
                    expect(router.history).toContain(routes[1]);
                    router.once("change", function() {
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

});