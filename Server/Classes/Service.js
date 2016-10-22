var Service = global.Service = function (properties) {

    var libraries = properties.$libraries;

    var initializes = [];

    if (!properties.Actions) properties.Actions = {};

    if (!properties.Routes) properties.Routes = {};

    if (libraries) for (var i = 0; libraries[i]; i++) {

        var library = require('../' + libraries[i]);

        if (library.initialize) {

            initializes.push(library.initialize);

            delete library.initialize;

        }

        if (library.Actions) {

            _.extend(properties.Actions, library.Actions);

            delete library.Actions;

        }

        if (library.Routes) {

            _.extend(properties.Routes, library.Routes);

            delete library.Routes;

        }

        if (library.Events) {

            _.extend(properties.Events, library.Events);

            delete library.Events;

        }

        _.extend(properties, library);
    }

    _.extend(properties, Service.Properties);

    properties.activateModel();

    properties.activateActions();

    properties.activateRoutes();

    properties.activateEvents();

    if (properties.initialize) properties.initialize.apply(properties, []);

    for (i = 0; initializes[i]; i++) initializes[i].apply(properties, []);

    return properties;

};

Service.Properties = {

    activateModel: function () {

        if (!this.Model) return;

        this.Schema = new BR.Mongoose.Schema(this.Model, {

            toJSON: {

                virtuals: true

            },

            toObject: {

                virtuals: true

            }

        });

        if (this.modifySchema) this.Schema = this.modifySchema(this.Schema);

        this.Model = BR.Mongoose.model(this.Name, this.Schema);

    },

    activateActions: function () {

        Broadcast.on('Client Data Received', function (connection_data, data) {

            if (this.Actions[data.Action]) this.Actions[data.Action].apply(this, [connection_data, data]);

        }, this);

    },

    activateRoutes: function () {

        _.each(this.Routes, function (params, path) {

            if (_.isFunction(params)) params = {process: params};

            var fn = params.process,
                    _this = this;

            var type = 'post';

            if (path.indexOf('get:') === 0) {
                type = 'get';
                path = path.substr(4);
            }

            if (type == 'post') {

                BR.Express.post( path, function (req, res) {

                    console.log('66666');

                    fn.apply(_this, [req, res, function (data) {

                        BR.SendHttpResult(res, data || '');

                    }]);

                });

            } else if (type == 'get') {

                BR.Express.get(path, function (req, res) {

                    fn.apply(_this, [req, res, function (data) {

                        BR.SendHttpResult(res, data || '');

                    }]);

                });

            }

        }, this);

    },

    activateEvents: function () {

        _.each(this.Events, function (fn, event_name) {

            Broadcast.on(event_name, fn, this);

        }, this);

    }

};