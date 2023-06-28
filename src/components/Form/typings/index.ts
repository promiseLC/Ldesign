import { FieldProps } from '../Field';
export type Store = Record<string, any>;

interface ValueUpdateInfo {
  type: 'valueUpdate';
  source: 'internal' | 'external';
}

interface ResetInfo {
  type: 'reset';
}

export type NotifyInfo = ValueUpdateInfo | ResetInfo;

export type ValuedNotifyInfo = NotifyInfo & {
  store: Store;
};
export interface FieldEntity {
  onStoreChange: (store: Store, name: string[] | undefined, info: ValuedNotifyInfo) => void;
  props: FieldProps;
}

export interface Callbacks<Values = any> {
  onValuesChange?: (changedValues: any, values: Values) => void;
  onFinish?: (values: Values) => void;
}

export interface Callbacks<Values = any> {
  onValuesChange?: (changedValues: any, values: Values) => void;
  onFinish?: (values: Values) => void;
}
