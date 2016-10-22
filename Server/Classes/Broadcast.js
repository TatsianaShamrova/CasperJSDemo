//-----------------------------------------------------------------------------
// Filename : Broadcast.js
//-----------------------------------------------------------------------------
// Language : Javascript
// Author : Alexandr Sorochinsky
// Date of creation : 02.07.2016
// Require: underscore.js
//-----------------------------------------------------------------------------
// Broadcast pattern class
//-----------------------------------------------------------------------------

var Broadcast = {

	_prototype: {

		on: function (event_name, func, source, options) {

			var i, l;

			if (typeof event_name != 'string') {

				for (i = 0, l = event_name.length; i<l; i++) {

					this.on(event_name[i], func, source, options);

				}

			} else {

				if (!options) options = {};

				if (typeof source == 'string') options.index = source;

				else if (source) {

					options.index = this._getIndexBySource(source);

					options.bind = source;

				}

				if (options && options.index) {

					if (!this._events[event_name]) this._events[event_name] = {};

					this.off(event_name, options.index);

					if (options && options.index && options.timeStopper) {

						var original_func = func, _this = this;

						func = function () {

							var params = arguments;

							if (!_this._stoppers[event_name + '-' + options.index]) _this._stoppers[event_name + '-' + options.index] = setTimeout(function () {

								_this._stoppers[event_name + '-' + options.index] = null;

								_this._callSubscriber(original_func, options, params);

							}, options.timeStopper);

						}

					}

					this._events[event_name][options.index] = {func: func, options: options};

				} else {

					console.warn('Broadcast.on: you need specify source of event subscriber or options.index (key of subscribe function)');

				}

			}

		},

		off: function (event_name, source) {

			if (!source) console.warn('Broadcast.off: you need specify source of event subscriber or index (key of subscribe function)');

			if (typeof event_name != 'string') {

				for (var i = 0, l = event_name.length; i<l; i++) {

					this.off(event_name[i], source);

				}

			} else {

				var index = (typeof source == 'string') ? source : this._getIndexBySource(source);

				var funcs = this._events[event_name];
				if (!funcs || !funcs[index]) return;

				delete funcs[index];

			}

		},

		offAll: function(event_name) {

			this._events[event_name] = {};

		},

		call: function (event_name, params, options, source) {

			var _this = this;

			if (options && options.delay) {

				setTimeout(function () {

					_this.call(event_name, params, options);

				}, options.delay);

				delete options.delay;

			} else {

				var subscriber, opt, funcs = this._events[event_name];

				if (!funcs) return;

				if (source) {

					var index = (typeof source == 'string') ? source : this._getIndexBySource(source);

					subscriber = funcs[index];
					opt = funcs[index].options || {};

					if (opt.delay) {

						_this._delayCallSubscriber(subscriber.func, opt, params);

					} else {

						_this._callSubscriber(subscriber.func, opt, params);

					}

				} else {

					for (var i in funcs) if (funcs.hasOwnProperty(i)) {

						subscriber = funcs[i];
						opt = funcs[i].options || {};

						if (opt.delay) {

							_this._delayCallSubscriber(subscriber.func, opt, params);

						} else {

							_this._callSubscriber(subscriber.func, opt, params);

						}

					}

				}

			}

		},

		logEvents: function() {

			console.log(this._events);

		},

		_delayCallSubscriber: function (func, options, params) {

			var _this = this;

			if (!options.delayTimeout) {

				options.delayTimeout = setTimeout(function () {

					_this._callSubscriber(func, options, params);

					options.delayTimeout = null;

				}, options.delay);

			}

		},

		_callSubscriber: function (func, options, params) {

			func.apply(options.bind || this, params || []);

		},

		_getIndexBySource: function(source) {

			if (source._broadcast_index) return source._broadcast_index;

			source._broadcast_index = (source.broadcastName || source.displayName || source.name || 'object') + this._broadcast_index++;

			return source._broadcast_index;

		}

	},

	create: function (object) {

		//TODO: check conflicting properties and warn it

		var prototype = Broadcast._prototype;

		for (var i in prototype) if (prototype.hasOwnProperty(i) && typeof prototype[i] == 'function') {

			object[i] = prototype[i];

		}

		object._events = {};

		object._stoppers = {};

		object._broadcast_index = 0;

	}

};

Broadcast.create(Broadcast);

if (typeof global == 'object') {
	global.Broadcast=Broadcast
};
