var request = require('request');
var htmlparser = require('htmlparser2');

var source = 'http://saransktoday.ru/cinema/';

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
          console.log(text);
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