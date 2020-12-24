import React, { useState, useEffect } from 'react';
import { Descriptions, Spin, Space, Button, message, Modal, Select, Popconfirm } from 'antd';
import { api } from '@/api';
import { useSMDialog, useSMForm, useSMTable } from '@/package/shanmao';
import styles from './index.less';

export default Member;

function Member ({ appId }) {
  const Table = useTable({ appId });
  const MemberAddDialog = useMemberAddDialog({ appId, Table });

  return (
    <>
      <div className={styles.buttonBox}>
        <h3>成员管理</h3>
        <Button type="primary" className={styles.addButton} onClick={() => MemberAddDialog.open()}>添加成员</Button>
      </div>
      <Table />
      <MemberAddDialog />
    </>
  );
}


function useTable ({ appId }) {
  const Table = useSMTable({
    columns: [
      { title: '成员名称', dataIndex: 'user' },
      { title: '成员昵称', dataIndex: 'nick' },
      {
        title: '操作',
        render (row) {
          return (
            <Space>
              <Popconfirm placement="top" title="确定移除" onConfirm={() => removeMember(row.id)}>
                <Button danger>移除</Button>
              </Popconfirm>
            </Space>
          );
        },
      },
    ],
    dataSource (params) {
      return api.app.member.list({ ...params, id: appId });
    },
  });

  return Table;

  function removeMember (id) {
    api.app.member.remove({ id }).then(() => Table.reload());
  }
}

function useMemberAddDialog ({ appId, Table }) {
  const [ userList, userListSet ] = useState([]);
  const [ memberList, memberListSet ] = useState([]);


  const Dialog = useSMDialog({
    title: '添加成员',
    render () {
      return (
        <Select
          mode="multiple"
          placeholder="选择角色"
          options={userList}
          value={memberList}
          onChange={onChange}
          style={{ width: '100%' }}
        />
      );
    },
    onOpen () {
      Dialog.setContentLoading(true);

      Promise.all([
        api.app.user.list(),
        api.app.member.list({ id: appId }),
      ])
        .then(([ { list: userList }, { list: memberList } ]) => {
          userListSet(userList);
          memberListSet(memberList.map((item) => item.id));
        })
        .finally(() => {
          Dialog.setContentLoading(false);
        });
    },
    afterClose () {
      // userIdSet(null);
    },
    onSubmit () {
      return api.app.member
        .modify({ appId, memberList })
        .then(() => {
          Table.reload();
        });
    },
  });

  return Dialog;

  function onChange (value) {
    memberListSet(value);
  }
}
