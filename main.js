var request = require('request');
var htmlparser = require('htmlparser2');
var kinopoisk = require('kinopoisk-ru');
var fs = require('fs');
var week = require('week');

var source = 'http://saransktoday.ru/cinema/';
var weekNumber = week();

if (!fs.existsSync('images')) {
  fs.mkdir('images');
}
if (!fs.existsSync('images/' + weekNumber)) {
  fs.mkdir('images/' + weekNumber);
}

request(source, function(error, response, html) {
  if (!error && response.statusCode === 200) {
    var isItemFound = false;
    var isTitleFound = false;
    var isLinkFound = false;
    var parser = new htmlparser.Parser({
      onopentag: function(name, attributes) {
        if (name === 'div' && attributes.class === 'cinema_item') {
          isItemFound = true;
        }
        if (name === 'h2' && attributes.class === 'element-head') {
          isTitleFound = true;
        }
        if (isItemFound && isTitleFound && name === 'a') {
          isLinkFound = true;
        }
      },
      ontext: function(text) {
        if (isItemFound && isTitleFound && isLinkFound) {
          kinopoisk.search(text, null, function(searchError, result) {
            var movieId = result[0].id;
            if (!searchError) {
              var options = {
                host: 'www.kinopoisk.ru',
                path: '/images/film_big/' + movieId + '.jpg'
              };
              request.get({url: 'http://www.kinopoisk.ru/images/film_big/' + movieId + '.jpg', encoding: 'binary'}, function(error, response, body) {
                fs.writeFile('images/' + weekNumber + '/' + movieId + '.jpg', body, 'binary', function(error) {
                  if (error) {
                    console.log(error);
                  } else {
                    console.log('The preview for movie \'' + result[0].title + '\' was saved!');
                  }
                });
              });
            } else {
              console.log(searchError);
            }
          });
          isItemFound = false;
          isTitleFound = false;
          isLinkFound = false;
        }
      }
    }, {decodeEntities: true});
    parser.write(html);
    parser.end();
  }
});
