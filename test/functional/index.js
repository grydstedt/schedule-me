var test        = require('tap').test,
    schedule-me    = require(__dirname + '/../lib/index.js');

schedule-me(function (err, obj) {
    test('functional', function (t) {
        t.equal(err, null, 'error object is null');
        t.end();
    });
});