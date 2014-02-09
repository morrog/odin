var Base = require("./base"),
	Injector = require("./injector"),
	mixIn = require("mout/object/mixIn"),
	size = require("mout/object/size"),
	isObject = require("mout/lang/isObject"),
	stores = {},

wrapDone = function(context, event, data, done, silent) {
	return function() {
		if(!silent) {
			context.trigger(event, data);
		}

		if(done) {
			done.apply(done, arguments);
		}
	};
},

Storage = module.exports = Base.extend({

	constructor: function() {
		return Storage.super_.call(this);
	},

	add: function(data, options) {
		if(options.reset) {
			this.reset(options.store, { silent: true });
		}

		options = options || {};
		options.done = wrapDone(this, "add:" + options.store, data, options.done, options.silent);

		if(options.key) {
			this.setObject(options.store, options.key, data, options);
		} else {
			this.setHash(options.store, data, options);
		}

		return this;
	},

	update: function(data, options) {
		var storeName = options.store;

		if(options.key) {
			storeName += "." + options.key;
		}

		options.done = wrapDone(this, "update:" + storeName, data, options.done, options.silent);

		if(options.key) {
			this.updateObject(options.store, options.key, data, options);
		} else {
			this.updateHash(options.store, data, options);
		}

		return this;
	},

	get: function(name, key, done) {
		var self = this;

		if(typeof done === "undefined") {
			done = key;
			key = null;
		}

		return this.getStore(name, function(store) {
			if(key) {
				return self.getObject(store, key, done);
			}

			self.getHash(store, done);
		});
	},

	remove: function(name, key, options) {
		var storeName = name;

		if(isObject(key) || typeof key === "undefined") {
			options = key;
			key = null;
		}

		options = options || {};
		if(key) {
			storeName += "." + key;
		}

		options.done = wrapDone(this, "remove:" + storeName, null, options.done, options.silent);

		if(key) {
			this.removeObject(name, key, options);
		} else {
			this.removeHash(name, options);
		}

		return this;
	},

	reset: function(name, options) {
		options = options || {};
		options.done = wrapDone(this, "reset:" + name, null, options.done, options.silent);

		this.removeHash(name, options);

		return this;
	},

	count: function(name, done) {
		return this.getStore(name, function(store) {
			done(size(store));
		});
	},

	setObject: function(name, key, data, options) {
		this.getStore(name, function(store) {
			store[key] = data;

			if(options.done) {
				options.done();
			}
		});
	},

	setHash: function(name, data, options) {
		this.getStore(name, function(store) {
			mixIn(store, data);

			if(options.done) {
				options.done();
			}
		});
	},

	updateObject: function(name, key, data, options) {
		this.setObject(name, key, data, options);
	},

	updateHash: function(name, data, options) {
		this.setHash(name, data, options);
	},

	removeObject: function(name, key, options) {
		this.getStore(name, function(store) {
			if(store[key]) {
				delete store[key];

				if(options.done) {
					options.done();
				}
			}
		});
	},

	removeHash: function(name, options) {
		if(stores[name]) {
			delete stores[name];

			if(options.done) {
				options.done();
			}
		}
	},

	getStore: function(name, done) {
		done(stores[name] || (stores[name] = {}));
	},

	getObject: function(store, key, done) {
		done(store[key]);
	},

	getHash: function(store, done) {
		done(store);
	}

});

Injector.set("storage", Storage.defineMe());