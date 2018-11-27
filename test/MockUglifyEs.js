// ***************************************************************************
// Copyright 2018 Healthy Bytes Technology & Wellness
//
// A mock uglify-es object used to test our plugin.js.

'use strict';

const deepcopy = require('deepcopy');

// ---------------------------------------------------------------------------
// Variables that capture minify()'s input and influence its output.
//
const vars =
{
  // A copy of the most recent source code passed to minify().
  src: undefined,

  // A reference to the most recent options passed to minify().
  options: undefined,

  // The minified code to return from minify().
  minified: undefined,

  // The errors and warnings to return from minify().
  errors: undefined,
  warnings: undefined,

  // The source map to return from minify().
  map: undefined
};

// ---------------------------------------------------------------------------
// The only function we use from uglify-es is minify().  It takes the source
// code to minify and a reference to the options.
//
function minify(src_, options_)
{
  // Save the arguments.
  vars.src = src_;
  vars.options = deepcopy(options_);

  // Return the desired result.
  const result = { code: vars.minified };

  // Include errors if set.
  if (vars.errors !== undefined)
  {
    result.error = vars.errors;
  }

  // Include warnings if asked for and set.
  if (vars.options.warnings === true
     && vars.warnings !== undefined)
  {
    result.warnings = vars.warnings;
  }

  // Only include a source map in the result if one was given in the
  // options.
  if (vars.options.hasOwnProperty('sourceMap'))
  {
    result.map = vars.map;
  }

  return result;
}

// ---------------------------------------------------------------------------
// Reset the mock values to undefined.
//
function reset()
{
  vars.src = undefined;
  vars.options = undefined;
  vars.minified = undefined;
  vars.errors = undefined;
  vars.warnings = undefined;
  vars.map = undefined;
}

// ---------------------------------------------------------------------------
// We export an object with a minify() function and some variables that
// capture the input to minify() and influence its return value.

module.exports =
{
  minify: minify,
  vars: vars,
  reset: reset
};

// ***************************************************************************
