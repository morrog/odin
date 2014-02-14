describe("The Odin.Controller", function() {

    var Controller = require("../src/controller"),
        Base = require("../src/base"),
        Router = require("../src/router"),
        Injector = require("../src/injector"),
        jsdom = require("jsdom").jsdom,
        document = jsdom("<html><head></head><body>hello world</body></html>"),
        window = document.parentWindow;

    it("Should be defined", function() {
        expect(Controller).toBeDefined();
    });

    it("Should inherit from Odin.Base", function() {
        expect(new Controller() instanceof Base).toBe(true);
    });

    describe("Resolving", function() {
        beforeEach(function() {
            window.location.hash = "";
            Injector.static("window", window);
        });

        it("Should resolve a simple route", function(done) {
            var barHandler = jasmine.createSpy("/bar"),
                FooController = Controller.extend({
                    "/bar": barHandler
                }),
                router = new Router();

            Injector.static("/bar", FooController);

            router.once("change", function() {
                expect(barHandler).toHaveBeenCalled();
                done();
            });
            
            window.location.hash = "/bar/bar";
        });

        it("Should resolve a simple route with an argument", function(done) {
            var barHandler = jasmine.createSpy("/bar"),
                FooController = Controller.extend({
                    "/bar/:id": barHandler
                }),
                router = new Router();

            Injector.static("/bar", FooController);

            router.once("change", function() {
                expect(barHandler).toHaveBeenCalledWith("1");
                done();
            });
            
            window.location.hash = "/bar/bar/1";
        });

        it("Should resolve a simple route with multiple arguments", function(done) {
            var barHandler = jasmine.createSpy("/bar"),
                FooController = Controller.extend({
                    "/bar/:id/:from/:to": barHandler
                }),
                router = new Router();

            Injector.static("/bar", FooController);

            router.once("change", function() {
                expect(barHandler).toHaveBeenCalledWith("1", "2", "3");
                done();
            });
            
            window.location.hash = "/bar/bar/1/2/3";
        });

        it("Should resolve a nested controller", function(done) {
            var fooHandler = jasmine.createSpy("/bar/foo"),
                FooController = Controller.extend({
                    "/bar": Controller.extend({
                        "/foo": fooHandler
                    })
                }),
                router = new Router();

            Injector.static("/bar", FooController);

            router.once("change", function() {
                expect(fooHandler).toHaveBeenCalled();
                done();
            });

            window.location.hash = "/bar/bar/foo";            
        });

        it("Should resolve a nested controller with arguments", function(done) {
            var fooHandler = jasmine.createSpy("/bar/foo"),
                FooController = Controller.extend({
                    "/bar": Controller.extend({
                        "/foo/:id/:take": fooHandler
                    })
                }),
                router = new Router();

            Injector.static("/bar", FooController);

            router.once("change", function() {
                expect(fooHandler).toHaveBeenCalledWith("1", "5");
                done();
            });

            window.location.hash = "/bar/bar/foo/1/5";            
        });
    });
});