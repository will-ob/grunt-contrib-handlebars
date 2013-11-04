define(["require", "handlebars", "some/file", "other/list"], function(localRequire, Handlebars) {

  var tmplFn = function(){

return Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = "", stack1, stack2, options;
  buffer += "\n    ";
  options = {hash:{},inverse:self.noop,fn:self.program(2, program2, data),data:data};
  stack2 = ((stack1 = helpers.view || depth0.view),stack1 ? stack1.call(depth0, "thing", options) : helperMissing.call(depth0, "view", "thing", options));
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n  ";
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = "";
  buffer += "\n      Things in thing\n      "
    + "\n    ";
  return buffer;
  }

  buffer += "<section>\n  "
    + "\n  ";
  stack1 = helpers['if'].call(depth0, depth0.thing, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n</section>\n";
  return buffer;
  })

      }();

      var ret = function(){ return tmplFn.apply(this, arguments)};

      ret.require = localRequire; 

      return ret;

    });
