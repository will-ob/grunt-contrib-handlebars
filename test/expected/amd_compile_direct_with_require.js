define(["require", "handlebars", "some/file", "other/list"], function(localRequire, Handlebars) {

  var tmplFn = function(){

return Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, stack2, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

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
  
  var buffer = "", stack1, options;
  buffer += "\n      Things in thing\n      ";
  options = {hash:{},data:data};
  buffer += escapeExpression(((stack1 = helpers.require || depth0.require),stack1 ? stack1.call(depth0, "other/list", options) : helperMissing.call(depth0, "require", "other/list", options)))
    + "\n    ";
  return buffer;
  }

  buffer += "<section>\n  ";
  options = {hash:{},data:data};
  buffer += escapeExpression(((stack1 = helpers.require || depth0.require),stack1 ? stack1.call(depth0, "some/file", options) : helperMissing.call(depth0, "require", "some/file", options)))
    + "\n  ";
  stack2 = helpers['if'].call(depth0, depth0.thing, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n</section>\n";
  return buffer;
  })

      }();

      var ret = function(){ return tmplFn.apply(this, arguments)};

      ret.require = localRequire; 

      return ret;

    });
