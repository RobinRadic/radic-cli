// Dependencies
var Yaml = null,    // External libraries are lazy-loaded
    VisionmediaYaml = null,  // only if these file types exist.
    Coffee = null,
    CSON = null,
    PPARSER = null,
    Utils = require('util'),
    FileSystem = require('fs');

// Static members
var DEFAULT_CLONE_DEPTH = 20,
    NODE_CONFIG, CONFIG_DIR, RUNTIME_JSON_FILENAME, NODE_ENV, APP_INSTANCE,
    HOST, HOSTNAME, ALLOW_CONFIG_MUTATIONS,
    env = {},
    privateUtil = {},
    deprecationWarnings = {},
    configSources = [],          // Configuration sources - array of {name, original, parsed}
    checkMutability = true;      // Check for mutability/immutability on first get


var objects = module.exports;

/**
 * <p>Monitor a javascript property for runtime changes.</p>
 *
 * <p>
 * This method was built for an earlier version of node-config that allowed
 * configuration value mutations.  Since version 1.0.0, node-config no longer
 * allows configuration mutations, and is no longer used in node-config.
 * </p>
 *
 * <p>
 * It is deprecated, and will be removed in the next semver incompatible release 2.0.0.
 * </p>
 *
 * @method watch
 * @deprecated
 * @param object {object} - The object to watch.
 * @param property {string} - The property name to watch.  Watch all object properties if null.
 * @param handler {function(object, propertyName, priorValue, newValue)} - Handler called when a property change is detected.
 *   The handler is run along with other handlers registered for notification.
 *   If your handler changes the value of the property, that change is applied after all handlers have finished processing the current change.
 *   Then all handlers (including this one) will be called again with the newly changed value.
 * @param depth {integer} (optional) - If watching all object properties or if the specified property is an object, this specifies the depth of the object graph to watch for changes.  Default 6.
 * @return object {object} - The original object is returned - for chaining.
 */
objects.watch = function (object, property, handler, depth)
{

    // Initialize
    var t = this, o = object;
    var allProperties = property ? [property] : Object.keys(o);

    // Deprecation warning
    if (!deprecationWarnings.watch)
    {
        console.error('WARNING: config.' + fnName + '() is deprecated, and will not be supported in release 2.0.');
        console.error('WARNING: See https://github.com/lorenwest/node-config/wiki/Future-Compatibility#upcoming-incompatibilities');
        deprecationWarnings.watch = true;
    }

    // Depth detection
    depth = (depth === null ? DEFAULT_CLONE_DEPTH : depth);
    if (depth < 0)
    {
        return;
    }

    // Create hidden properties on the object
    if (!o.__watchers)
    {
        objects.makeHidden(o, '__watchers', {});
    }
    if (!o.__propertyValues)
    {
        objects.makeHidden(o, '__propertyValues', {});
    }

    // Attach watchers to all requested properties
    allProperties.forEach(function (prop)
    {

        // Setup the property for watching (first time only)
        if (typeof(o.__propertyValues[prop]) == 'undefined')
        {

            // Don't error re-defining the property if immutable
            var descriptor = Object.getOwnPropertyDescriptor(o, prop);
            if (descriptor && descriptor.writable === false)
            {
                return;
            }

            // Copy the value to the hidden field, and add the property to watchers
            o.__propertyValues[prop] = [o[prop]];
            o.__watchers[prop] = [];

            // Attach the property watcher
            Object.defineProperty(o, prop, {
                enumerable: true,

                get: function ()
                {
                    // If more than 1 item is in the values array,
                    // then we're currently processing watchers.
                    if (o.__propertyValues[prop].length == 1)
                    // Current value
                    {
                        return o.__propertyValues[prop][0];
                    } else
                    // [0] is prior value, [1] is new value being processed
                    {
                        return o.__propertyValues[prop][1];
                    }
                },

                set: function (newValue)
                {

                    // Return early if no change
                    var origValue = o[prop];
                    if (objects.equalsDeep(origValue, newValue))
                    {
                        return;
                    }

                    // Remember the new value, and return if we're in another setter
                    o.__propertyValues[prop].push(newValue);
                    if (o.__propertyValues[prop].length > 2)
                    {
                        return;
                    }

                    // Call all watchers for each change requested
                    var numIterations = 0;
                    while (o.__propertyValues[prop].length > 1)
                    {

                        // Detect recursion
                        if (++numIterations > 20)
                        {
                            o.__propertyValues[prop] = [origValue];
                            throw new Error('Recursion detected while setting [' + prop + ']');
                        }

                        // Call each watcher for the current values
                        var oldValue = o.__propertyValues[prop][0];
                        newValue = o.__propertyValues[prop][1];
                        o.__watchers[prop].forEach(function (watcher)
                        {
                            try
                            {
                                watcher(o, prop, oldValue, newValue);
                            } catch (e)
                            {
                                // Log an error and continue with subsequent watchers
                                console.error("Exception in object watcher for " + prop, e);
                            }
                        });

                        // Done processing this value
                        o.__propertyValues[prop].splice(0, 1);
                    }
                }
            });

        } // Done setting up the property for watching (first time)

        // Add the watcher to the property
        o.__watchers[prop].push(handler);

        // Recurs if this is an object...
        if (o[prop] && typeof(o[prop]) == 'object')
        {
            objects.watch(o[prop], null, handler, depth - 1);
        }

    }); // Done processing each property

    // Return the original object - for chaining
    return o;
};

