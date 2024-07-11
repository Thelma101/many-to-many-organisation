// const saltRounds = new Number(process.env.SALT_ROUNDS);

const validateUserFields = (req, res, next) => {
    const { firstName, lastName, email, password } = req.body;
    const errors = [];
  
    if (!firstName) {
      errors.push({ field: 'firstName', message: 'First name is required' });
    }
    if (!lastName) {
      errors.push({ field: 'lastName', message: 'Last name is required' });
    }
    if (!email) {
      errors.push({ field: 'email', message: 'Email is required' });
    }
    if (!password) {
      errors.push({ field: 'password', message: 'Password is required' });
    }
  
    if (errors.length > 0) {
      return res.status(422).json({ errors });
    }
  
    next();
  };
  
  const validateLoginFields = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];
  
    if (!email) {
      errors.push({ field: 'email', message: 'Email is required' });
    }
    if (!password) {
      errors.push({ field: 'password', message: 'Password is required' });
    }
  
    if (errors.length > 0) {
      return res.status(422).json({ errors });
    }
  
    next();
  };
  
  module.exports = {
    validateUserFields,
    validateLoginFields,
  };