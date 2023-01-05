'use strict';

const Lab = require('@hapi/lab');
const Code = require('@hapi/code');
const JoiService = require('../lib/index');
const Joi = require('../lib/joi');
const JoiErrors = require('joi/lib/errors');


const { describe, it } = exports.lab = Lab.script();
const expect = Code.expect;


class TestService extends JoiService {
  static schema = Joi.object({})

  process() {

    return 1;
  }
}

class TestSchemalessService extends JoiService {
  process() {

    return 1;
  }
}

class TestSchemaValidationService extends JoiService {
  static schema = Joi.object({
    val: Joi.number().integer().positive().required()
  })

  /**
   * @typedef {Object} ValidationType
   * @property {number} val
  */

  /**
   * @param {ValidationType} data
  */
  process(data) {

    return 1;
  }
}

class TestNotImpementedService extends JoiService {}

class TestPrehook extends JoiService {
  preProcess() {
    return { transaction: true };
  }

  process(options) {
    return options
  }
}

class TestAsyncProcess extends JoiService {
  preProcess() {
    return { transaction: true };
  }

  async process(options) {
    return options
  }
}

class TestAsyncService extends JoiService {
  async preProcess() {
    return { transaction: true };
  }

  async process(options) {
    return options
  }

  async postProcess(options) {}
}


describe('JoiService', () => {
  it('should return the processed data', () => {

    const result = TestService.execute();
    expect(result).to.equal(1);
  })

  it('should return the processed data without schema', () => {

    const result = TestSchemalessService.execute();
    expect(result).to.equal(1);
  })

  it('should throw a validation error', () => {

    const run = () => {
      TestSchemaValidationService.execute();
    }
    expect(run).to.throw(JoiErrors.ValidationError)
  })

  it('should throw a not implemented error', () => {

    const run = () => {
      TestNotImpementedService.execute();
    }
    expect(run).to.throw()
  })

  it('should return preProcess options', () => {

    const result = TestPrehook.execute();
    expect(result.transaction).to.equal(true);
  })

  it('should return the preProcess options in an async process', async () => {

    const result = await TestPrehook.execute();
    expect(result.transaction).to.equal(true);
  })

  it('should return the preProcess options in an async service', async () => {

    const result = await TestAsyncService.execute();
    expect(result.transaction).to.equal(true);
  })
});
