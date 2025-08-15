import * as yup from 'yup';

export const loginSchema = yup.object().shape({
  username: yup.string().required('Username is required'),
  password: yup.string().required('Password is required'),
});

export const registerSchema = yup.object().shape({
  username: yup.string().required('Username is required'),
  password: yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
    )
    .required('Password is required'),
});

export type LoginInput = yup.InferType<typeof loginSchema>;
export type RegisterInput = yup.InferType<typeof registerSchema>;