/**
 * Attach the Config class prototype to all config objects recursively.
 *
 * <p>
 * This allows you to do anything with CONFIG sub-objects as you can do with
 * the top-level CONFIG object.  It's so you can do this:
 * </p>
 *
 * <pre>
 *   var CUST_CONFIG = require('config').Customer;
 *   CUST_CONFIG.get(...)
 * </pre>
 *
 * @protected
 * @method attachProtoDeep
 * @param toObject
 * @param depth
 * @return toObject
 */
objects.attachProtoDeep = function (toObject, depth)
{

    // Recursion detection
    var t = this;
    depth = (depth === null ? DEFAULT_CLONE_DEPTH : depth);
    if (depth < 0)
    {
        return toObject;
    }

    // Adding Config.prototype methods directly to toObject as hidden properties
    // because adding to toObject.__proto__ exposes the function in toObject
    for (var fnName in Config.prototype)
    {
        if (!toObject[fnName])
        {
            objects.makeHidden(toObject, fnName, Config.prototype[fnName]);
        }
    }

    // Add prototypes to sub-objects
    for (var prop in toObject)
    {
        if (objects.isObject(toObject[prop]))
        {
            objects.attachProtoDeep(toObject[prop], depth - 1);
        }
    }

    // Return the original object
    return toObject;
};

/**
 * Return a deep copy of the specified object.
 *
 * This returns a new object with all elements copied from the specified
 * object.  Deep copies are made of objects and arrays so you can do anything
 * with the returned object without affecting the input object.
 *
 * @protected
 * @method cloneDeep
 * @param parent {object} The original object to copy from
 * @param [depth=20] {Integer} Maximum depth (default 20)
 * @return {object} A new object with the elements copied from the copyFrom object
 *
 * This method is copied from https://github.com/pvorb/node-clone/blob/17eea36140d61d97a9954c53417d0e04a00525d9/clone.js
 *
 * Copyright © 2011-2014 Paul Vorbach and contributors.
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the “Software”), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions: The above copyright notice and this permission
 * notice shall be included in all copies or substantial portions of the Software.
 */
