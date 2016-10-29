angular.module('bestrate').directive('itemCard', [function () {

    return {

        restrict: 'E',

        replace: true,

        templateUrl: 'app/components/item-card/item-card.htm',

        link: function (scope, el, attrs) {

            App.applyScale(el);

        },

        controller: ['$scope', function ($scope) {

        }]
    };

}]);