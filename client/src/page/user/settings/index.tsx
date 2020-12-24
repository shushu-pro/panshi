import React from 'react';
import { Button, Card, Form, message, Space } from 'antd';
import { useSMDialog, useSMForm } from '@/package/shanmao';
import { api } from '@/api';

export default UserSettings;

function UserSettings () {
  const PasswordModifyDialog = usePasswordModifyDialog();
  return (
    <Card>
      <Space>
        <Button type="primary" onClick={() => PasswordModifyDialog.open()}>修改密码</Button>
      </Space>
      <PasswordModifyDialog />
    </Card>
  );
}

function usePasswordModifyDialog () {
  const Form = useSMForm({
    fields: [
      {
        label: '原密码',
        name: 'password',
        type: 'password',
        rules: [
          { required: true },
        ],
      },
      {
        label: '新密码',
        name: 'passwordNext',
        type: 'password',
        dependencies: [ 'passwordNext2' ],
        rules: [
          { required: true },
        ],
      },
      {
        label: '确认密码',
        name: 'passwordNext2',
        type: 'password',
        dependencies: [ 'passwordNext' ],
        rules: [
          { required: true },
          ({ getFieldValue }) => ({
            validator (rule, value) {
              if (!value || getFieldValue('passwordNext') === value) {
                return Promise.resolve();
              }
              return Promise.reject(Error('密码输入不一致'));
            },
          }),
        ],
      },
    ],
    footer: null,
  });

  return useSMDialog({
    title: '修改密码',
    render: () => <Form />,
    onSubmit () {
      return Form.submit()
        .then(({ password, passwordNext, passwordNext2 }) => api.user.password.modify({
          password,
          passwordNext,
          passwordNext2,
        }))
        .then(() => {
          message.success('密码修改成功');
        });
    },
    afterClose () {
      Form.reset();
    },
  });
}
