describe("The Odin.Controller", function() {

    var Controller = require("../src/controller"),
        Base = require("../src/base"),
        Router = require("../src/router"),
        Injector = require("../src/injector"),
        jsdom = require("jsdom").jsdom,
        document = jsdom("<html><head></head><body>hello world</body></html>"),
        window = document.parentWindow,
        jQuery = require("jquery");

    it("Should be defined", function() {
        expect(Controller).toBeDefined();
    });

    it("Should inherit from Odin.Base", function() {
        Injector.static("window", window);
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

        it("Should call index if an action is not provided in the url", function(done) {
            var indexHandler = jasmine.createSpy("/index"),
                FooController = Controller.extend({
                    "/index": indexHandler
                }),
                router = new Router();

            Injector.static("/foo", FooController);

            router.once("change", function(){
                expect(indexHandler).toHaveBeenCalled();
                done();
            });

            window.location.hash = "/foo";
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

        it("Should ignore a controller if false is returned from the .init() method", function(done) {
            var barHandler = jasmine.createSpy("/bar"),
                FooController = Controller.extend({
                    init: function() {
                        return false;
                    },
                    "/bar": barHandler
                }),
                router = new Router();

            Injector.static("/bar", FooController);

            router.once("change", function() {
                expect(barHandler).not.toHaveBeenCalled();
                done();
            });
            
            window.location.hash = "/bar/bar";
        });

        it("Should redirect if an url is returned from the .init() method", function(done) {
            var barHandler = jasmine.createSpy("/bar"),
                redirectTo = "/foo",
                FooController = Controller.extend({
                    init: function() {
                        return redirectTo;
                    },
                    "/bar": barHandler
                }),
                router = new Router();

            Injector.static("/bar-redirect", FooController);

            router.once("change", function() {
                router.once("change", function() {
                    expect(Router.parseHash(window.location.hash)).toBe(redirectTo);
                    done();
                });

                expect(barHandler).not.toHaveBeenCalled();
            });
            
            window.location.hash = "/bar-redirect/bar";
        });

        it("Should not match deeper than the segments", function(done) {
            var barHandler = jasmine.createSpy("/bar"),
                FooController = Controller.extend({
                    "/bar/foobar": barHandler
                }),
                router = new Router();

            Injector.static("/bar", FooController);

            router.once("change", function() {
                expect(barHandler).not.toHaveBeenCalled();
                done();
            });
            
            window.location.hash = "/bar/bar";
        });
    });

    xdescribe("Rendering", function(){
        var $ = null,
            win = null;

        beforeEach(function() {
            var doc = jsdom("<html><head></head><body><div odin-controller='/foo'>hello world</div></body></html>");
            win = doc.parentWindow;
            win.location.hash = "";

            $ = jQuery(win);

            Injector.static("$", $);
            Injector.static("window", win);
        });

        it("Should set the el property", function(done) {
            var el = null,
                FooController = Controller.extend({
                    "/index": function() {
                        el = this.el;
                    }
                }),
                router = new Router();

            Injector.static("/foo", FooController);

            router.once("change", function() {
                expect(el[0]).toEqual($("[odin-controller='/foo']")[0]);
                done();
            });

            win.location.href = "/foo";
        });
    });
});