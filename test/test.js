// *********************************************************************
// Copyright 2018 Healthy Bytes Technology & Wellness
//
// Tests for plugin.js.

'use strict';

const mock = require('./MockUglifyEs');

// Load the plugin and tell it to use our MockTslint.
process.env.TEST = true;
const Plugin = require('../plugin');

const SourceMapGenerator = require('source-map').SourceMapGenerator;

// =======================================================================
// Test with our MockTslint.

describe('plugin', () =>
{
  beforeEach(() =>
  {
    // Reset the mock vars before each test.
    mock.reset();
  });
  
  // ----------------------------------------------------------------------
  // Test class API.

  it('class_api', () =>
  {
    expect(Plugin.prototype.hasOwnProperty('brunchPlugin')).toEqual(true);
    expect(typeof Plugin.prototype.brunchPlugin).toEqual('boolean');
    expect(Plugin.prototype.brunchPlugin).toEqual(true);
    
    expect(Plugin.prototype.hasOwnProperty('type')).toEqual(true);
    expect(typeof Plugin.prototype.type).toEqual('string');
    expect(Plugin.prototype.type).toEqual('javascript');
    
    expect(Plugin.prototype.hasOwnProperty('optimize')).toEqual(true);
    expect(typeof Plugin.prototype.optimize).toEqual('function');
  });
  
  // ----------------------------------------------------------------------
  // Test construction.

  it('construction', () =>
  {
    // No config object at all.
    let plugin = new Plugin();
    expect(plugin.cfg).toEqual({});
    
    // No plugins in config.
    plugin = new Plugin({});
    expect(plugin.cfg).toEqual({});
    
    // No uglify-es in plugins.
    plugin = new Plugin({ plugins: {} });
    expect(plugin.cfg).toEqual({});

    // Empty uglify-es in plugins.
    plugin = new Plugin({ plugins: { 'uglify-es': {} }});
    expect(plugin.cfg).toEqual({});

    // Several fields in uglify-es.
    plugin = new Plugin(
      {
        plugins:
        {
          'uglify-es':
          {
            // Any fields will do; we don't check that they're known to
            // uglify-es.
            foo: true,
            bar: 87,
            baz: 'Condor McNavid'
          }
        }
      });
    expect(plugin.cfg).toEqual(
      {
        foo: true,
        bar: 87,
        baz: 'Condor McNavid'
      });

    // Verify that we reference the uglify-es options by modifying some and
    // checking that they have changed.
    let opts =
      {
        foo: true,
        bar: 87,
        baz: 'Condor McNavid'
      };

    plugin = new Plugin({ plugins: { 'uglify-es': opts }});
    expect(plugin.cfg).toBe(opts);
    opts.foo = false;
    opts.bar = 78;
    opts.baz = 'Arabian Stallion';

    expect(plugin.cfg.foo).toEqual(false);
    expect(plugin.cfg.bar).toEqual(78);
    expect(plugin.cfg.baz).toEqual('Arabian Stallion');
  });
  
  // ----------------------------------------------------------------------
  // Test optimize().

  describe('optimize', () =>
  {
    // The default config to use.
    let config;

    beforeEach(() =>
    {
      // Reset the default config.
      config =
        {
          plugins:
          {
            'uglify-es':
            {
            }
          }
        };

      // Reset the mock vars before each test.
      mock.reset();
    });
    
    // --------------------------------------------------------------------
    // Empty content, no source map.

    it('empty', async () =>
    {
      const plugin = new Plugin(config);

      // Set the minified code to expect.
      mock.vars.minified = 'min!';

      const result = await plugin.optimize({path: 'path', data: ''});

      expect(mock.vars.src).toEqual('');
      expect(mock.vars.options).toEqual({});
      
      expect(result.data).toEqual('min!');
      expect(result.error).toEqual(undefined);
      expect(result.warnings).toEqual(undefined);
      expect(result.hasOwnProperty('map')).toEqual(false);
    });
    
    // --------------------------------------------------------------------
    // Empty content with source map.
    
    it('empty_with_map', async () =>
    {
      const plugin = new Plugin(config);

      mock.vars.minified = 'max!';
      mock.vars.map = 'max map!';
      
      const result = await plugin.optimize(
        {path: 'path', data: '', map: new SourceMapGenerator()});

      expect(mock.vars.src).toEqual('');
      expect(mock.vars.options).toEqual(
        {
          sourceMap:
          {
            filename: 'path',
            content:
            {
              version: 3,
              sources: [],
              names: [],
              mappings: ''
            }
          }
        });

      expect(result.data).toEqual('max!');
      expect(result.error).toEqual(undefined);
      expect(result.warnings).toEqual(undefined);
      expect(result.map).toEqual('max map!');
    });
    
    // --------------------------------------------------------------------
    // Handle errors.

    it('errors', async () =>
    {
      const plugin = new Plugin(config);

      mock.vars.errors = new Error('mock error');

      try
      {
        await plugin.optimize({path: 'path', data: 'some code'});
        fail('unexpected success');
      }
      catch (error)
      {
        expect(mock.vars.src).toEqual('some code');
        expect(error.message).toEqual('mock error');
      }
    });
    
    // --------------------------------------------------------------------
    // Treat warnings as errors.

    it('warnings', async () =>
    {
      // Try without asking for warnings, and they're ignored.
      const plugin = new Plugin(config);

      mock.vars.warnings = ['warning1', 'warning2'];
      mock.vars.minified = 'somecode';
      
      let result = await plugin.optimize({path: 'path', data: 'some code'});
      expect(result.data).toEqual('somecode');

      // Ok, now ask for warnings.
      config.plugins['uglify-es'].warnings = true;
      try
      {
        await plugin.optimize({path: 'path', data: 'some code'});
        fail('unexpected success');
      }
      catch (error)
      {
        expect(error.message).toEqual('Warnings:\nwarning1\nwarning2');
      }

      // Try that again with warnings = false.  We ignore them again.
      config.plugins['uglify-es'].warnings = false;
      result = await plugin.optimize({path: 'path', data: 'some code'});
      expect(result.data).toEqual('somecode');

      // Ok, ask again, but there are none.
      config.plugins['uglify-es'].warnings = true;
      delete mock.vars.warnings;
      result = await plugin.optimize({path: 'path', data: 'some code'});
      expect(result.data).toEqual('somecode');
    });
  });
});

// *********************************************************************
