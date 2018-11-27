// *********************************************************************
// Copyright 2018 Healthy Bytes Technology & Wellness
//
// An uglify-es plugin for Brunch.

'use strict';

const debug = require('debug')('brunch:uglify-es');

// Use the real uglify-es library, or our mock library if we're testing.
let uglify;
if (! process.env.hasOwnProperty('TEST'))
{
  uglify = require('uglify-es');
}
else
{
  debug('Using mock uglify-es library');
  uglify = require('./test/MockUglifyEs');
}

class Uglifier
{
  // -------------------------------------------------------------------------
  // Construct the plugin with the entire Brunch config object.  We will pick
  // out our options from the plugins.uglify-es object.  See README.md for
  // documentation of the options.
  //
  // GOTCHA: We reference the given options - we don't make a copy.  This
  // means that uglify-es may modify the given options, for example the
  // nameCache option.
  //
  // If the warnings option is defined and non-false, then all warnings
  // generated by uglify-es will be treated as errors.
  //
  constructor(brunchCfg)
  {
    // Find our plugin's options within the global Brunch plugin
    // configuration, or use an empty config.
    //
    // The config supplied by Brunch is expected to be whatever options are
    // accepted by uglify-es as described in the API References section here:
    //
    // https://www.npmjs.com/package/uglify-es
    //
    // We don't parse or normalize anything supplied here.  It gets passed to
    // each file we're asked to optimize.
    //
    this.cfg = (brunchCfg
                && brunchCfg.plugins
                && brunchCfg.plugins['uglify-es']
		? brunchCfg.plugins['uglify-es']
		: {});
  }

  // -------------------------------------------------------------------------
  // Optimize a single file using the config supplied during construction.
  // This returns a resolved Promise of the optimized data, or a rejected
  // Promise with the error that occurred.
  //
  optimize(brunchFile)
  {
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // If Brunch gave us source map info, then we must ask uglify-es to modify
    // it to match the optimized output.

    if (brunchFile.map)
    {
      this.cfg.sourceMap =
        {
          filename: brunchFile.path,
          // Brunch passes in a source-map SourceMapGenerator object, and
          // uglify-es wants a plain object, which is obtained via the
          // confusingly-named toJSON() function (which definitely doesn't
          // return JSON).
          content: brunchFile.map.toJSON()
          // We omit the 'url' field here to inhibit uglify-es from appending
          // the '//# sourceMappingUrl=foo' line to the end of the optimized
          // code.  Brunch will add its own URL line, so we don't need the one
          // that uglify-es would otherwise generate.
        };
    }
    
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Perform the optimization.  This may modify the cfg.

    const optimized = uglify.minify(brunchFile.data, this.cfg);

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Check for errors.

    // Errors are always reported without any other results.  The presence of
    // the error key in the optimized result object indicates that an error
    // occurred, and no other keys will be present in the result.
    if (optimized.hasOwnProperty('error'))
    {
      // Reject with the error.  It is already an Error instance.
      return Promise.reject(optimized.error);
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Check for warnings.

    // Did the caller ask for warnings?  If so, then we treat them like
    // errors.
    if (this.cfg.hasOwnProperty('warnings')
        && this.cfg.warnings !== false
        && optimized.hasOwnProperty('warnings'))
    {
      // The warnings are just an array of strings, so we concatenate them
      // into a single string and put that into an Error.
      return Promise.reject(
        new Error('Warnings:\n' + optimized.warnings.join('\n')));
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Build the result to return to Brunch.

    let result = { data: optimized.code };

    // Add the new source map, if one was passed in.
    if (brunchFile.map)
    {
      // Clear the original source map config so it doesn't pollute the next
      // call to optimize().
      delete this.cfg.sourceMap;

      // Brunch expects the optimized source map as a string, which is how
      // uglify-es returns it.
      result.map = optimized.map;
    }
    
    // Return the result.
    return Promise.resolve(result);
  }
}

// Tell Brunch that we are a plugin, and we handle code source files.
//
// Note that the presence of an optimize() function on Uglifier tells Brunch
// that we're an optimizer.
//
Uglifier.prototype.brunchPlugin = true;
Uglifier.prototype.type = 'javascript';

module.exports = Uglifier;

// *********************************************************************
