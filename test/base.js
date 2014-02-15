describe("The Base class", function() {
    "use strict";

    var Base = require("../src/base"),
        Injector = require("../src/injector"),
        array = require("mout/array");

    it("Should be defined", function() {
        expect(Base).toBeDefined();
    });

    it("Should expose it self to AMD module loaders like RequireJS", function() {
        var hasDefine = Base.hasDefine,
            define = global.define;

        global.define = jasmine.createSpy("define");
        Base.hasDefine = true;

        Base.defineMe();

        expect(global.define).toHaveBeenCalledWith([], Base);
        
        global.define = define;
        Base.hasDefine = hasDefine;
    });

    it("Should call the init method upon creation", function() {
        spyOn(Base.prototype, "init");

        new Base();

        expect(Base.prototype.init).toHaveBeenCalled();
    });

    it("Should pass arguments to the init method", function() {
        var arg = "foo";

        spyOn(Base.prototype, "init");

        new Base(arg);

        expect(Base.prototype.init).toHaveBeenCalledWith(arg);
    });

    it("Should assume the last argument as options and set .options", function() {
        var options = { foo: "bar" },
            base = new Base(null, "foo", options);

        expect(base.options).toEqual(options);
    });

    it("Should map keys in the .mine array to properties on the instance from the options", function() {
        var key = "____", value = "foo", base, options = {};

        Base.prototype.mine = [key];
        options[key] = value;

        base = new Base(options);

        expect(base[key]).toBe(value);
    });

    describe("Extending", function() {
        it("Should have an extend method", function() {
            expect(Base.extend).toBeDefined();
        });

        it("Should create a derived class", function() {
            var Derived = Base.extend();

            expect(new Derived() instanceof Base).toBe(true);
            expect(Derived.extend).toBe(Base.extend);
        });

        it("Should create a derived class with the provided prototype", function() {
            var Derived = Base.extend({ foo: "bar" });

            expect(Derived.prototype.foo).toBe("bar");
        });

        it("Should create a derived class with the provided static properties", function() {
            var Derived = Base.extend({}, { foo: "bar" });

            expect(Derived.foo).toBe("bar");
        });

        it("Should create a derived class with the provided constructor", function() {
            var constructor = function() {},
                Derived = Base.extend({ constructor: constructor }),
                derived = new Derived();

            expect(derived instanceof constructor).toBe(true);
        });
    });

    describe("Events", function() {
        it("Should clear the events stack upon creation", function() {
            var base = new Base();

            expect(base._events).not.toBe(Base.prototype._events);
            expect(base._events).toEqual(jasmine.any(Object));
        });

        it("Should add simple events to the events stack", function() {
            var base = new Base(),
                eventName = "foo", handler = function() {}, context = {},
                stack;

            base.on(eventName, handler, context);

            stack = base._events[eventName];
            expect(stack).toEqual(jasmine.any(Array));
            expect(stack[0].handler).toBe(handler);
            expect(stack[0].context).toBe(context);
        });

        it("Should add a string of events to the events stack", function() {
            var base = new Base(),
                events = "foo bar", handler = function() {}, context = {};

            base.on(events, handler, context);

            array.forEach(events.split(" "), function(name) {
                var stack = base._events[name];

                expect(stack[0].handler).toBe(handler);
                expect(stack[0].context).toBe(context);
            });
        });

        it("Should add an array of events to the events stack", function() {
            var base = new Base(),
                events = ["foo", "bar"], handler = function() {}, context = {};

            base.on(events, handler, context);

            array.forEach(events, function(name) {
                var stack = base._events[name];

                expect(stack[0].handler).toBe(handler);
                expect(stack[0].context).toBe(context);
            });
        });

        it("Should add namespaced events to the events stack", function() {
            var base = new Base(),
                eventName = "foo", namespace = "bar", handler = function() {}, context = {},
                stack;

            base.on(eventName + ":" + namespace, handler, context);

            stack = base._events[eventName];
            expect(stack).toEqual(jasmine.any(Array));
            expect(stack[0].handler).toBe(handler);
            expect(stack[0].context).toBe(context);
            expect(stack[0].namespace).toBe(namespace);
        });

        it("Should remove events by name", function() {
            var base = new Base(),
                eventName = "foo";

            base.on(eventName)
                .on(eventName + ":namespace");
            base.off(eventName);

            expect(base._events[eventName].length).toBe(1);
        });

        it("Should remove events by namespace", function() {
            var base = new Base(),
                eventName = "foo", namespace = "bar",
                stack;

            base.on(eventName)
                .on(eventName + ":" + namespace);

            base.off(":" + namespace);

            stack = base._events[eventName];

            expect(stack.length).toBe(1);
            expect(stack[0].namespace).not.toBe(namespace);
        });

        it("Should remove events by handler", function() {
            var base = new Base(),
                eventName = "foo", handler = function() {},
                stack;

            base.on(eventName, handler)
                .on(eventName, function() {});

            base.off(eventName, handler);

            stack = base._events[eventName];

            expect(stack.length).toBe(1);
            expect(stack[0].handler).not.toBe(handler);
        });

        it("Should remove events by handler and context", function() {
            var base = new Base(),
                eventName = "foo", handler = function() {}, context = {},
                stack;

            base.on(eventName, handler, context)
                .on(eventName, handler)
                .on(eventName, function() {});

            base.off(eventName, handler, context);

            stack = base._events[eventName];
            expect(stack.length).toBe(2);
        });

        it("Should trigger a simple event", function() {
            var base = new Base(),
                eventName = "foo", handler = jasmine.createSpy("handler");

            base.on(eventName, handler)
                .trigger(eventName);

            expect(handler).toHaveBeenCalled();
        });

        it("Should trigger an array of events", function() {
            var base = new Base(),
                eventNames = ["foo", "bar"], handler = jasmine.createSpy("handler");

            base.on(eventNames, handler)
                .trigger(eventNames);

            expect(handler).toHaveBeenCalled();
        });

        it("Should not try to trigger invalid handlers", function() {
            var base = new Base(),
                eventName = "foo";

            base.on(eventName, false)
                .trigger(eventName);
        });

        it("Should handle multiple arguments when triggering", function() {
            var base = new Base(),
                eventName = "foo", handler = jasmine.createSpy("handler");

            base.on(eventName, handler)
                .trigger(eventName, 1)
                .trigger(eventName, 1, 2)
                .trigger(eventName, 1, 2, 3)
                .trigger(eventName, 1, 2, 3, 4)
                .trigger(eventName, 1, 2, 3, 4, 5)
                .trigger(eventName, 1, 2, 3, 4, 5, 6);

            expect(handler).toHaveBeenCalledWith(1);
            expect(handler).toHaveBeenCalledWith(1, 2);
            expect(handler).toHaveBeenCalledWith(1, 2, 3);
            expect(handler).toHaveBeenCalledWith(1, 2, 3, 4);
            expect(handler).toHaveBeenCalledWith(1, 2, 3, 4, 5);
            expect(handler).toHaveBeenCalledWith(1, 2, 3, 4, 5, 6);
        });

        it("Should trigger a namespaced event", function() {
            var base = new Base(),
                eventName = "foo", namespace = ":bar", handler = jasmine.createSpy("handler"), notCalledHandler = jasmine.createSpy("handler");

            base.on(eventName + namespace, handler)
                .on(eventName, notCalledHandler)
                .trigger(namespace);

            expect(handler).toHaveBeenCalled();
            expect(notCalledHandler).not.toHaveBeenCalled();
        });

        it("Should pass arguments to a handler", function() {
            var base = new Base(),
                eventName = "foo", arg = "bar", handler = jasmine.createSpy("handler");

            base.on(eventName, handler)
                .trigger(eventName, arg);

            expect(handler).toHaveBeenCalledWith(arg);
        });

        it("Should only trigger handlers added with .once() one time", function() {
            var base = new Base(),
                eventName = "foo", handler = jasmine.createSpy("handler");

            base.once(eventName, handler)
                .trigger(eventName)
                .trigger(eventName)
                .trigger(eventName)
                .trigger(eventName);

            expect(handler.calls.count()).toBe(1);
        });

        it("Should trigger the 'all' event", function() {
            var base = new Base(),
                handler = jasmine.createSpy("handler"),
                foo = "bar";

            base.on("all", handler)
                .trigger("some-event")
                .trigger("this-event", foo)
                .trigger("namespaced:event");

            expect(handler.calls.count()).toBe(3);
            expect(handler).toHaveBeenCalledWith(foo);
        });

        it("Should not trigger events that don't match", function() {
            var base = new Base(),
                handler = jasmine.createSpy("handler");

            base.on("foo", handler)
                .trigger("bar");

            expect(handler).not.toHaveBeenCalled();
        });
    });

    describe("Injecting", function() {
        it("Should inject dependencies", function() {
            var Derived = Base.extend({
                    inject: { foo: "foo" }
                }),
                foo = function() {};

            Injector.set("foo", foo);

            expect(new Derived().foo instanceof foo).toBe(true);
        });
    });
});











