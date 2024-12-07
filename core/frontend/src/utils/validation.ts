// core/frontend/src/utils/validation.ts

import * as yup from 'yup';

export const validators = {
  email: yup
    .string()
    .email('Invalid email address')
    .required('Email is required'),

  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain uppercase, lowercase, number and special character'
    )
    .required('Password is required'),

  name: yup
    .string()
    .min(2, 'Must be at least 2 characters')
    .max(50, 'Must be less than 50 characters')
    .required('Name is required'),

  phone: yup
    .string()
    .matches(
      /^\+?[1-9]\d{1,14}$/,
      'Phone number must be in international format'
    ),

  url: yup
    .string()
    .url('Must be a valid URL'),

  date: yup
    .date()
    .min(new Date(1900, 0, 1), 'Date is too early')
    .max(new Date(), 'Date cannot be in the future'),
};

export const schemas = {
  login: yup.object().shape({
    email: validators.email,
    password: validators.password,
  }),

  register: yup.object().shape({
    firstName: validators.name,
    lastName: validators.name,
    email: validators.email,
    password: validators.password,
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password')], 'Passwords must match')
      .required('Confirm password is required'),
  }),

  organization: yup.object().shape({
    name: validators.name,
    email: validators.email,
    phone: validators.phone,
    website: validators.url,
  }),

  profile: yup.object().shape({
    firstName: validators.name,
    lastName: validators.name,
    email: validators.email,
    phone: validators.phone,
  }),
};

export const validateForm = async (
  schema: yup.ObjectSchema<any>,
  data: any
): Promise<{ isValid: boolean; errors: Record<string, string> }> => {
  try {
    await schema.validate(data, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      const errors: Record<string, string> = {};
      error.inner.forEach((err) => {
        if (err.path) {
          errors[err.path] = err.message;
        }
      });
      return { isValid: false, errors };
    }
    throw error;
  }
};
