
import type { FieldEntity, NotifyInfo, Store, ValuedNotifyInfo,Callbacks } from '../typings';

import React from 'react';

export interface FormInstance {
  getFieldValue: typeof FormStore.prototype.getFieldValue;
  getFieldsValue: typeof FormStore.prototype.getFieldsValue;
  setFieldsValue: typeof FormStore.prototype.setFieldsValue;
  submit: typeof FormStore.prototype.submit;
  resetFields: typeof FormStore.prototype.resetFields;
  getInternalHooks: typeof FormStore.prototype.getInternalHooks;
}


export interface InternalHooks {
  updateValue: typeof FormStore.prototype.updateValue;
  initEntityValue: typeof FormStore.prototype.initEntityValue;
  registerField: typeof FormStore.prototype.registerField;
  setInitialValues: typeof FormStore.prototype.setInitialValues;
  setCallbacks: typeof FormStore.prototype.setCallbacks;
}




export class FormStore{

  // 保存数据状态变量
  private store: Store = {};

  // 保存Form表单中Form.Item的实例
  private fieldEntities: FieldEntity[] = [];

  // 保存初始值，该初始值会受Form.props.initalValues和Form.Item.props.initalValues影响
  private initialValues: Store = {};

  private callbacks: Callbacks = {};

   // getForm中返回的对象就是**表单实例**
  // **表单实例**里的方法指向formStore自身的方法
  // 由于目前FormStore里所有的方法都是以箭头函数的形式编写，因此this都是指向作用域的this，也就是formStore自身
  public getForm = (): FormInstance => ({
    getFieldValue: this.getFieldValue,
    getFieldsValue: this.getFieldsValue,
    setFieldsValue: this.setFieldsValue,
    submit: this.submit,
    resetFields: this.resetFields,
    // getInternalHooks是用于暴露formStore更底层的方法
    getInternalHooks: this.getInternalHooks,
  });


  public getInternalHooks = (): InternalHooks => {
    return {
      updateValue: this.updateValue,
      initEntityValue: this.initEntityValue,
      registerField: this.registerField,
      setInitialValues: this.setInitialValues,
      setCallbacks: this.setCallbacks,
    };
  };

  public setFieldsValue = (store: Store) => {
    const prevStore = this.store;

    if (store) {
      this.store = { ...this.store, ...store };
    }

    // 这个只是通知
    this.notifyObservers(prevStore, undefined, {
      type: 'valueUpdate',
      source: 'external',
    });
  };



  public setCallbacks = (callbacks: Callbacks) => {
    this.callbacks = callbacks;
  };

  // 提交方法
  public submit = () => {
    const { onFinish } = this.callbacks;
    if (onFinish) {
      onFinish(this.getFieldsValue());
    }
  };

  // 重置方法
  public resetFields = (nameList?:string[]) => { 
    const prevStore = this.store;
    if (!nameList) {
      this.store = { ...this.initialValues }
       // resetWithFieldInitialValue是用于根据Form.Item上的initialValue调整store
      // 其逻辑是：遍历fieldEntities，如果实例上有定义initialValue和name，
      // 且this.initialValue[name]为undefined，则把实例上定义的initialValue赋值到store上
        this.resetWithFieldInitialValue();

       // 调用notifyObservers以遍历调用实例的更新方法
       this.notifyObservers(prevStore, undefined, { type: 'reset' });
      

      return;
    }  
      

    nameList.forEach((name) => {
      this.store[name] = this.initialValues[name];
    })

    this.resetWithFieldInitialValue({ nameList });

    // 调用notifyObservers以遍历调用实例的更新方法
    this.notifyObservers(prevStore, undefined, { type: 'reset' });

  }


