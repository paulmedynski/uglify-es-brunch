// Our test app's brunch config, based on brunch init.
'use strict';

module.exports =
{
  // Disable OS notifications, since brunch will crash if you don't have the
  // correct OS notifier subsystem installed.
  notifications: false,

  files:
  {
    // Build any JavaScript and TypeScript files in the default app/ dir.
    javascripts: {joinTo: {'app.js': /\.[jt]s$/}},
    // Package any styles as well.
    stylesheets: {joinTo: 'app.css'}
  },

  plugins:
  {
    'uglify-es':
    {
      parse:
      {
        // parse options
      },
      compress:
      {
        ecma: 8,
        // Remove all code within DEBUG or TEST if-statement blocks.
        dead_code: true,
        global_defs:
        {
          DEBUG: false,
          TEST: false
        }
      },
      mangle:
      {
        // mangle options
        
        properties:
        {
          // mangle property options
        }
      },
      output:
      {
        ecma: 8,
        preamble: '// This line appears at the top of the optimized output\n'
      },
      sourceMap:
      {
        // source map options
      },
      // specify one of: 5, 6, 7 or 8
      ecma: 8,
      keep_classnames: false,
      keep_fnames: false,
      ie8: false,
      // null to disable name cache, or an object to build a name cache across
      // files.
      nameCache: {},
      safari10: false,
      toplevel: false,
      // false to include warnings in result.error; true to separate warnings
      // into result.warning; "verbose" for more detailed warnings.
      warnings: false
    },
    
    // Let's use TSLint to double-check that our TypeScript files don't have
    // any problems.
    tslint:
    {
      config:
      {
        extends: 'tslint:recommended',
        rules:
        {
          'max-classes-per-file': false,
          'no-empty': false,
          'one-line': false,
          'quotemark': false,
          'member-ordering': false,
          'no-console': false
        }
      }
    },

    // Configure the typescript-brunch plugin.  These are compiler options
    // that tsc would expect to find in a tsconfig.json file in the
    // "compilerOptons" section.
    //
    // These options should roughly match those in app/app-tsconfig.json if
    // you wish to run tsc to double-check compilation.
    brunchTypescript:
    {
      // Use the ES3 target if you want compilation to fail.  The test app
      // uses some features only found in later version of JavaScript.
      //target: 'ES3',
      target: 'ES2017',
      strict: true,
      pretty: true,
      sourceMap: true,
      traceResolution: false
    }
  }
};
