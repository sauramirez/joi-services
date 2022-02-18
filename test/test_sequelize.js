'use strict';

const Lab = require('@hapi/lab');
const Code = require('@hapi/code');
const JoiService = require('../lib/index');
const JoiErrors = require('joi/lib/errors');
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize("sqlite::memory:");


const { describe, it } = exports.lab = Lab.script();
const expect = Code.expect;


const User = sequelize.define('User', {
  name: DataTypes.TEXT
});

const Post = sequelize.define('Post', {
  title: DataTypes.TEXT
});


class TestService extends JoiService {
  static schema = JoiService.Joi.object({
    user: JoiService.Joi.sequelize().instance(User)
  })

  process() {

    return this.cleanedData.user;
  }
}


class TestNotNewService extends JoiService {
  static schema = JoiService.Joi.object({
    user: JoiService.Joi.sequelize().instance(User).isnew(false)
  })

  process() {

    return this.cleanedData.user;
  }
}


describe('JoiService', () => {
  it('should return the processed data', () => {

    const user = new User();
    const result = TestService.execute({
      user
    });
    expect(result).to.equal(user);
  })

  it('should throw a wrong model error', () => {

    const run = () => {
      TestService.execute({
        user: new Post()
      });
    }
    expect(run).to.throw(JoiErrors.ValidationError)
  })

  it('should throw a new instance validation error', () => {

    const run = () => {
      TestNotNewService.execute({
        user: new User()
      });
    }
    expect(run).to.throw(JoiErrors.ValidationError)
  })
});
