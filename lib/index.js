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
  static async #executeAsync(service, data = {}) {

    let options = {};
    if (service.constructor.schema) {
      const result = Joi.attempt(data, service.constructor.schema, 'Service validation error', {
        convert: true,
        stripUnknown: true
      });

      service.cleanedData = result;
    }
    const preProcessOpts = await internals.callFn(service.preProcess);
    options = { ...options, ...preProcessOpts };

    try {
      options.result = await internals.callFn(service.process.bind(service, options));
    }
    catch (error) {
      options.err = error;
    }
    finally {
      await internals.callFn(service.postProcess.bind(service, options));
    }

    if (options.err) {
      throw options.err;
    }

    return options.result;
  }

  /**
   * @param {Object} data - The data to be used
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
    if ([service.preProcess, service.process, service.postProcess].reduce((prev, currentVal) => {

      return prev || Util.types.isAsyncFunction(currentVal);
    }, false)) {
      return JoiService.#executeAsync(service, data);
    }

    options = service.preProcess();
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

  preProcess() {}
  postProcess() {}

  /**
   * @param {object} options
  */
  process(options = {}) {

    throw new Error('NotImplemented');
  }
}

JoiService.Joi = Joi;

module.exports = JoiService;
