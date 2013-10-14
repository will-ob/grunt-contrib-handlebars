# Enhandced AMD wrappers for handlebars

**Better dependency arrays** provide access to local require and referenced classes.

<pre>
+ --base
|    |-- view.handlebars
|    |-- path
|        |-- to
|            |-- subview.js
|-- build
|    |-- view.jst.js
+ handlebars-helpers.js
</pre>

Use `{{require}}` to indicate dependencies

### Handlebars template

```html

<!-- view.handlebars -->
{{require "./path/to/subview" }}

<h1>{{title}}</h1>
<div class="campus">
  {{view "./path/to/subview" }}
</div>
```

### Compiled template
Compiled templates **include local require** and **all referenced classes** in dependency array.

```javascript
// view.jst.js
define(["require", "./path/to/subview"], function(localRequire) {
  context.require = localRequire;

  // ... code for template ...

});
```
### Example helper

```javascript
// handlebars-helpers.js
Handlebars.registerHelper("view", function(name, options){
  var id = _.uniqueId();

  // can load modules relative to template file
  options.data.require([name], function(View){
    var view = new View(options); // LocalView class
    $("#" + id).html(view.render().el);
  });

  return "<div id='" + id + "'></div>";
});

```

*complete example [here](https://github.com/will-ob/backbone-handlebars-amd/blob/master/src/backbone_handlebars.coffee)*

