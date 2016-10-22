//для запуска в папке с этим файлом(Casper.js) пишем casperjs Casper.js   phantom не надо запускать

"use strict";

var BR = global.BR = {};

BR.Config = require('Config/Config');

BR.Casper = require('casper').create({
});

BR.Casper.options.viewportSize = {width: 1920, height: 1080};

var _ = global._ = require('underscore');

require('/Classes/Service');
require('/Classes/Broadcast');

require('/Services/Grabber');

BR.Grabber.startGrabbing();


