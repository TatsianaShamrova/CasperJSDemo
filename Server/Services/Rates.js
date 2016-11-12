BR.Rates = new Service({

    Name: 'Rates',

    Model: {
        Hash: {
            type: String,
            default: ''
        },
        Title: {
            type: String,
            default: ''
        },
        Image: {
            type: String,
            default: ''
        },
        Rate: {
            type: Number,
            default: 0
        },
        Cost: {
            type: String,
            default: ''
        },
        Date: {
            type: Date,
            default: Date.now
        }
    },
    Events: {
        'Database Ready': function () {

            this.Collection = BR.Mongo.collection('rates');

            BR.Cache.create(this.Name, function (ready) {

                BR.Rates.updateTopRatesCache(function () {

                    ready();

                });

            });


        },

        'User Connected': function (connection_data) {

            BR.SendToConnection(connection_data, {
                Rates: this.TopRates

            });
        },
        'Top Rates Cache Updated': function () {

            BR.SendToAllConnections({
                Rates: this.TopRates
            });
        }
    },

    Routes: {
        '/Rates/add': function (req, res, next) {

            //console.log('44444444', req.body);

            next({});

            this.processNewRates(req.body.Source, req.body.Rates);

        }
    },

    Actions: {
        getRates: function (connection_data, data) {

            this.getRates(data.Filter, function (rates) {

                BR.SendToConnection(connection_data, {
                    Rates: rates
                });
            })
        }
    },

    initialize: function () {

        this.TopRates = [];


    },

    processNewRates: function (source, rates) {
        //Собираем массив уникальных отзывов
        var hashes = [];

        _.each(rates, function (rate_data) {

            //Строка для хэширования
            var key_string = rate_data.title + '-' + rate_data.image;

            //Создаем уникальный хэш для этого отзыва
            var sha = BR.Crypto.createHash('sha256');

            sha.update(key_string);

            var hash = sha.digest('hex');

            hashes.push(hash);

            rate_data.hash = hash;

        }, this);

        //Ищем отзыв по этим хэшам
        BR.Rates.Collection.find({Hash: {$in: hashes}}, {Hash: true}, {}).toArray(function (err, exist_hashes) {

            exist_hashes = _.pluck(exist_hashes, 'Hash');

            BR.Logger.debug('Ищем в базе отзыв с хэшем', hashes, exist_hashes);

            _.each(rates, function (rate_data) {

                if (!_.contains(exist_hashes, rate_data.hash)) {
                    BR.Rates.Collection.insert({
                        Hash: rate_data.hash,
                        Title: rate_data.title,
                        Cost: rate_data.cost,
                        Image: rate_data.image,
                        Rate: rate_data.rate,
                        Date: rate_data.date
                    }, function (err, rate) {

                        BR.Logger.debug('Добавлен новый отзыв', rate);
                    })
                }

            });

        });
    },

    updateTopRatesCache: function (next) {

        this.getTopRates(function (rates) {

            BR.Rates.TopRates = rates;

            Broadcast.call('Top Rates Cache Updated');

            if (next) next();

        });
    }

    ,

    getTopRates: function (next) {

        this.Collection.find({}, {Title: true, Image: true, Rate: true, Cost: true, Date: true}, {
            sort: {Date: -1},
            limit: 25
        }).toArray(function (err, result) {

            next(result);

        });
    },

    getRates: function (filter, next) {
        try {
            var regexp = new RegExp(filter);

            this.Collection.find({Title: regexp}, {Title: true, Image: true, Rate: true, Cost: true, Date: true}, {
                sort: {Date: 1},
                limit: 10
            }).toArray(function (err, result) {

                next(result);

            });

        } catch (e) {

        }
    }
});

