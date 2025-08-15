import { AnySchema } from 'yup';
import { ValidationError } from 'yup';
import ApiError from '@/lib/errors/APiError';

export const validateRequest = async (schema: AnySchema, data: any) => {
  try {
    return await schema.validate(data, { abortEarly: false });
  } catch (error) {
    if (error instanceof ValidationError) {
      throw new ApiError(400, error.errors.join(', '));
    }
    throw error;
  }
};