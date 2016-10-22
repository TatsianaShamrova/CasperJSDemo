angular.module('bestrate').controller('MainCtrl', ['$rootScope', '$scope', 'RateSrv', 'ConnectionSrv', function ($rootScope, $scope, RateSrv, ConnectionSrv) {
    $rootScope.ConnectionSrv = ConnectionSrv;
    $rootScope.RateSrv = RateSrv;
    $scope.scale = 1;
    $scope.scale_1 = 1;
    $scope.Math=Math;
    $scope.recalculateScale = function () {
        console.log(window.innerWidth);
        if (window.innerWidth>1000) {
            $scope.scale = (window.innerWidth) / 1920;
            $scope.scale_1 = (window.innerWidth) / 1920;
        }
        else {
            $scope.scale = (window.innerWidth)*2 / 1920;
            $scope.scale_1 = (window.innerWidth) / 1920;
        }
        //так как мы используем внешние событие-вручную запускаем обновление scope
        if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') $scope.$apply();
        //apply - процесс сравнения данных-метод ангуляра
    };

    window.addEventListener('resize', function () {
        $scope.recalculateScale();
    });
    $scope.recalculateScale();

    ConnectionSrv.connect($scope);


}]);
