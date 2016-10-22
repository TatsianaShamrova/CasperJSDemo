angular.module('bestrate').service('ConnectionSrv', ['$rootScope', function ($rootScope) {

    var _this = this;

    this.connect = function (main_scope) {

        var socket = this.Socket = new WebSocket('ws://localhost:3000');

        this.Socket.onopen = function () {

            console.info("#Web Socket: connection established.");

        };

        this.Socket.onclose = function () {
            console.log("#Web Socket: connection closed.");
        };

        this.Socket.onmessage = function (event) {

            console.log("#Web Socket: Receive data" + event.data);

            var data = JSON.parse(event.data);

            if (!data) return console.error("#Web Socket: Fail parse server data" + event.data);

            if (data.Rates) $rootScope.RateSrv.setRates(data.Rates);

            //так как мы используем внешние событие-вручную запускаем обновление scope
            if (main_scope.$root.$$phase != '$apply' && main_scope.$root.$$phase != '$digest') main_scope.$apply();
            //apply - процесс сравнения данных-метод ангуляра

        };

        this.Socket.onerror = function (err) {
            console.error(err);
        }
    };

    this.send = function (data) {

        this.Socket.send(JSON.stringify(data));
    };

}]);

