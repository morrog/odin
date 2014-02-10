var Storage = require("./storage"),
	Injector = require("./injector"),
	mixIn = require("mout/object/mixIn"),
	stores = {},

LocalStorage = module.exports = Storage.extend({

	inject: {
		"localStorage": "window.localStorage"
	},

	_save: function(store, done) {
		this.localStorage.setItem(store._name, JSON.stringify(store));
		stores[store._name] = store;

		if(done) {
			done();
		}
	},

	count: function(name, done) {
		return this.getStore(name, function(store) {
			done(store.length);
		});
	},

	setObject: function(name, key, data, options) {
		this.getStore(name, function(store) {
			store[key] = data;
			this._save(store, options.done);
		});
	},

	setHash: function(name, data, options) {
		this.getStore(name, function(store) {
			mixIn(store, data);
			this._save(store, options.done);
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
				this._save(store, options.done);
			}
		});
	},

	removeHash: function(name, options) {
		this.getStore(name, function(store) {
			delete stores[name];
			this._save(store, options.done);
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
			store = { _name: name };
			stores[name] = {};
		}

		done.call(this, store);
	}

});

Injector.set("localStorage", LocalStorage);