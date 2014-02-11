describe("Odin.Storage", function() {

    var Storage = require("../src/storage"),
        Base = require("../src/base"),
        size = require("mout/object/size"),
        contains = require("mout/collection/contains"),
        isObject = require("mout/lang/isObject");

    it("Should be defined", function() {
        expect(Storage).toBeDefined();
    });

    it("Should inherit from Odin.Base", function() {
        expect(new Storage() instanceof Base).toBe(true);
    });

    describe("Storing", function() {
        it("Shoud store single objects", function() {
            var storage = new Storage(),
                storeName = "my-store",
                data = { id: Storage.uid(), foo: "bar" };

            storage.add(data, { store: storeName, key: data.id });
        });

        it("Should store a hash of objects", function() {
            var storage = new Storage(),
                storeName = "my-store",
                id1 = Storage.uid(),
                id2 = Storage.uid(),
                data = { id1: { id: id1, foo: "bar"}, id2: { id: id2, foo: "fobar" } };

            storage.add(data, { store: storeName, reset: true });
        });

        it("Should broadcast events when storing data", function(done) {
            var storage = new Storage(),
                storeName = "my-store",
                data = { id: Storage.uid(), foo: "bar" },
                handler = jasmine.createSpy("handler");

            storage.on("add:" + storeName, handler)
                .add(data, { store: storeName, key: data.id, done: function() {
                    expect(handler).toHaveBeenCalledWith(data);
                    done();
                }});
        });

        it("Should not broadcast events when storing data silently", function(done) {
            var storage = new Storage(),
                storeName = "my-store",
                data = { id: Storage.uid(), foo: "bar" },
                handler = jasmine.createSpy("handler");

            storage.on("add:" + storeName, handler)
                .add(data, { store: storeName, key: data.id, silent: true, done: function() {
                    expect(handler).not.toHaveBeenCalled();
                    done();
                }});
        });

        it("Should convert an array of objects to a hash of objects", function(done) {
            var storage = new Storage(),
                storeName = "my-store",
                data = [ { id: Storage.uid(), foo: "bar" }, { id: Storage.uid(), foo: "foobar" }];

            storage.add(data, { store: storeName, reset: true });

            storage.get(storeName, function(result) {
                expect(isObject(result)).toBe(true);
                expect(contains(result, data[0])).toBe(true);
                expect(contains(result, data[1])).toBe(true);
                done();
            });
        });
    });

    describe("Getting", function() {
        it("Should get a named object", function(done){
            var storage = new Storage(),
                storeName = "my-store",
                data = { id: Storage.uid(), foo: "bar" };

            storage.add(data, { store: storeName, key: data.id });

            storage.get(storeName, data.id, function(result) {
                expect(result).toBe(data);
                done();
            });
        });

        it("Should get a hash of objects", function(done) {
            var storage = new Storage(),
                storeName = "my-store",
                id1 = Storage.uid(),
                id2 = Storage.uid(),
                data = { id1: { id: id1, foo: "bar"}, id2: { id: id2, foo: "fobar" } };

            storage.add(data, { store: storeName, reset: true });

            storage.get(storeName, function(result) {
                expect(result).toEqual(data);
                done();
            });         
        });

        it("Should get the count of a store", function(done) {
            var storage = new Storage(),
                storeName = "my-store",
                id1 = Storage.uid(),
                id2 = Storage.uid(),
                data = { id1: { id: id1, foo: "bar"}, id2: { id: id2, foo: "fobar" } };

            storage.add(data, { store: storeName, reset: true });

            storage.count(storeName, function(count) {
                expect(count).toBe(size(data));
                done();
            });

        });
    });

    describe("Updating", function() {
        it("Should update a named object", function(done) {
            var storage = new Storage(),
                storeName = "my-store",
                data = { id: Storage.uid(), foo: "bar" },
                newData = { foo: "foobar" };

            storage.add(data, { store: storeName, key: data.id });

            storage.update(newData, { store: storeName, key: data.id });

            storage.get(storeName, data.id, function(result) {
                expect(result).toEqual(newData);
                done();
            });
        });

        it("Should update a hash of objects", function(done) {
            var storage = new Storage(),
                storeName = "my-store",
                id1 = Storage.uid(),
                id2 = Storage.uid(),
                data = { id1: { id: id1, foo: "bar"}, id2: { id: id2, foo: "fobar" } },
                newData = { id1: { id: id1, foo: "bar"}, id2: { id: id2, foo: "foobar" } };


            storage.add(data, { store: storeName, reset: true });
            storage.update(newData, { store: storeName });

            storage.get(storeName, function(result) {
                expect(result).toEqual(newData);
                done();
            });
        });
    });

    describe("Deleting", function() {
        it("Should delete a named object", function(done) {
            var storage = new Storage(),
                storeName = "my-store",
                data = { id: Storage.uid(), foo: "bar" };

            storage.add(data, { store: storeName, key: data.id });

            storage.remove(storeName, data.id);

            storage.get(storeName, data.id, function(result) {
                expect(result).toBeUndefined();
                done();
            });
        });

        it("Should delete a whole store", function(done) {
            var storage = new Storage(),
                storeName = "my-store",
                id1 = Storage.uid(),
                id2 = Storage.uid(),
                data = { id1: { id: id1, foo: "bar"}, id2: { id: id2, foo: "fobar" } };

            storage.add(data, { store: storeName, reset: true })
                .remove(storeName);

            storage.count(storeName, function(count) {
                expect(count).toBe(0);
                done();
            });
        });

        it("Should broadcast events when deleting an object", function(done) {
            var storage = new Storage(),
                storeName = "my-store",
                data = { id: Storage.uid(), foo: "bar" },
                handler = jasmine.createSpy("handler");

            storage.add(data, { store: storeName, key: data.id })
                .on("remove:" + storeName + "." + data.id, handler);

            storage.remove(storeName, data.id, {
                done: function() {
                    expect(handler).toHaveBeenCalled();
                    done();
                }
            });
        });

        it("Should broadcast events when deleting an object silently", function(done) {
            var storage = new Storage(),
                storeName = "my-store",
                data = { id: Storage.uid(), foo: "bar" },
                handler = jasmine.createSpy("handler");

            storage.add(data, { store: storeName, key: data.id })
                .on("remove:" + storeName + "." + data.id, handler);

            storage.remove(storeName, data.id, {
                silent: true,
                done: function() {
                    expect(handler).not.toHaveBeenCalled();
                    done();
                }
            });
        });

        it("Should broadcast events when deleting a hash", function(done) {
            var storage = new Storage(),
                storeName = "my-store",
                id1 = Storage.uid(),
                id2 = Storage.uid(),
                data = { id1: { id: id1, foo: "bar"}, id2: { id: id2, foo: "fobar" } },
                handler = jasmine.createSpy("handler");

            storage.add(data, { store: storeName })
                .on("remove:" + storeName, handler);

            storage.remove(storeName, {
                done: function() {
                    expect(handler).toHaveBeenCalled();
                    done();
                }
            });
        });

        it("Should not broadcast events when deleting a hash silently", function(done) {
            var storage = new Storage(),
                storeName = "my-store",
                id1 = Storage.uid(),
                id2 = Storage.uid(),
                data = { id1: { id: id1, foo: "bar"}, id2: { id: id2, foo: "fobar" } },
                handler = jasmine.createSpy("handler");

            storage.add(data, { store: storeName })
                .on("remove:" + storeName, handler);

            storage.remove(storeName, {
                silent: true,
                done: function() {
                    expect(handler).not.toHaveBeenCalled();
                    done();
                }
            });
        });

        it("Should reset a whole store", function(done) {
            var storage = new Storage(),
                storeName = "my-store",
                id1 = Storage.uid(),
                id2 = Storage.uid(),
                data = { id1: { id: id1, foo: "bar"}, id2: { id: id2, foo: "fobar" } };

            storage.add(data, { store: storeName, reset: true })
                .reset(storeName);

            storage.count(storeName, function(count) {
                expect(count).toBe(0);
                done();
            });
        });

        it("Should broadcast reset", function() {
            var storage = new Storage(),
                storeName = "my-store",
                id1 = Storage.uid(),
                id2 = Storage.uid(),
                data = { id1: { id: id1, foo: "bar"}, id2: { id: id2, foo: "fobar" } },
                handler = jasmine.createSpy("handler");

            storage.on("reset:" + storeName, handler)
                .add(data, { store: storeName, reset: true })
                .reset(storeName);

            expect(handler).toHaveBeenCalled();
        });

        it("Should not broadcast a silent reset", function() {
            var storage = new Storage(),
                storeName = "my-store",
                id1 = Storage.uid(),
                id2 = Storage.uid(),
                data = { id1: { id: id1, foo: "bar"}, id2: { id: id2, foo: "fobar" } },
                handler = jasmine.createSpy("handler");

            storage.on("reset:" + storeName, handler)
                .add(data, { store: storeName, reset: true })
                .reset(storeName, { silent: true });

            expect(handler).not.toHaveBeenCalled();
        });
    });

});