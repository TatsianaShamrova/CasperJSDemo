angular.module('bestrate').service('RateSrv', ['$rootScope', function ($rootScope) {

    window.RateSrv=this;

    this.Filter = '';

    this.Rates = [];

    this.RatesHash = {};

    this.setRates = function (rates) {

        _.each(rates, function (rate) {

            $rootScope.RateSrv.RatesHash[rate._id] = rate;

        });

        $rootScope.RateSrv.Rates = _.values($rootScope.RateSrv.RatesHash);

        $rootScope.RateSrv.Rates = _.sortBy($rootScope.RateSrv.Rates, function (rate) {

            return rate.Date;

        });

    };

    this.setFilter = function (filter) {

        this.Filter = filter;

        console.log('filter: ', filter);

        if(filter) $rootScope.ConnectionSrv.send({

            Action: 'getRates',

            Filter: this.Filter

        });


    };

}]);
