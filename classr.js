'use strict';

window.classr = (function(){
  var classes, modules;
  classes = {};
  modules = {};

  function setupFn(fun, parent, fnName) {
    fun.classrName = fnName;
    if (parent) fun.superFn = parent.prototype[fnName];
    return fun;
  }

  function splitArg(arg) {
    var separators;
    arg = arg.replace(/\s/g, '');
    separators = ['extends', ':', '<'];
    return arg.split(new RegExp(separators.join('|'), 'g'));
  }

  function newClass() {
    var firstArg, tokens, name, config, constructor, parent;
    config = arguments[arguments.length - 1];
    if (arguments.length > 1) {
      firstArg = arguments[0];
      if (firstArg.constructor === Function) {
        parent = firstArg;
      } else if (firstArg.constructor === String) {
        tokens = splitArg(firstArg);
        name = tokens[0];
        parent = classes[tokens[1]];
      }
    }
    if (config.constructor) {
      constructor = config.constructor;
    } else {
      constructor = function ClassrClass(){ return true };
    }
    if (parent) {
      constructor.prototype = Object.create(parent.prototype);
      constructor.prototype.constructor = constructor;
      constructor.prototype.callSuper = function callSuper() {
        // DEPRECATED. Slow, dangerous and not working in strict mode
        return arguments.callee.caller && (arguments.callee.caller.superFn ? arguments.callee.caller.superFn.apply(this, arguments) : undefined);
      }
      constructor.prototype.superFor = function superFor() {
        var firstArg, clss, className, fnName, params;
        firstArg = arguments[0];
        if (arguments.length > 1) {
          params = arguments[arguments.length-1];
        } else {
          params = [];
        }

        if (firstArg.constructor !== String) {
          clss = firstArg;
          fnName = arguments[1];
        } else {
          firstArg = firstArg.split('.');
          className = firstArg[0];
          fnName = firstArg[1];
          clss = classes[className];
        }

        if (clss && clss.prototype[fnName] && clss.prototype[fnName].superFn) {
          return clss.prototype[fnName].superFn.apply(this, params);
        }
        return undefined;
      };
      constructor.superFn = parent.prototype.constructor;
    }

    constructor.newInstance = function newInstance() {
      // TO DO: I really hate this implementation. There has to be a better way to do it.
      var i = arguments.length, args = new Array(i + 1);
      while (i--) args[i+1] = arguments[i];
      return new (constructor.bind.apply(constructor, args))();
    };

    constructor.classrName = 'constructor';
    for (var key in config) {
      if (key !== 'constructor' && config.hasOwnProperty(key)) {
        constructor.prototype[key] = (typeof config[key] === 'function') ? setupFn(config[key], parent, key) : config[key];
      }
    }
    if (name) classes[name] = constructor;
    return constructor;
  }

  function moduleExtend(dest, source, hasParent){
    for (var key in source) {
      if (source.hasOwnProperty(key)) {
        if (typeof dest[key] === 'function') {
          source[key].genName = key;
          if (hasParent) source[key].superFn = dest[key];
        }
        dest[key] = source[key];
      }
    }
  }

  function generateModuleTree(creator, moduleArgs, parentMeta) {
    var module;
    if (!parentMeta) {
      module = {};
      moduleExtend(module, creator.apply(null, moduleArgs));
    } else {
      module = Object.create(generateModuleTree(parentMeta.creator, parentMeta.args, parentMeta.parentMeta));
      moduleExtend(module, creator.apply(null, moduleArgs), true);
    }
    return module;
  }

  function newModule() {
    var firstArg, secondArg, moduleArgs, tokens, name, creator, module, parent;
    creator = arguments[arguments.length - 1];
    if (arguments.length > 1) {
      firstArg = arguments[0];
      if (firstArg.constructor === Object) {
        parent = firstArg;
      } else if (firstArg.constructor === String) {
        tokens = splitArg(firstArg);
        name = tokens[0];
        parent = modules[tokens[1]];
      } else if (arguments.length === 2 && firstArg.constructor === Array) {
        moduleArgs = firstArg;
      }
      if (arguments.length > 2) {
        secondArg = arguments[1];
        if (secondArg.constructor === Array) {
          moduleArgs = secondArg;
        }
      }
    }
    if (!parent) {
      module = generateModuleTree(creator, moduleArgs)
    } else if (parent.__classr__) {
      module = generateModuleTree(creator, moduleArgs, parent.__classr__);
      module.callSuper = function callSuper() {
        // DEPRECATED. Slow, dangerous and not working in strict mode
        return arguments.callee.caller.superFn ? arguments.callee.caller.superFn.apply(this, arguments) : undefined;
      };
      module.superFor = function superFor() {
        var firstArg, module, moduleName, fnName, params;
        firstArg = arguments[0];
        if (arguments.length > 1) {
          params = arguments[arguments.length-1];
        } else {
          params = [];
        }

        if (firstArg.constructor !== String) {
          module = firstArg;
          fnName = arguments[1];
        } else {
          firstArg = firstArg.split('.');
          moduleName = firstArg[0];
          fnName = firstArg[1];
          module = modules[moduleName];
        }

        if (module && module[fnName] && module[fnName].superFn) {
          return module[fnName].superFn.apply(this, params);
        }
        return undefined;
      };
    }
    module.__classr__ = {
      creator: creator,
      args: moduleArgs,
      parentMeta: parent ? parent.__classr__ : undefined
    };
    if (name) modules[name] = module;
    return module;
  }

  function classr() {
    var lastArg;
    if (arguments.length) {
      lastArg = arguments[arguments.length - 1];
      if (lastArg.constructor === String) {
        if (arguments.length === 1) {
          if (classes[lastArg]) return classes[lastArg];
          if (modules[lastArg]) return modules[lastArg];
        }
      } else if (lastArg.constructor === Function) {
        return newModule.apply(this, arguments);
      } else if (typeof lastArg === 'object') {
        return newClass.apply(this, arguments);
      }
    }
    return undefined;
  }

  return classr;
})();



