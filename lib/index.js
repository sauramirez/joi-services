'use strict';

const Joi = require('./joi');


class JoiService {

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
    return service.process();
  }

  process() {

    throw new Error('NotImplemented');
  }
}

JoiService.Joi = Joi;

module.exports = JoiService;
