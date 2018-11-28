# uglify-es-brunch
An uglify-es plugin for Brunch.

## Configuration
Add an `uglify-es` object to your Brunch config's `plugins` object:

```
{
  plugins:
  {
    'uglify-es':
    {
      <options here>
    }
  }
}
```

You may specify any options that are accepted by uglify-es as described
in the API Reference section [here](https://www.npmjs.com/package/uglify-es).
This plugin doesn't parse or normalize any options - they are passed as-is to
uglify-es.  The options are held by reference, so they may be modified by
uglify-es, for example the nameCache option.

Sample config:

```
{
  plugins:
  {
    'uglify-es':
    {
      // When warnings are requested, they are treated like errors by
      // the plugin.
      warnings: true,

      // Produce ECMA2017 code.
      ecma: 8,

      // Mangle top-level variable and function names.
      toplevel: true,

      // Consistently mangle names across files.
      nameCache: {},

      parse:
      {
        // Support #!command as the first line.
        shebang: true
      }
    }
  }
}
```
