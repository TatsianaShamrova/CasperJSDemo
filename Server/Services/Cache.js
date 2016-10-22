BR.Cache = new Service({
    Name: 'Cache',
    initialize: function () {
        this._caches = {};

    },
    create: function (name, fn) {
        //Помечаем что нужно ждать кеширования рейтингов
        this._caches[name] = false;

        fn(_.bind(function () {

            this._caches[name] = true;

            this.checkReady();

        }, this));

    },
    checkReady: function () {

        if (_.size(this._caches) == _.size(_.filter(this._caches, function (v) {
                    return v;
                })))

        //Запускаем http сервер на порту 3000 для выдачи статического контента
        {

            Broadcast.call('Database Cache Ready');

        }
    }
    });
