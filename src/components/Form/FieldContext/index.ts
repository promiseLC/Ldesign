import * as React from 'react';
import type { FormInstance, FormStore } from '../FormStore';

export type FieldContextValues = FormInstance;

// @ts-ignore
const Context = React.createContext<FieldContextValues>({});

Context.displayName = 'FieldContext';

export default Context;