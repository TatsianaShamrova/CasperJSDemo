angular.module('bestrate').directive('searchResults', [function () {

    return {

        restrict: 'E',

        replace: true,

        templateUrl: 'app/components/search-results/search-results.htm',

        link: function (scope, el, attrs) {

            App.applyScale(el);

        },

        controller: ['$scope', function ($scope) {

            $scope.filterResults = function (item) {

                if (!$scope.RateSrv.Filter) return true;

                var regexp= new RegExp($scope.RateSrv.Filter, 'i');

                if (item.Title.match(regexp)) return true;

                return false;
            }
        }]
    };

}]);