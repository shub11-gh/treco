export const schemaValidator = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    let message = 'Validation failed';
    if (error.errors && error.errors.length > 0) {
      // Pick the first error message or join them
      message = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
    }
    
    return res.status(400).json({
      message,
      errors: error.format ? error.format() : error.errors
    });
  }
};
