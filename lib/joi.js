'use strict';


const Joi = require('joi');

module.exports = Joi.extend((joi) => {

  return {
    type: 'sequelize',
    base: Joi.any(),
    messages: {
      'seqclass': 'Not a valid instance of seqclass',
      'seqclass.isnew': 'Sequelize instance must not be new',
      'seqclass.isnotnew': 'Sequelize instance must be new'
    },
    coerce(value, helpers) {

      return { value };
    },
    validate(value, helpers) {

      if (value.dataValues) {
        return { value };
      }

      return { errors: helpers.errors('seqclass') };
    },
    rules: {
      instance: {
        method(seqclass) {

          return this.$_addRule({ name: 'instance', args: { seqclass } });
        },
        args: [
          {
            name: 'seqclass',
            ref: true,
            assert: (value) => value,
            message: 'Must be a sequelize class'
          }
        ],
        validate(value, helpers, args, options) {

          if (value && value.constructor === args.seqclass) {
            return value;
          }

          return helpers.error('seqclass');
        }
      },
      isnew: {
        method(isNew = true) {

          return this.$_addRule({ name: 'isnew', args: { isNew } });
        },
        args: [
          {
            name: 'isNew',
            ref: true,
            message: 'Must be a boolean'
          }
        ],
        validate(value, helpers, args, options) {

          if (args.isNew === false && value.isNewRecord) {
            return helpers.error('seqclass.isnew');
          }
          else if (args.isNew === true && value.isNewRecord === false) {
            return helpers.error('seqclass.isnotnew');
          }

          return value;
        }
      }
    }
  };
});
