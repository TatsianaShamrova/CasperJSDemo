angular.module('bestrate').directive('landingHeader', [function(){

    return {

        restrict: 'EA',

        replace: true,

        templateUrl: 'app/components/landing-header/landing-header.htm',

        link: function(scope, el, attrs){

        App.applyScale(el);

        },

        controller: function () {



        }
    };

}]);