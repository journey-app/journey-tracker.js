module.exports = function(config){
  config.set({
    captureConsole: true,

    basePath : '../',

    files : [
      'node_modules/jasmine-ajax/lib/mock-ajax.js',
      'node_modules/lodash/index.js',
      'journey-tracker.js',
      'test/**/*_test.js',
    ],

    autoWatch : true,

    frameworks: ['jasmine'],

    browsers : ['PhantomJS_custom'],

    plugins : [
      'karma-phantomjs-launcher',
      'karma-chrome-launcher',
      'karma-jasmine'
    ],

    customLaunchers: {
      'PhantomJS_custom': {
        base: 'PhantomJS',
        options: {
          settings: {
            windowName: 'my-window',
            webSecurityEnabled: false
          },
        },
        flags: ['--load-images=true'],
        debug: true
      }
    },

    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }
  });
};
