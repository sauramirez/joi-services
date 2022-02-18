'use strict';

const Joi = require('./joi');
const Util = require('util');

const internals = {};

/**
 * Helper function for calling async
*/
internals.callFn = async function (fn) {

  let result = null;
  if (Util.types.isAsyncFunction(fn)) {
    result = await fn();
  }
  else {

    result = fn();
  }

  return result;
};


class JoiService {

  // if any of the hooks are async
  static async #executeAsync(service) {
    let options = {}
    const preHookOpts = await internals.callFn(service.preHook);
    options = { ...options, ...preHookOpts }
    let err;
    let result;
    try {
      result = await internals.callFn(service.process.bind(service, options));
    } catch (error) {
      err = error;
      options.err = err;
    } finally {
      await internals.callFn(service.postHook.bind(service, options));
    }

    if (err) {
      throw err;
    }
    return result;
  }

  /**
   * @throws Joi.ValidationError
  */
  static execute(data = {}) {

    const service = new this();
    if (service.constructor.schema) {
      const result = Joi.attempt(data, this.schema, 'Service validation error', {
        convert: true,
        stripUnknown: true
      });

      service.cleanedData = result;
    }

    service.data = data;
    let options = {};
    if ([this.preHook, this.process, this.postHook].reduce((prev, currentVal) => {
      return prev || Util.types.isAsyncFunction(currentVal)
    }, false)) {
      return this.#executeAsync(service)
    } else {
      let options = service.preHook();
      let result;
      let err;
      try {
        result = service.process(options);
      }
      catch (error) {
        err = error;
      }
      finally {
        service.postHook(options);
      }

      // rethrow error for the user to handle
      if (err) {
        throw err;
      }
      return result;
    }
  }

  preHook() {}
  postHook() {}

  process(options = {}) {

    throw new Error('NotImplemented');
  }
}

JoiService.Joi = Joi;

module.exports = JoiService;
