import React, { useState } from 'react';
import { Form, Input, Button, Space, Card } from 'antd';

const WarehouseForm = ({ form }) => {
  return (
    <Card title="Склад">
      <Form.List name="shelves">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field) => (
              <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                <ShelfForm field={field} form={form} />
                <Button type="primary" onClick={() => remove(field.name)}>Удалить полку</Button>
              </Space>
            ))}
            <Form.Item>
              <Button type="dashed" onClick={() => add()} block>
                Добавить новую полку
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    </Card>
  );
};

const ShelfForm = ({ field, form }) => {
  return (
    <Space direction="vertical">
      <Input value={field.name} onChange={(e) => form.setFieldsValue({ [`${field.fieldKey}.name`]: e.target.value })} placeholder="Название полки" />
      <Form.List name={[field.fieldKey, 'products']}>
        {(fields, { add, remove }) => (
          <>
            {fields.map((field) => (
              <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                <Input value={field.name} onChange={(e) => form.setFieldsValue({ [`${field.fieldKey}.name`]: e.target.value })} placeholder="Товар" />
                <Button type="primary" onClick={() => remove(field.name)}>Удалить товар</Button>
              </Space>
            ))}
            <Form.Item>
              <Button type="dashed" onClick={() => add()} block>
                Добавить новый товар
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    </Space>
  );
};

const OrgPage = () => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log('Завершено:', values);
  };

  return (
    <Form form={form} name="warehouse-form" onFinish={onFinish}>
      <WarehouseForm form={form} />
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Отправить
        </Button>
      </Form.Item>
    </Form>
  );
};

export default OrgPage;