import Form from '@/components/Form';

export default function HomePage() {
  const [form] = Form.useForm();

  const submit = () => {
    form.submit();
  };

  const reset = () => {
    form.resetFields();
  };

  const onFinish = (values: any) => {
    console.log('finish', values);
  };

  return (
    <div>
      <div
        onClick={() => {
          console.log(form.getFieldValue('username'));
        }}>
        获取
      </div>
      <Form
        form={form}
        initialValues={{
          username: '123',
          is_admin: true,
        }}
        onFinish={onFinish}>
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
          {/* 部分浏览器会存在不加type则默认type为submit的情况 */}
          <button type="button" onClick={submit}>
            提交
          </button>
          <button type="button" onClick={reset}>
            重置
          </button>
        </Form.Item>
      </Form>
    </div>
  );
}
