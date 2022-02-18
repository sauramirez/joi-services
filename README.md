# joi-services

#### Service objects supported by joi validation.
Service objects is the place for all of your business logic.

## Installation
`npm install joi`

## Usage

```js
const JoiService = require('joi-service');

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