objects.cloneDeep = function cloneDeep(parent, depth, circular, prototype)
{
    // maintain two arrays for circular references, where corresponding parents
    // and children have the same index
    var allParents = [];
    var allChildren = [];

    var useBuffer = typeof Buffer != 'undefined';

    if (typeof circular == 'undefined')
    {
        circular = true;
    }

    if (typeof depth == 'undefined')
    {
        depth = 20;
    }

    // recurse this function so we don't reset allParents and allChildren
    function _clone(parent, depth)
    {
        // cloning null always returns null
        if (parent === null)
        {
            return null;
        }

        if (depth == 0)
        {
            return parent;
        }

        var child;
        if (typeof parent != 'object')
        {
            return parent;
        }

        if (Utils.isArray(parent))
        {
            child = [];
        } else if (Utils.isRegExp(parent))
        {
            child = new RegExp(parent.source, objects.getRegExpFlags(parent));
            if (parent.lastIndex) child.lastIndex = parent.lastIndex;
        } else if (Utils.isDate(parent))
        {
            child = new Date(parent.getTime());
        } else if (useBuffer && Buffer.isBuffer(parent))
        {
            child = new Buffer(parent.length);
            parent.copy(child);
            return child;
        } else
        {
            if (typeof prototype == 'undefined')
            {
                child = Object.create(Object.getPrototypeOf(parent));
            } else
            {
                child = Object.create(prototype);
            }
        }

        if (circular)
        {
            var index = allParents.indexOf(parent);

            if (index != -1)
            {
                return allChildren[index];
            }
            allParents.push(parent);
            allChildren.push(child);
        }

        for (var i in parent)
        {
            child[i] = _clone(parent[i], depth - 1);
        }

        return child;
    }

    return _clone(parent, depth);
};

/**
 * Set objects given a path as a string list
 *
 * @protected
 * @method setPath
 * @param object {object} - Object to set the property on
 * @param path {array[string]} - Array path to the property
 * @param value {mixed} - value to set, ignoring null
 */
objects.setPath = function (object, path, value)
{
    var nextKey = null;
    if (value === null || path.length === 0)
    {
        return;
    }
    else if (path.length === 1)
    { // no more keys to make, so set the value
        object[path.shift()] = value;
    }
    else
    {
        nextKey = path.shift();
        if (!object.hasOwnProperty(nextKey))
        {
            object[nextKey] = {};
        }
        objects.setPath(object[nextKey], path, value);
    }
};

/**
 * Create a new object patterned after substitutionMap, where:
 * 1. Terminal string values in substitutionMap are used as keys
 * 2. To look up values in a key-value store, variables
 * 3. And parent keys are created as necessary to retain the structure of substitutionMap.
 *
 * @protected
 * @method substituteDeep
 * @param substitionMap {object} - an object whose terminal (non-subobject) values are strings
 * @param variables {object[string:value]} - usually process.env, a flat object used to transform
 *      terminal values in a copy of substititionMap.
 * @returns {object} - deep copy of substitutionMap with only those paths whose terminal values
 *      corresponded to a key in `variables`
 */
objects.substituteDeep = function (substitutionMap, variables)
{
    var result = {};

    function _substituteVars(map, vars, pathTo)
    {
        for (var prop in map)
        {
            var value = map[prop];
            if (typeof(value) === 'string')
            { // We found a leaf variable name
                if (vars[value])
                { // if the vars provide a value set the value in the result map
                    objects.setPath(result, pathTo.concat(prop), vars[value]);
                }
            }
            else if (objects.isObject(value))
            { // work on the subtree, giving it a clone of the pathTo
                _substituteVars(value, vars, pathTo.concat(prop));
            }
            else
            {
                msg = "Illegal key type for substitution map at " + pathTo.join('.') + ': ' + typeof(value);
                throw Error(msg);
            }
        }
    }

    _substituteVars(substitutionMap, variables, []);
    return result;

};

/**
 * Return true if two objects have equal contents.
 *
 * @protected
 * @method equalsDeep
 * @param object1 {object} The object to compare from
 * @param object2 {object} The object to compare with
 * @param depth {integer} An optional depth to prevent recursion.  Default: 20.
 * @return {boolean} True if both objects have equivalent contents
 */
