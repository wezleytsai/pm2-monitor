// require this to use ES6 in all further required modules
require('babel-register')({
    ignore: function(filename) {
        return /node_modules/.test(filename);
    },
    presets: [ 'es2015', 'react', 'stage-0' ]
});
