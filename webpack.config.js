const path = require('path');
const glob = require("glob");
const rimraf = require("rimraf");
const fs = require('fs');

rimraf.sync("./public/assets/scripts");

const timestamp = Date.now().toString().match(/.{8}$/g)[0];

var data = fs.readFileSync('./config/general.php', 'utf-8');
var newValue = data.replace(/'cacheBustTimestamp'.*/g, "'cacheBustTimestamp' => '"+ timestamp +"'");
fs.writeFileSync('./config/general.php', newValue, 'utf-8');

let entries = {
    app: './_compiled/app/script/App.js'
};

// Components
const components = glob.sync('./_compiled/templates/components/**/*.js');
for(let i = 0; i < components.length; i++){
    const name = components[i].match(/[ \w-]+?(?=\.)/)[0];
    entries[name] = components[i];
}

module.exports = {
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'none',
    entry: entries,
    output: {
        filename: '[name].'+timestamp+'.js',
        path: path.resolve(__dirname, './public/assets/scripts')
    },
    optimization: {
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          name: 'globals',
          maxInitialRequests: Infinity,
          minSize: 0,
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name(module) {
                // get the name. E.g. node_modules/packageName/not/this/part.js
                // or node_modules/packageName
                const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];

                // npm package names are URL-safe, but some servers don't like @ symbols
                return `npm.${packageName.replace('@', '')}`;
              },
            },
          },
        },
    }
};