  private resetWithFieldInitialValue = (info: {
    entities?: FieldEntity[];
    nameList?: string[];
  }={}) => {
    const cache: Record<string, FieldEntity> = {};

    
    // 遍历fieldEntities，把实例上有定义initialValue和name的实例放到cache中
    this.getFieldEntities().forEach((entity) => {
      const { name, initialValue } = entity.props;
      if (initialValue !== undefined) {
        cache[name!] = entity;
      }
    })


    let requiredFieldEntities: FieldEntity[];
    if (info.entities) {
      requiredFieldEntities = info.entities;
    } else if (info.nameList) {
      requiredFieldEntities = [];
      // 遍历nameList，把cache中有的实例放到requiredFieldEntities中
      info.nameList.forEach((name) => {
        const record = cache[name];
        if (record) {
          requiredFieldEntities.push(record);
        }
      });
    } else {
      requiredFieldEntities = this.fieldEntities;
    }

    // 判断Form上没有的initialValue，把Item实例上的initialValue赋值到store上,用来更新Item下表单组件的值
    const resetWithFields = (entities: FieldEntity[]) => {
      entities.forEach((field) => {
        const { initialValue, name } = field.props;
        if (initialValue !== undefined && name !== undefined) {
          const formInitialValue = this.initialValues[name];
          if (formInitialValue === undefined) {
            this.store[name] = initialValue;
          }
        }
      });
    };
    resetWithFields(requiredFieldEntities);
  }


  // 设置initialValues，如果init为true，则顺带更新store
  public setInitialValues =(initialValues: Store, init: boolean)=> { 
    console.log(this);
    this.initialValues = initialValues || {};
    if (init) {
      this.store = { ...this.store, ...this.initialValues };
    }
  }

  // 往fieldEntities注册Form.Item实例，每次Form.Item实例在componentDidMount时，都会调用该函数把自身注册到fieldEntities上
  // 最后返回一个解除注册的函数
  public registerField = (entity: FieldEntity) => {
    this.fieldEntities.push(entity);
    return () => {
      this.fieldEntities = this.fieldEntities.filter((item) => item !== entity);
    };
  };

    // Form.Item实例化时，在执行constructor期间会调用该函数以更新initialValue
  
  public initEntityValue = (entity:FieldEntity) => {
    const { initialValue, name } = entity.props;
    
    if (name !==undefined) {
      const prevValue = this.store[name];

      // 赋值
      if (prevValue === undefined) {
        this.store = { ...this.store, [name]: initialValue };
      }

    }
  }



   // 根据name获取store中的值
   public getFieldValue = (name: string) => {
    return this.store[name];
  };

   // 获取整个store
   public getFieldsValue = () => {
    return { ...this.store };
   };
  
  // 内部更新store的函数

  public updateValue = (name: string | undefined, value: any) => { 
    
    if (name===undefined) return
    console.log(this);
    const prevStore = this.store;

    this.store = { ...this.store, [name]: value };



    this.notifyObservers(prevStore, [name], {
      type: 'valueUpdate',
      source: 'internal',
    });

    const { onValuesChange } = this.callbacks;

     // 取出onValuesChange，如果不为空则执行且传入相应的参数
     if (onValuesChange) {
      const changedValues = { [name]: this.store[name] };
      onValuesChange(changedValues, this.getFieldsValue());
    }


  };

   // 获取带有name的Item实例
   private getFieldEntities = () => {
    return this.fieldEntities.filter(( field ) => field.props.name);
  }

   // 生成更新信息mergedInfo且遍历所有的Form.Item实例调用其onStoreChange方法去判断是否需要更新执行
  
  public notifyObservers = (prevStore:Store,namePathList:string[]|undefined,info:NotifyInfo) => {
      
    const mergedInfo: ValuedNotifyInfo = {
      ...info,
      store: this.getFieldsValue(),
    };

    this.getFieldEntities().forEach(({ onStoreChange }) => {
      onStoreChange(prevStore, namePathList, mergedInfo);
    });

  }
  
 



}



  
export function useForm(form?: FormInstance):[FormInstance] {
    
  const formRef = React.useRef<FormInstance>();

if (!formRef.current) {
    // form作为参数，若form不为空，则不会创建且会把form存入formRef里
    if (form) {
      formRef.current = form;
      // 若form为空，则创建formStore且把getForm()返回的对象存入formRef里
    } else {
      const formStore: FormStore = new FormStore();
      formRef.current = formStore.getForm();
    }
  }
  // 最后返回formRef.current
  return [formRef.current];


}