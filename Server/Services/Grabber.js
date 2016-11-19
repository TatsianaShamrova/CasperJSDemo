BR.Grabber = new Service({

	Name: 'Grabber',

	initialize: function () {

		this.Query = [];

		this.Data = [];

	},

	run: function () {
		this.runCasperjsProcess();

		setInterval(function () {

			BR.Grabber.runCasperjsProcess()

		}, 3600 * 1000);
	},

	runCasperjsProcess: function () {
		var spawn = require('child_process').spawn;
		var prc = spawn('casperjs', ['Server/Casper.js']);
		prc.stdout.setEncoding('utf8');
		prc.stdout.on('data', function (data) {
			var str = data.toString();
			var lines = str.split(/(\r?\n)/g);
			console.log(lines.join(""));
		});

		prc.on('close', function (code) {

			console.log('process exit code ' + code);

			BR.Rates.updateTopRatesCache();
		});

	},

	startGrabbing: function () {

		BR.Grabber.openPage('http://ebay.com', 'div#dailyDeals', {loadImages: false}, function () {

			var result = this.evaluate(function () {

				var result = [];

				var new_rates_holders = document.querySelectorAll('div#dailyDeals div.ddcrd.daily-deal');

				for (var i = 0; new_rates_holders[i]; i++) {

					var item = {};

					item.title = new_rates_holders[i].querySelector('a span.tl').innerText;

					item.cost = new_rates_holders[i].querySelector('div.info').innerText;

					item.image = new_rates_holders[i].querySelector('div.icon img').getAttribute('src');

					item.url = new_rates_holders[i].querySelector('a.clr').getAttribute('href');

					result.push(item);

				}

				return result;

			});

			BR.Grabber.Query = result || [];

			BR.Grabber.processQuery();


		});

	},

	processQuery: function () {

		var item = this.Query[0];

		console.log('processQuery', this.Query.length);

		if (item) {

			this.Query.splice(0, 1);

			BR.Grabber.openPage(item.url, 'h3.refit-itemcard-title', {loadImages: false}, function () {

				var inner_link = this.evaluate(function () {

					return document.querySelector('h3.refit-itemcard-title a').getAttribute('href');

				});

				BR.Grabber.openPage(inner_link, 'h1#itemTitle', {loadImages: false}, function () {

					var result = this.evaluate(function () {

						var item = {};

						item.title = document.querySelector('h1#itemTitle').innerText;

						item.rate = document.querySelectorAll('span.vi-core-prdReviewCntr i.fullStar').length;

						item.date = new Date();

						return item;

					});

					result.image = item.image;

					result.cost = item.cost;

					BR.Grabber.Data.push(result);

					BR.Grabber.processQuery();

				});

			});

		}
		else {
			BR.Grabber.sendToServer({
				'Source': 'ebay.com',
				'Rates': this.Data
			});
		}
	},

	openPage: function (url, selector, options, next) {

		if (options.loadImages === false) {

			BR.Casper.options.pageSettings = {
				loadImages: false,
				loadPlugins: false
			}
		} else {

			BR.Casper.options.pageSettings = {
				loadImages: true,
				loadPlugins: true

			}
		}

		BR.Casper.start(url);

		BR.Casper.then(function () {

			BR.Casper.waitFor(function () {

				return this.evaluate(function (selector) {
					return document.querySelectorAll(selector).length > 0;
				}, {
					selector: selector
				});

			}, function () {

				this.echo('Elements successfully found');

			}, 30000);

		});

		BR.Casper.run(function () {

			next.apply(this, []);

		});
	}
	,

	sendToServer: function (data) {

		console.log('data', data, BR.Config.Url + ':' + BR.Config.Port + '/Rates/add');

		setTimeout(function () {
			BR.Casper.done();
		}, 5000);

		BR.Casper.open(BR.Config.Url + ':' + BR.Config.Port + '/Rates/add', {
			method: 'POST',
			encoding: 'utf8',
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			},
			data: data
		});

	}

});