objects.equalsDeep = function (object1, object2, depth)
{

    // Recursion detection
    var t = this;
    depth = (depth === null ? DEFAULT_CLONE_DEPTH : depth);
    if (depth < 0)
    {
        return {};
    }

    // Fast comparisons
    if (!object1 || !object2)
    {
        return false;
    }
    if (object1 === object2)
    {
        return true;
    }
    if (typeof(object1) != 'object' || typeof(object2) != 'object')
    {
        return false;
    }

    // They must have the same keys.  If their length isn't the same
    // then they're not equal.  If the keys aren't the same, the value
    // comparisons will fail.
    if (Object.keys(object1).length != Object.keys(object2).length)
    {
        return false;
    }

    // Compare the values
    for (var prop in object1)
    {

        // Call recursively if an object or array
        if (object1[prop] && typeof(object1[prop]) === 'object')
        {
            if (!objects.equalsDeep(object1[prop], object2[prop], depth - 1))
            {
                return false;
            }
        }
        else
        {
            if (object1[prop] !== object2[prop])
            {
                return false;
            }
        }
    }

    // Test passed.
    return true;
};

/**
 * Returns an object containing all elements that differ between two objects.
 * <p>
 * This method was designed to be used to create the runtime.json file
 * contents, but can be used to get the diffs between any two Javascript objects.
 * </p>
 * <p>
 * It works best when object2 originated by deep copying object1, then
 * changes were made to object2, and you want an object that would give you
 * the changes made to object1 which resulted in object2.
 * </p>
 *
 * @protected
 * @method diffDeep
 * @param object1 {object} The base object to compare to
 * @param object2 {object} The object to compare with
 * @param depth {integer} An optional depth to prevent recursion.  Default: 20.
 * @return {object} A differential object, which if extended onto object1 would
 *                  result in object2.
 */
objects.diffDeep = function (object1, object2, depth)
{

    // Recursion detection
    var t = this, diff = {};
    depth = (depth === null ? DEFAULT_CLONE_DEPTH : depth);
    if (depth < 0)
    {
        return {};
    }

    // Process each element from object2, adding any element that's different
    // from object 1.
    for (var parm in object2)
    {
        var value1 = object1[parm];
        var value2 = object2[parm];
        if (value1 && value2 && objects.isObject(value2))
        {
            if (!(objects.equalsDeep(value1, value2)))
            {
                diff[parm] = objects.diffDeep(value1, value2, depth - 1);
            }
        }
        else if (Array.isArray(value1) && Array.isArray(value2))
        {
            if (!objects.equalsDeep(value1, value2))
            {
                diff[parm] = value2;
            }
        }
        else if (value1 !== value2)
        {
            diff[parm] = value2;
        }
    }

    // Return the diff object
    return diff;

};

/**
 * Extend an object, and any object it contains.
 *
 * This does not replace deep objects, but dives into them
 * replacing individual elements instead.
 *
 * @protected
 * @method extendDeep
 * @param mergeInto {object} The object to merge into
 * @param mergeFrom... {object...} - Any number of objects to merge from
 * @param depth {integer} An optional depth to prevent recursion.  Default: 20.
 * @return {object} The altered mergeInto object is returned
 */
objects.extendDeep = function (mergeInto)
{

    // Initialize
    var t = this;
    var vargs = Array.prototype.slice.call(arguments, 1);
    var depth = vargs.pop();
    if (typeof(depth) != 'number')
    {
        vargs.push(depth);
        depth = DEFAULT_CLONE_DEPTH;
    }

    // Recursion detection
    if (depth < 0)
    {
        return mergeInto;
    }

    // Cycle through each object to extend
    vargs.forEach(function (mergeFrom)
    {

        // Cycle through each element of the object to merge from
        for (var prop in mergeFrom)
        {

            // Extend recursively if both elements are objects
            if (objects.isObject(mergeInto[prop]) && objects.isObject(mergeFrom[prop]))
            {
                objects.extendDeep(mergeInto[prop], mergeFrom[prop], depth - 1);
            }

            // Copy recursively if the mergeFrom element is an object (or array or fn)
            else if (mergeFrom[prop] && typeof mergeFrom[prop] == 'object')
            {
                mergeInto[prop] = objects.cloneDeep(mergeFrom[prop], depth - 1);
            }

            // Simple assignment otherwise
            else
            {
                mergeInto[prop] = mergeFrom[prop];
            }
        }
    });

    // Chain
    return mergeInto;

};

