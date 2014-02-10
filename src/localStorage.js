var Storage = require("./storage"),
	Injector = require("./injector"),
	mixIn = require("mout/object/mixIn"),
	size = require("mout/object/size"),
	stores = {},

LocalStorage = module.exports = Storage.extend({

	inject: {
		"localStorage": "window.localStorage"
	},

	_save: function(name, store, done) {
		this.localStorage.setItem(name, JSON.stringify(store));
		stores[name] = store;

		if(done) {
			done();
		}
	},

	count: function(name, done) {
		return this.getStore(name, function(store) {
			done(size(store));
		});
	},

	setObject: function(name, key, data, options) {
		this.getStore(name, function(store) {
			store[key] = data;
			this._save(name, store, options.done);
		});
	},

	setHash: function(name, data, options) {
		this.getStore(name, function(store) {
			mixIn(store, data);
			this._save(name, store, options.done);
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
				this._save(name, store, options.done);
			}
		});
	},

	removeHash: function(name, options) {
		this.getStore(name, function() {
			this._save(name, {}, options.done);
		});
	},

	getObject: function(name, key, done) {
		this.getStore(name, function(store) {
			done(store[key]);
		});
	},

	getHash: function(name, done) {
		this.getStore(name, function(store) {
			done(store);
		});
	},

	getStore: function(name, done) {
		var store = stores[name];

		if(!store) {
			this.localStorage.getItem(name);
		}

		if(!store) {
			store = {};
			stores[name] = store;
		}

		done.call(this, store);
	}

});

Injector.set("localStorage", LocalStorage);