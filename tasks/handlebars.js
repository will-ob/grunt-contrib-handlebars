/*
 * grunt-contrib-handlebars
 * http://gruntjs.com/
 *
 * Copyright (c) 2013 Tim Branyen, contributors
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {
  var _ = grunt.util._;
  var helpers = require('grunt-lib-contrib').init(grunt);

  // content conversion for templates
  var defaultProcessContent = function(content) { return content; };

  // AST processing for templates
  var defaultProcessAST = function(ast) { return ast; };

  // filename conversion for templates
  var defaultProcessName = function(name) { return name; };

  var findMustacheNodes = function(node){
    var nodes, statement;
    if(node === undefined){return [];}
    if(node === null){return [];}

    nodes = [];
    // MustacheNode          - add node        // could be {{require}} or any helper
    // PartialNode
    // BlockNode             - search program
    // ContentNode           - noop
    // HashNode              - noop
    // IdNode
    // PartialNameNode
    // DataNode
    // StringNode            - noop
    // IntegerNode           - noop
    // BooleanNode           - noop
    // CommentNode           - noop

    // Spectial note: partials cannot use the require syntax

    if(node.type === "program" || node.program){
      nodes = nodes.concat(findMustacheNodes(node.statements));
    }
    if(node.statements){
      for(var i in node.statements ){
        statement = node.statements[i];
        if(statement === null){
          continue;
        }
        if(statement.type === "mustache"){
          nodes.push(statement);
          grunt.log.error(JSON.stringify(_.keys(statement.id)));
          if(statement.id.string === "require"){
            node.statements[i] = null;
            continue;
          }
        }
        if(statement.mustache){
          nodes = nodes.concat(findMustacheNodes(statement.mustache));
          nodes = nodes.concat(findMustacheNodes(statement.mustache.program));
        }
        if(statement.type === "program" || statement.program){
          nodes = nodes.concat(findMustacheNodes(statement));
          nodes = nodes.concat(findMustacheNodes(statement.program));
        }
      }
      node.statements = _.compact(node.statements);
    }
    return nodes;
  };
  var extractRequired = function(ast){
    var modules, nodes, node;
    modules = [];
    nodes = findMustacheNodes(ast);
    for(var j in nodes){
      node = nodes[j];
      if(node.id.string === "require"){
        modules.push(node.params[0].string);
      }
    }
    return modules;
  };

  // filename conversion for partials
  var defaultProcessPartialName = function(filePath) {
    var pieces = _.last(filePath.split('/')).split('.');
    var name   = _(pieces).without(_.last(pieces)).join('.'); // strips file extension
    if (name.charAt(0) === '_') {
      name = name.substr(1, name.length); // strips leading _ character
    }
    return name;
  };

  grunt.registerMultiTask('handlebars', 'Compile handlebars templates and partials.', function() {
    var options = this.options({
      namespace: 'JST',
      separator: grunt.util.linefeed + grunt.util.linefeed,
      wrapped: true,
      amd: false,
      commonjs: false,
      knownHelpers: [],
      knownHelpersOnly: false
    });
    grunt.verbose.writeflags(options, 'Options');

    var nsInfo;
    if (options.namespace !== false) {
      grunt.log.error("Namespace must be false. grunt-required-handlebars will not attach templates to globals for you.");
      nsInfo = helpers.getNamespaceDeclaration(options.namespace);
    }

    // assign regex for partials directory detection
    var partialsPathRegex = options.partialsPathRegex || /./;

    // assign regex for partial detection
    var isPartial = options.partialRegex || /^_/;

    // assign transformation functions
    var processContent = options.processContent || defaultProcessContent;
    var processName = options.processName || defaultProcessName;
    var processPartialName = options.processPartialName || defaultProcessPartialName;
    var processAST = options.processAST || defaultProcessAST;

    // assign compiler options
    var compilerOptions = options.compilerOptions || {};

    this.files.forEach(function(f) {
      var partials = [];
      var templates = [];
      var requiredModules = [];

      // iterate files, processing partials and templates separately
      f.src.filter(function(filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      })
      .forEach(function(filepath) {
        var src = processContent(grunt.file.read(filepath));
        var Handlebars = require('handlebars');
        var ast, compiled, filename;
        try {
          // parse the handlebars template into it's AST
          ast = processAST(Handlebars.parse(src));
          requiredModules = extractRequired(ast);
          compiled = Handlebars.precompile(ast, compilerOptions);

          // if configured to, wrap template in Handlebars.template call
          if (options.wrapped === true) {
            compiled = 'Handlebars.template('+compiled+')';
          }
        } catch (e) {
          grunt.log.error(e);
          grunt.fail.warn('Handlebars failed to compile '+filepath+'.');
        }

        // register partial or add template to namespace
        if (partialsPathRegex.test(filepath) && isPartial.test(_.last(filepath.split('/')))) {
          filename = processPartialName(filepath);
          if (options.partialsUseNamespace === true) {
            partials.push('Handlebars.registerPartial('+JSON.stringify(filename)+', '+nsInfo.namespace+'['+JSON.stringify(filename)+'] = '+compiled+');');
          } else {
            partials.push('Handlebars.registerPartial('+JSON.stringify(filename)+', '+compiled+');');
          }
        } else {
          if(options.amd && options.namespace === false) {
            compiled = 'return ' + compiled;
          }
          filename = processName(filepath);
          if (options.namespace !== false) {
            templates.push(nsInfo.namespace+'['+JSON.stringify(filename)+'] = '+compiled+';');
          } else if (options.commonjs === true) {
            templates.push('templates['+JSON.stringify(filename)+'] = '+compiled+';');
          } else {
            templates.push(compiled);
          }
        }
      });

      var output = partials.concat(templates);
      if (output.length < 1) {
        grunt.log.warn('Destination not written because compiled files were empty.');
      } else {
        if (options.namespace !== false) {
          output.unshift(nsInfo.declaration);

          if (options.node) {
            output.unshift('Handlebars = glob.Handlebars || require(\'handlebars\');');
            output.unshift('var glob = (\'undefined\' === typeof window) ? global : window,');

            var nodeExport = 'if (typeof exports === \'object\' && exports) {';
            nodeExport += 'module.exports = ' + nsInfo.namespace + ';}';

            output.push(nodeExport);
          }

        }

        if (options.amd) {
          // Wrap the file in an AMD define fn.
          requiredModules.unshift('handlebars');
          requiredModules.unshift('require');
          var amdWrapper = [];
          amdWrapper.push("define([\""+requiredModules.join("\", \"")+"\"], function(localRequire, Handlebars) {");

          // capture template function
          amdWrapper.push("  var tmplFn = function(){"                                    );
          output = amdWrapper.concat(output);
          if (options.namespace !== false) {
            // Namespace has not been explicitly set to false; the AMD
            // wrapper will return the object containing the template.
            output.push("return "+nsInfo.namespace+";");
          }
          output.push("      }();"                                                        );

          // create new template function that invokes the captured one
          output.push("      var ret = function(){ return tmplFn.apply(this, arguments)};");

          // attach the local require object
          output.push("      ret.require = localRequire; "                                );

          output.push("      return ret;"                                                 );
          output.push("    });"                                                           );
        }

        if (options.commonjs) {
          if (options.namespace === false) {
            output.unshift('var templates = {};');
            output.push("return templates;");
          } else {
            output.push("return "+nsInfo.namespace+";");
          }
          // Export the templates object for CommonJS environments.
          output.unshift("module.exports = function(Handlebars) {");
          output.push("};");
        }

        grunt.file.write(f.dest, output.join(grunt.util.normalizelf(options.separator)));
        grunt.log.writeln('File "' + f.dest + '" created.');
      }
    });

  });

};
