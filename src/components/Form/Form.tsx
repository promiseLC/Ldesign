import React, { useMemo, useRef } from 'react';
import FieldContext from './FieldContext';
import { FormStore,useForm } from './FormStore';
import type { Store, Callbacks } from './typings';
import { FormInstance } from './FormStore';


type BaseFormProps = Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit'>;

export interface FormProps<Values = any> extends BaseFormProps {
  initialValues?: Store;
  children?: React.ReactNode;
  // 在FormProps上添加onFinish类型的定义
  onFinish?: Callbacks<Values>['onFinish'];
  onValuesChange?: Callbacks<Values>['onValuesChange'];
  form?: FormInstance;
}

const Form: React.ForwardRefRenderFunction<FormInstance,FormProps> = ({ form,initialValues, children ,onFinish,onReset,onValuesChange},ref) => {

    // 不再用new FormStore()创建formStore，而是用useForm获取
  const [formInstance] = useForm(form);

  React.useImperativeHandle(ref, () => formInstance);

  const { setCallbacks, setInitialValues } = formInstance.getInternalHooks();


  setCallbacks(
    {
      onFinish: (value:Store) => {
        if (onFinish) {
          onFinish(value);
        }
      },
      onValuesChange,
    }
  )


  // 通过mountRef判断首次

  const mountRef = useRef(false);

  // setInitialValues 把initialValues给formStore,用来reset时重新赋值使用
  // 第二个参数为true时，调用setInitialValues更新formStore内部的initialValues同时也会更新store.
  // store就是上面所说的存放“数据状态”的对象变量

  if (initialValues) {
   setInitialValues(initialValues, !mountRef.current);
  }

  if (!mountRef.current) {
    mountRef.current = true;
  }
    

  // 通过useMemo把formStore.current传递给FieldContext.Provider的value
  // 让子组件可以通过useContext(FieldContext)获取到formStore
  const fieldContextValue = useMemo(() => { 

    return {
      ...formInstance
    }

  }, [formInstance])

  console.log(fieldContextValue);
  
  const wrapperNode = <FieldContext.Provider value={fieldContextValue}>{children}</FieldContext.Provider>;

  return <form
    onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    // 调用提交方法
    formInstance.submit();
    
  }} onReset={(event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    formInstance.resetFields();
      // 调用重置方法
      onReset?.(event);

  }}  >{wrapperNode}</form>

};

export default Form;
