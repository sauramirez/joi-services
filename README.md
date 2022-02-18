# joi-services

#### Service objects supported by joi validation.
Service objects is the place for all of your business logic.

## Installation
`npm install joi`

## Usage

```js
const JoiService = require('joi-services');

class InviteUserService extends JoiService {
  // data required to run the process function
  static schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
  })

  // encapsulate business rules in the process function
  async process() {

    // create user with the isActive flag set as false
    const user = await User.create({
      email: this.cleanedData.email,
      name: this.cleanedData.name,
      isActive: false
    })

    // send email
    await Mailer.send(user.email)
  }
}

await InviteUser.execute({
  name: 'Ken Masters',
  email: 'ken@sf.ko'
})
```

### Validation
The InviteUserService will throw a validation error if the `.execute` function
is missing one of the required variables when invoked.

## Validating Sequelize instances with joi extensions
JoiService provides an extended version of joi support for validating a
sequelize instance. You just have to use the Joi module provided by
JoiService using `JoiService.Joi`

```
const JoiService = require('joi-services');

class AcceptInviteService extends JoiService {
  // data required to run the process function
  static schema = JoiService.Joi.object({
    user: Joi.sequelize().instance(User).required(),
  })

  // encapsulate business rules in the process function
  async process() {

    // create user with the isActive flag set as false
    this.cleanedData.user.isActive = true
  }
}

const user = await User.findOne({ where: { email: 'ken@sf.ko' } })
await AcceptInviteService.execute({
  user
})
```

### `JoiService.Joi.sequelize`
Generates a sequelize schema object.

### `JoiService.Joi.sequelize.instance`
The sequelize class you'll be validating it's an instance of

### `JoiService.Joi.sequelize.isnew`
You can test whether you accept new instances or not.

```
// we only accept users already in the database
JoiService.Joi.sequelize().instance(User).isnew(false)
```
