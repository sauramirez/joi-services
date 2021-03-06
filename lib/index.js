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
    const preProcessOpts = await internals.callFn(service.preProcess);
    options = { ...options, ...preProcessOpts }
    let err;
    let result;
    try {
      result = await internals.callFn(service.process.bind(service, options));
    } catch (error) {
      err = error;
      options.err = err;
    } finally {
      await internals.callFn(service.postProcess.bind(service, options));
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
    if ([this.preProcess, this.process, this.postProcess].reduce((prev, currentVal) => {
      return prev || Util.types.isAsyncFunction(currentVal)
    }, false)) {
      return this.#executeAsync(service)
    } else {
      let options = service.preProcess();
      let result;
      let err;
      try {
        result = service.process(options);
      }
      catch (error) {
        err = error;
      }
      finally {
        service.postProcess(options);
      }

      // rethrow error for the user to handle
      if (err) {
        throw err;
      }
      return result;
    }
  }

  preProcess() {}
  postProcess() {}

  process(options = {}) {

    throw new Error('NotImplemented');
  }
}

JoiService.Joi = Joi;

module.exports = JoiService;
