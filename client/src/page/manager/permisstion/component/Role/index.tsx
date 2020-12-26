import React, { useState, useEffect } from 'react';
import { Card, Button, Popconfirm, Space, Tree } from 'antd';
import { useSMDialog, useSMForm, useSMTable } from '@/package/shanmao/';
import { api } from '@/api/';
import styles from './index.less';

export default Role;

function Role () {
  const bridge: any = {};

  return (
    <Card>
      <ButtonBox bridge={bridge} />
      <RoleList bridge={bridge} />
      <RoleSettingDialog bridge={bridge} />
      <RoleModifyDialog bridge={bridge} />
    </Card>
  );
}

function ButtonBox ({ bridge }) {
  const Form = useSMForm({
    fields: [
      { label: '角色名称', name: 'label', maxlength: 32, rules: [ { required: true } ] },
    ],
    footer: null,
  });
  const Dialog = useSMDialog({
    title: '创建角色',
    render: () => <Form />,
    onSubmit () {
      return Form.submit()
        .then((values) => api.manager.role.create(values))
        .then(() => bridge.RoleList.reload());
    },
    afterClose () {
      Form.reset();
    },
  });
  return (
    <>
      <div className={styles.buttonBox}>
        <Button type="primary" onClick={() => Dialog.open()}>创建角色</Button>
      </div>
      <Dialog />
    </>
  );
}

function RoleList ({ bridge }) {
  const Table = bridge.RoleList = useSMTable({
    columns: [
      { title: '角色名称', dataIndex: 'label', width: 200 },
      {
        title: '操作',
        render: (row) => (
          <>
            <Space>
              <Button onClick={() => bridge.RoleSettingDialog.open({ id: row.id })}>设置权限</Button>
              <Button onClick={() => bridge.RoleModifyDialog.open({ id: row.id, label: row.label })}>修改名称</Button>
              <Popconfirm placement="top" title="确定删除" onConfirm={() => submitDelete(row.id)}>
                <Button danger>删除</Button>
              </Popconfirm>
            </Space>
          </>
        ),
      },

    ],
    dataSource: (params) => api.manager.role.list(params),
    props: { scroll: { x: 600 } },
  });

  return <Table />;

  function submitDelete (id) {
    api.manager.role.delete({ id }).then(() => {
      Table.reload();
    });
  }
}

