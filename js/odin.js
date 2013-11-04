(function(window, $, undefined) {

	var Odin = function() {
		this._events = {};
		return this.init.apply(this, arguments);
	},

	eachEvent = function(names, handler, context, method) {
		var i = 0, len, result = [];

		names = names.split(" ");

		for(len = names.length; i < len; i++) {
			result.push(method(names[i].split(":"), handler, context));
		}

		return result;
	};

	Odin.prototype = {

		_events: {},

		init: function() {
			return this;
		},

		on: function(names, handler, context) {
			this._eachEvent(names, handler, context, this._pushEvent);
			return this;
		},

		off: function(names, handler, context) {
			this._eachEvent(names, handler, context, this._popEvent);
			return this;
		},

		trigger: function(names) {
			this._eachEvent(names, _.tail(arguments), this._fireEvent);
			return this;
		},

		fire: function(names) {
			return this._eachEvent(names, _.tail(arguments), this._fireEvent);
		},

		_eachEvent: function(names) {
			var i = 0, len,
				method = _.last(arguments),
				result = [];

			names = names.split(" ");

			for(len = names.length; i < len; i++) {
				result.push(method.apply(this, [names[i].split(":")].concat(_.initial(_.tail(arguments)))));
			}

			return _.flatten(result);
		},

		_pushEvent: function(names, handler, context) {
			var name = names[0],
				namespace = names[1],
				stack = this._events[name] || (this._events[name] = []);
			
			stack.push({
				name: name,
				namespace: namespace,
				handler: handler,
				context: context || this
			});
		},

		_popEvent: function(names, handler, context) {
			var name = names[0],
				namespace = names[1],
				stack = this._events[name] || (this._events[name] = []),
				i = 0, len = stack.length, ev, keep = [];

			if(!name && namespace) {
				stack = [];

				_.each(_.flatten(this._events), function(ev) {
					ev.namespace === namespace && stack.push(ev);
				});

				len = stack.length;
			}

			if(!stack || !len) {
				return;
			}

			if(!handler && !context) {
				if(!namespace) {
					delete this._events[name];
				} else {
					_.each(stack, function(ev) {
						this._events[ev.name] = _.without(this._events[ev.name], ev);
					}, this);
				}

				return this;
			}

			for(; i < len; i++) {
				ev = stack[i];

				if((handler && ev.handler === handler && context && ev.context === context) ||
					(handler && ev.handler === handler && !context) ||
					(!handler && context && ev.context === context)) {
					this._events[ev.name] = _.without(this._events[ev.name], ev);
				}
			}

			return this;
		},

		_fireEvent: function(names) {
			var name = names[0],
				namespace = names[1],
				stack = this._events[name],
				args = _.tail(arguments),
				i = 0, len = stack.length,
				result = [], ev;

			if(!name && namespace) {
				stack = [];

				_.each(_.flatten(this._events), function(ev) {
					ev.namespace === namespace && stack.push(ev);
				});

				len = stack.length;
			}

			if(!stack || !len) {
				return;
			}

			for(; i < len; i++) {
				ev = stack[i];

				if(namespace && ev.namespace !== namespace) {
					continue;
				}

				result.push(ev.handler.apply(ev.context, args));
			}

			return result;
		}

	};

	Odin.extend = function(proto, static) {
		var child = function() { return this.init.apply(this, arguments); };

		child.prototype = _.extend(Object.create(this.prototype), proto);
		child.prototype.__super = this.prototype;
		child.constructor = child;
		
		_.extend(child, this, static || {});

		return child;
	}

	window.Odin = Odin;	

}(window, jQuery));