import React from 'react';
import type { FieldContextValues } from './FieldContext';
import FieldContext from './FieldContext';
import type { FieldEntity } from './typings';



// 从event中取值的默认方法
function defaultGetValueFromEvent(valuePropName: string, ...args: any[]) {
  const event = args[0];
  if (event && event.target && valuePropName in event.target) {
    // @ts-ignore
    return (event.target as HTMLInputElement)[valuePropName];
  }

  return event;
}

// 除了fieldContext，其他都是在此阶段中，Field.props需要实现的变量
export interface FieldProps {
  name?: string;
  label?: string;
  initialValue?: any;
  children?: React.ReactNode;
  valuePropName?: string;
  trigger?: string;
  getValueFromEvent?: (...args: any[]) => any;
  fieldContext: FieldContextValues;
}



type ChildProps = Record<string, any>;

export interface FieldState {
  resetCount: number;
}

// Field

class Field extends React.Component<FieldProps, FieldState> implements FieldEntity {

  private mounted = false;

  public state = {
    resetCount: 0,
  };

  constructor(props: FieldProps) {
    super(props);
    const { getInternalHooks } = props.fieldContext;

    // 更改formStore的initialValue
    getInternalHooks().initEntityValue(this);
  }

  // 在实例创建完成后把自己挂载到formStore.fieldEntities里

  public componentDidMount() {
    this.mounted = true;
    const { getInternalHooks } = this.props.fieldContext;
    getInternalHooks().registerField(this);
  }

  public onStoreChange: FieldEntity['onStoreChange'] = (preStore, namePathList, info) => {
    const { store } = info;
    const prevValue = preStore[this.props.name!];
    const curValue = store[this.props.name!];
    const nameMatch = namePathList && namePathList.includes(this.props.name!);


    switch (info.type) {
      case 'reset':
        if (!namePathList || nameMatch) {
          this.refresh();
        }
        break;
      default:
        if (nameMatch || prevValue !== curValue) {
          this.reRender();
          return;
        }
        break;
    }
  };

  public refresh = () => {
    if (!this.mounted) return;
    this.setState(({ resetCount }) => ({
      resetCount: resetCount + 1,
    }));
  };

   // 组件渲染更新函数，如果已经挂载了，则调用forceUpdate重新渲染
   public reRender() {
    if (!this.mounted) return;
    this.forceUpdate();
   }
  
  
  // 生成要通过React.cloneElement隐式混入到控件里的prop

  public getControlled = (childProps: ChildProps = {}) => {

    const {  fieldContext,
      name,
      valuePropName = 'value',
      getValueFromEvent,
      trigger = 'onChange', } = this.props;
      
      const value = name ? this.props.fieldContext.getFieldValue(name) : undefined;
    
    const mergedGetValueProps = (val: any) => ({ [valuePropName]: val });

    
    const control = {
      ...childProps,
      ...mergedGetValueProps(value),
    };

    // 先取出用户原本定义在控件的trigger(默认为onChange)上的方法

    const originTriggerFunc: any = childProps[trigger];

     // 增强其方法
    
     control[trigger] = (...args: any[]) => {
       let newValue: any;
       
      if (getValueFromEvent) {
        newValue = getValueFromEvent(...args);
      } else {
        //如果没有定义getValueFromEvent这类从event取值方法，则调用defaultGetValueFromEvent方法取值
        // defaultGetValueFromEvent会从evnet.target[valuePropName]中取值
        newValue = defaultGetValueFromEvent(valuePropName, ...args);
      }
      // 调用updateValue更新formStore的store以及遍历调用fieldEntities里实例的onStateChange方法，
      // 也就是上面定义的onStateChange方法
      fieldContext.getInternalHooks().updateValue(name, newValue);
      if (originTriggerFunc) {
        originTriggerFunc(...args);
      }
    };

    return control;

   }
  
  
  
  
  
   
  
  public render() {
    const { resetCount } = this.state;
    const { children } = this.props;
    let returnChildNode: React.ReactNode;
    if (React.isValidElement(children)) {
      returnChildNode = React.cloneElement(children, this.getControlled(children.props as any));
    } else {
      returnChildNode = children;
    }
    return <React.Fragment key={resetCount}>{returnChildNode}</React.Fragment>;
  }

  

}






// 这里WrapperField作用主要在于把FieldContext的值提取出来注入到Field
// 为什么不直接在Field中获取fieldContext呢？原因如下：
// Field由于要把自身实例注册到formStore.fieldEntities里，因此自身设计成类组件而非函数组件，
// 而在类函数中获取FieldContext中的fieldContext有两种方法：Context.Provider 和 contextType
//    1. Context.Provider获取的fieldContext只能在jsx中使用，很不便
//    2. contextType只能针对只有一个Context的情况。在真实源码中有多个Context，如针对FormProvider的FormContext和size的SizeContext
// 因此，这里提前把fieldContext提取出来注入到Field上
function WrapperField(props:Omit<FieldProps,'fieldContext'>){
  const fieldContext = React.useContext(FieldContext);

  return (
    <div style={{ display: 'flex', marginBottom: 12 }}>
    <div style={{ width: 100 }}>{props.label}</div>
    <Field {...props} fieldContext={fieldContext} />
  </div>

  )
  
}
  
export default WrapperField;
