import type { FormProps } from './Form';
import Form from './Form';
import Field from './Field';
import type { FormInstance } from './FormStore';
import { useForm } from './FormStore';
import React from 'react';

const InternalForm = React.forwardRef<FormInstance, FormProps>(Form);
type InternalFormType = typeof InternalForm;

interface RefFormType extends InternalFormType {
  Item: typeof Field;
  useForm: typeof useForm;
}

const RefForm: RefFormType = InternalForm as RefFormType;

RefForm.Item = Field;
RefForm.useForm = useForm;

export { Field as Item };

export default RefForm;