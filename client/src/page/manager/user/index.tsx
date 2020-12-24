import React, { useState, useEffect } from 'react';
import { Card, Button, message, Popconfirm, notification, Space, Select } from 'antd';
import { useSMDialog, useSMForm, useSMTable } from '@/package/shanmao/';
import { api } from '@/api/';
import { textCopy } from '@/util';
import adapter from '@shushu.pro/adapter';
import styles from './index.less';


export default manageUser;

function manageUser () {
  // const hookTable = createHookTable();
  // const hookUserModifyDialog = createHookUserModifyDialog();
  // const hookUserRoleSettingDialog = createHookUserRoleSettingDialog();
  const innerAPI: any = {};
  const UserCreateButton = useUserCreateButton(innerAPI);
  const UserList = useUserList(innerAPI);
  const UserModifyDialog = useUserModifyDialog(innerAPI);
  const UserRoleSettingDialog = useUserRoleSettingDialog(innerAPI);

  innerAPI.UserList = UserList;
  innerAPI.UserModifyDialog = UserModifyDialog;
  innerAPI.UserRoleSettingDialog = UserRoleSettingDialog;

  return (
    <Card>
      <UserCreateButton />
      <UserList />
      <UserModifyDialog />
      <UserRoleSettingDialog />
    </Card>
  );
}

function useUserCreateButton (innerAPI) {
  const [ passwordText, passwordTextSet ] = useState('');
  const UserCreateForm = useSMForm({
    fields: [
      {
        label: '用户名',
        name: 'user',
        rules: [
          { required: true },
        ],
      },
      {
        label: '昵称',
        name: 'nick',
      },
    ],
    footer: null,
  });

  const SuccessDialog = useSMDialog({
    title: '账号创建成功',
    render () {
      return <div>密码：<span onClick={() => textCopy(passwordText, () => message.success('密码已经复制'))}>{passwordText}</span></div>;
    },
    onSubmit () {
      // ..
    },
  });

  const UserCreateDialog = useSMDialog({
    title: '添加用户',
    render: () => <UserCreateForm />,
    onSubmit () {
      return UserCreateForm.submit()
        .then((values) => api.manager.user.create(values))
        .then((data) => {
          passwordTextSet(data.password);
          innerAPI.UserList.reload();
          SuccessDialog.open();
        });
    },
    afterClose () {
      UserCreateForm.reset();
    },
  });


  return () => (
    <>
      <div className={styles.buttonBox}>
        <Button type="primary" onClick={() => UserCreateDialog.open()}>创建用户</Button>
      </div>
      <SuccessDialog />
      <UserCreateDialog />
    </>
  );
}

function useUserList (innerAPI) {
  const Table = useSMTable({
    columns: [
      { title: '用户名', dataIndex: 'user', width: 200 },
      { title: '昵称', dataIndex: 'nick', width: 300 },
      { title: '创建时间', dataIndex: 'createTime', width: 160 },
      {
        title: '操作',
        render: (row) => (
          <Space>
            <Button onClick={() => innerAPI.UserModifyDialog.open(row)}>编辑</Button>
            <Button onClick={() => innerAPI.UserRoleSettingDialog.open(row.id)}>设置角色</Button>
            <Popconfirm placement="top" title="确定删除" onConfirm={() => deleteUser(row.id)}>
              <Button danger>删除</Button>
            </Popconfirm>
            <Popconfirm placement="top" title="确定重置密码" onConfirm={() => resetPassword(row.id)}>
              <Button danger>重置密码</Button>
            </Popconfirm>
            {row.enabled ? (
              <Button danger onClick={() => setDisabled(row.id, true)}>禁用</Button>
            ) : (
              <Button type="primary" onClick={() => setDisabled(row.id, false)}>启用</Button>
            )}
          </Space>
        ),
      },
    ],
    dataSource () {
      return api.manager.user.list();
    },
    props: {
      scroll: { x: 1100 },
      pagination: false,
    },
  });

  return Table;

  function deleteUser (id) {
    api.manager.user.delete({ id }).then(() => {
      Table.reload();
    });
  }

  function resetPassword (id) {
    api.manager.user.password.reset({ id })
      .then(({ password }) => {
        notification.success({
          placement: 'bottomRight',
          description: `新密码：${password}`,
          message: 'xxx',
          onClick () {
            textCopy(password, () => {
              message.success('密码已经复制');
            });
          },
        });
      });
  }

  function setDisabled (id, value) {
    api.manager.user.disabled({ id, state: value }).then(() => Table.reload());
  }
}

function useUserModifyDialog (innerAPI) {
  const Form = useSMForm({
    fields: [
      { label: 'id', name: 'id', type: 'hidden' },
      { label: '昵称', name: 'nick' },
    ],
    footer: null,
  });

  const Dialog = useSMDialog({
    title: '编辑用户',
    render: () => <Form />,
    onOpen (api, data) {
      Form.setValue({ id: data.id, nick: data.nick });
    },
    onSubmit () {
      return Form.submit()
        .then(({ id, nick }) => api.manager.user.modify({ id, nick }))
        .then(() => {
          innerAPI.UserList.reload();
        });
    },
  });

  return Dialog;
}

function useUserRoleSettingDialog (innerAPI) {
  const [ userId, userIdSet ] = useState(null);
  const [ dialogData, dialogDataSet ] = useState({});
  const [ roleValues, roleValuesSet ] = useState([]);

  const Dialog = useSMDialog({
    title: '设置角色',
    render () {
      return (
        <Select
          mode="multiple"
          placeholder="选择角色"
          options={dialogData.roleList}
          value={roleValues}
          onChange={pickRole}
          style={{ width: '100%' }}
        />
      );
    },
    onOpen (api, id) {
      userIdSet(id);
    },
    afterClose () {
      userIdSet(null);
    },
    onSubmit () {
      return api.manager.user.role
        .modify({ userId, roles: roleValues })
        .then(() => {
          innerAPI.UserList.reload();
        });
    },
  });

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [ userId ]);

  return Dialog;

  function pickRole (values) {
    roleValuesSet(values);
  }

  // 拉取用户角色和角色列表
  function fetchData () {
    Dialog.setContentLoading(true);
    Promise.all([
      api.manager.role.list(),
      api.manager.user.role.list({ userId }),
    ])
      .then(([ { list: roleList }, { list: userRoleList } ]) => {
        dialogDataSet({
          roleList: adapter({ id: 'value', label: true }, roleList),
          userRoleList,
        });
        roleValuesSet(userRoleList);
        // console.info({
        //   userRoleList,
        //   roleList: adapter({ id: 'value', label: true }, roleList),
        // });
      })
      .finally(() => {
        Dialog.setContentLoading(false);
      });
  }
}