function RoleSettingDialog ({ bridge }) {
  const [ roleId, roleIdSet ] = useState();
  const [ roleSettingData, roleSettingDataSet ] = useState({
    moduleList: [], // 模块列表
    moduleFunctionList: [], // 权限因子列表
    moduleFunctionGroupList: [], // 权限分组列表
    rolePermissionList: [], // 角色权限列表
  });
  const [ treeData, treeDataSet ] = useState([]);
  const [ checkedKeys, checkedKeysSet ] = useState([]);

  const Dialog = bridge.RoleSettingDialog = useSMDialog({
    title: '设置权限',
    render () {
      return (
        <div style={{ minHeight: '400px' }}>
          <Tree
            treeData={treeData}
            checkedKeys={checkedKeys}
            onCheck={onCheck}
            checkable
            showLine
            blockNode
            height={400}
          />
        </div>
      );
    },
    onOpen ({ id }) {
      roleIdSet(id);
    },
    onSubmit () {
      const { moduleFunctionList, rolePermissionList } = roleSettingData;
      const modifiedFunctionList = [];
      moduleFunctionList.map((item) => item.id).forEach((id) => {
        // 1. 添加的，选中了并且不在原始权限
        if (checkedKeys.includes(id) && !rolePermissionList.includes(id)) {
          return modifiedFunctionList.push({ id, enabled: true });
        }

        // 2. 移除的，原来的存在，选中的不存在
        if (!checkedKeys.includes(id) && rolePermissionList.includes(id)) {
          modifiedFunctionList.push({ id, enabled: false });
        }
      });

      // console.info({ modifiedFunctionList });
      if (modifiedFunctionList.length > 0) {
        return api.manager.role.function.modify({ id: roleId, functionList: modifiedFunctionList });
      }
    },
    afterClose () {
      roleIdSet(null);
    },
  });

  // 角色发生变化，则重新拉取角色权限
  useEffect(() => {
    if (roleId) {
      fetchRolePermission();
    }
  }, [ roleId ]);

  // 角色数据发生变化，重新生成权限树
  useEffect(() => {
    transformTreeData();
  }, [ roleSettingData ]);

  return <Dialog />;

  function fetchRolePermission () {
    // console.info('拉取角色权限');
    Dialog.setContentLoading(true);
    Promise.all([
      api.manager.module.list(),
      api.manager.module.function.list(),
      api.manager.module.function.group.list(),
      api.manager.role.function.list({ id: roleId }),
    ])
      .then(([ { list: moduleList }, { list: moduleFunctionList }, { list: moduleFunctionGroupList }, { list: rolePermissionList } ]) => {
        Dialog.setContentLoading(false);
        roleSettingDataSet({
          moduleList, moduleFunctionList, moduleFunctionGroupList, rolePermissionList: rolePermissionList.map((item) => item.moduleFunctionId),
        });
      });
  }

  function reloadRolePermission () {
    api.role.permission.list({ id: roleId })
      .then((rolePermissionList) => {
        roleSettingDataSet((prevState) => ({
          ...prevState,
          rolePermissionList: rolePermissionList.map((item) => item.moduleFunctionId),
        }));
      });
  }

  function transformTreeData () {
    const { moduleList, moduleFunctionList, moduleFunctionGroupList, rolePermissionList } = roleSettingData;
    const treeData = [];

    // 模块级
    const moduleMap = {};
    moduleList.forEach(({ id, symbol, label }) => {
      treeData.push(moduleMap[id] = {
        id,
        symbol,
        label,
        children: [],
      });
    });


    // 分组级
    const moduleFunctionGroupMap = {};
    moduleFunctionGroupList.forEach(({ id, label, symbol, moduleId, parentId }) => {
      let functionGroupItem = moduleFunctionGroupMap[id];
      if (!functionGroupItem) {
        functionGroupItem = moduleFunctionGroupMap[id] = {
          id, label, symbol, moduleId, parentId, children: [],
        };
      } else {
        Object.assign(functionGroupItem, {
          id, label, symbol, moduleId, parentId,
        });
      }

      if (parentId) {
        let parentFunctionGroupItem = moduleFunctionGroupMap[parentId];
        // 子级分组
        if (!parentFunctionGroupItem) {
          parentFunctionGroupItem = moduleFunctionGroupMap[parentId] = { children: [] };
        }
        parentFunctionGroupItem.children.push(functionGroupItem);
      } else {
        // 模块级分组
        const parentModuleItem = moduleMap[moduleId];
        if (parentModuleItem) {
          parentModuleItem.children.push(functionGroupItem);
        }
      }
      // let parentGroupItem = moduleFunctionGroupMap[parentId]
      // if(parentGroupItem)
    });

    // 权限
    moduleFunctionList.forEach(({ id, label, symbol, groupId }) => {
      const groupItem = moduleFunctionGroupMap[groupId];
      if (!groupItem) {
        return;
      }
      groupItem.children.push({
        id, label, symbol, isLeaf: true,
      });
    });


    treeDataSet(walkTree(treeData));
    checkedKeysSet([ ...rolePermissionList ]);

    //   console.info({ treeData });

    function title ({ label }) {
      return (<div>{label}</div>);
    }

    function walkTree (treeData) {
      makeKey(treeData, '');

      function makeKey (children, parentKey) {
        const nextChildren = children.filter((item) => item.isLeaf || item.children.length > 0);
        //   console.info({ nextChildren });

        nextChildren.forEach((item) => {
          if (item.isLeaf) {
            item.key = item.id;
          } else {
            item.key = `${parentKey}-${item.id}`;
          }

          item.title = title;
          if (item.children) {
            makeKey(item.children, item.key);
          }
        });

        children.length = 0;
        children.push(...nextChildren);
      }
      return treeData;
    }
  }

  function onCheck (checkedKeys, { checkedNodes }) {
    const nextCheckedKeys = checkedNodes.filter((item) => item.isLeaf).map((item) => item.key);
    checkedKeysSet(nextCheckedKeys);
  }
}

function RoleModifyDialog ({ bridge }) {
  const Form = useSMForm({
    fields: [
      { name: 'id', type: 'hidden' },
      { label: '角色名称', name: 'label', maxlength: 32, rules: [ { required: true } ] },
    ],
    footer: null,
  });
  const Dialog = bridge.RoleModifyDialog = useSMDialog({
    title: '修改角色名称',
    render: () => <Form />,
    onOpen ({ id, label }) {
      Form.setValue({ id, label });
    },
    onSubmit () {
      return Form.submit()
        .then(({ id, label }) => api.manager.role.modify({ id, label }))
        .then(() => {
          bridge.RoleList.reload();
        });
    },
  });

  return <Dialog />;
}
