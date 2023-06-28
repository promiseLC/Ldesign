import Form from '@/components/Form';
import styles from './index.scss';

export default function HomePage() {
  const onFinish = (values: any) => {
    console.log('finish', values);
  };

  const onValuesChange = (changedValues: any, values: any) => {
    console.log('onValuesChange', changedValues, values);
  };

  return (
    <Form
      initialValues={{
        username: '123',
        is_admin: true,
      }}
      onFinish={onFinish}
      onValuesChange={onValuesChange}>
      <Form.Item label="用户名" name="username" initialValue="345">
        <input type="text" />
      </Form.Item>
      <Form.Item label="品牌" name="role" initialValue="saab">
        <select>
          <option value="volvo">Volvo</option>
          <option value="saab">Saab</option>
          <option value="mercedes">Mercedes</option>
          <option value="audi">Audi</option>
        </select>
      </Form.Item>
      <Form.Item label="是否是管理员" name="is_admin" valuePropName="checked">
        <input type="checkbox" />
      </Form.Item>
      <Form.Item>
        <button type="submit">提交</button>
        <input type="reset" value="重置" />
      </Form.Item>
    </Form>
  );
}
