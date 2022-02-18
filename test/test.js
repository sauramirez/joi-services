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

  process() {

    return 1;
  }
}

class TestNotImpementedService extends JoiService {}

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
});
