import React, { useState, useEffect } from 'react';
import { Card, Button, Popconfirm, Space, Row, Col, Tree, Tabs, Tooltip, Modal } from 'antd';
import { useSMDialog, useSMForm, useSMTable } from '@/package/shanmao';
import { api } from '@/api/';
import { mockJSON } from '@/util';
import { PlusCircleOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import styles from './index.less';


export default Module;
function Module () {
  const bridge: any = { };
  const ModuleList = useModuleList(bridge);

  return (
    <Card>
      <ButtonBox bridge={bridge} />
      <ModuleList />
      <PermissionSettingDialog bridge={bridge} />
    </Card>
  );
}

function ButtonBox ({ bridge }) {
  const Form = useSMForm({
    fields: [
      { label: '模块名词', name: 'label', maxlength: 32, rules: [ { required: true } ] },
      { label: '模块标识', name: 'symbol', maxlength: 128, rules: [ { required: true } ] },
    ],
    footer: null,
  });

  const Dialog = useSMDialog({
    title: '添加模块',
    render () {
      return (<Form />);
    },
    onSubmit () {
      return Form.submit()
        .then((values) => api.manager.module.create(values))
        .then(() => bridge.ModuleList.reload());
    },
    afterClose () {
      Form.reset();
    },
  });

  return (
    <>
      <div className={styles.buttonBox}>
        <Button type="primary" onClick={() => Dialog.open()}>创建模块</Button>
      </div>
      <Dialog />
    </>
  );
}

function useModuleList (bridge) {
  const ModuleList = bridge.ModuleList = useSMTable({
    columns: [
      { title: '模块名称', dataIndex: 'label', width: 200 },
      { title: '模块标识', dataIndex: 'symbol', width: 200 },
      {
        title: '操作',
        render: (row) => (
          <>
            <Space>
              <Button onClick={() => bridge.PermissionSettingDialog.open({ moduleId: row.id, label: row.label, symbol: row.symbol })}>设置权限</Button>
              <Popconfirm placement="top" title="确定删除" onConfirm={() => submitDelete(row.id)}>
                <Button danger>删除</Button>
              </Popconfirm>
            </Space>
          </>
        ),
      },

    ],
    dataSource: (params) => api.manager.module.list(params),
    props: { scroll: { x: 600 } },
  });

  return ModuleList;

  function submitDelete (id) {
    api.manager.module.delete({ id }).then(() => {
      ModuleList.reload();
    });
  }
}

function PermissionSettingDialog ({ bridge }) {
  const [ moduleInfo, moduleInfoSet ] = useState({} as {label: string, moduleId: number, symbol: string});
  const [ functionGroupData, functionGroupDataSet ] = useState();
  const [ functionData, functionDataSet ] = useState();
  const [ treeData, treeDataSet ] = useState(mockJSON(`
  @list(1)[
    @title #text
    @key 10000++
    @children(100)[
      @title #name
      @key 1000000++
    ]
  ]
`).list);
  const [ activeTabKey, activeTabKeySet ] = useState('index');
  const { moduleId } = moduleInfo;

  const GroupEditorForm = useSMForm({
    fields: [
      { name: 'id', type: 'hidden' },
      { name: 'parentId', type: 'hidden' },
      {
        label: '分类名称',
        name: 'label',
        maxlength: 32,
        rules: [ { required: true } ],
      },
      {
        label: '分类标识',
        name: 'symbol',
        maxlength: 128,
        rules: [ { required: true } ],
      },
    ],
    footer: null,
  });

  const PermissionEditorForm = useSMForm({
    fields: [
      { name: 'id', type: 'hidden' },
      { name: 'groupId', type: 'hidden' },
      {
        label: '权限名称',
        name: 'label',
        maxlength: 32,
        rules: [ { required: true } ],
      },
      {
        label: '权限标识',
        name: 'symbol',
        maxlength: 128,
        rules: [ { required: true } ],
      },
    ],
    footer: null,
  });

  const Dialog = bridge.PermissionSettingDialog = useSMDialog({
    title: '设置权限',
    width: 800,
    render () {
      return (
        <Row style={{ minHeight: '480px' }}>
          <Col span={10}>
            <Tree
              treeData={treeData}
              height={480}
              blockNode
              showLine
            />
          </Col>
          <Col span={14}>
            <Tabs type="card" activeKey={activeTabKey}>
              <Tabs.TabPane tab="提示" key="index" disabled>
                <div style={{ padding: '20px' }}>
                  点击左侧进行操作
                </div>
              </Tabs.TabPane>
              <Tabs.TabPane tab="添加分类" key="groupEditor" disabled>
                <div style={{ padding: '20px' }}>
                  <GroupEditorForm />
                  <Space style={{ marginLeft: '100px' }}>
                    <Button onClick={submitGroup}>提交</Button>
                    <Button onClick={() => activeTabKeySet('index')}>取消</Button>
                  </Space>
                </div>
              </Tabs.TabPane>
              <Tabs.TabPane tab="添加权限" key="permissionEditor" disabled>
                <div style={{ padding: '20px' }}>
                  <PermissionEditorForm />
                  <Space style={{ marginLeft: '100px' }}>
                    <Button onClick={submitPermission}>提交</Button>
                    <Button onClick={() => activeTabKeySet('index')}>取消</Button>
                  </Space>
                </div>
              </Tabs.TabPane>
            </Tabs>
          </Col>
        </Row>
      );
    },
    onOpen (moduleInfoNext) {
      moduleInfoSet(moduleInfoNext);
    },
    props: { footer: null },
  });

  // 拉取权限组和权限值
  useEffect(() => {
    if (moduleId) {
      fetchModulePermission();
    }
  }, [ moduleId ]);

  // 转化生成权限树
  useEffect(() => {
    if (functionGroupData && functionData) {
      treeDataSet(transformPermissionTree(functionGroupData, functionData));
    }
  }, [ functionGroupData, functionData ]);

  return <Dialog />;

  function fetchModulePermission () {
    Dialog.setContentLoading(true);
    Promise.all([
      api.manager.module.function.group.list({ id: moduleId }),
      api.manager.module.function.list({ id: moduleId }),
    ]).then(([ { list: functionGroupList }, { list: functionList } ]) => {
      Dialog.setContentLoading(false);
      functionGroupDataSet(functionGroupList);
      functionDataSet(functionList);
    });
  }

  // 转化权限树
  function transformPermissionTree (functionGroupData, functionData) {
    const groupMap = {
      0: {
        label: moduleInfo.label,
        key: '0',
        title,
        children: [],
      },
    };
    const rootChildren = groupMap[0].children;

    // console.info({ rootChildren });

    // 将平铺的分组转成树结构
    functionGroupData.forEach(({ id, label, symbol, parentId }) => {
      let groupItem = groupMap[id];
      if (!groupItem) {
        groupItem = groupMap[id] = { children: [] };
      }
      Object.assign(groupItem, { id, label, symbol, parentId, title });

      if (parentId) {
        let parentGroupItem = groupMap[parentId];
        if (!parentGroupItem) {
          parentGroupItem = groupMap[parentId] = { children: [] };
        }
        parentGroupItem.children.push(groupItem);
      } else {
        rootChildren.push(groupItem);
      }
    });

    // 挂载权限因子
    functionData.forEach(({ id, label, symbol, groupId }) => {
      const groupItem = groupMap[groupId];
      if (groupItem && groupItem.children) {
        groupItem.children.push({
          id, label, symbol, isLeaf: true, groupId, title,
        });
      }
    });

    makeKey(groupMap[0].children, '0');

    return [ groupMap[0] ];

    function title ({ id, label, key, symbol, parentId, groupId, isLeaf }) {
      return (
        <div className={styles.treeItem} key={key}>
          {label}
          <div className={styles.treeButtonBox}>
            {isLeaf
              ? (
                <Space>
                  <Tooltip placement="top" title="修改权限">
                    <span onClick={(e) => {
                      activeTabKeySet('permissionEditor');
                      delay(() => PermissionEditorForm.setValue({ id, label, symbol }));
                      e.stopPropagation();
                    }}
                    ><EditOutlined />
                    </span>
                  </Tooltip>
                  <Tooltip placement="top" title="删除权限">
                    <span onClick={(e) => {
                      Modal.confirm({
                        title: '确定删除该权限？',
                        content: '只允许删除未使用的权限',
                        onOk: () => api.manager.module.function
                          .delete({ id })
                          .then(() => {
                            fetchModulePermission();
                          }),
                      });
                      e.stopPropagation();
                    }}
                    ><DeleteOutlined />
                    </span>
                  </Tooltip>
                </Space>
              )
              : (
                <Space>
                  {id && (
                    <Tooltip placement="top" title="添加权限">
                      <span onClick={(e) => {
                        activeTabKeySet('permissionEditor');
                        delay(() => PermissionEditorForm.setValue({ id: undefined, groupId: id, label: '', symbol: '' }));
                        e.stopPropagation();
                      }}
                      ><PlusCircleOutlined />
                      </span>
                    </Tooltip>
                  )}
                  <Tooltip placement="top" title="添加子分组">
                    <span onClick={(e) => {
                      activeTabKeySet('groupEditor');
                      delay(() => GroupEditorForm.setValue({ id: undefined, parentId: id, label: '', symbol: '' }));
                      e.stopPropagation();
                    }}
                    ><PlusOutlined />
                    </span>
                  </Tooltip>

                  {id && (
                    <>
                      <Tooltip placement="top" title="修改分组">
                        <span onClick={(e) => {
                          activeTabKeySet('groupEditor');
                          delay(() => GroupEditorForm.setValue({ id, label, symbol }));
                          e.stopPropagation();
                        }}
                        ><EditOutlined />
                        </span>
                      </Tooltip>
                      <Tooltip placement="top" title="删除分组">
                        <span onClick={(e) => {
                          Modal.confirm({
                            title: '确定删除该分组？',
                            content: '只允许删除空分组',
                            onOk: () => api.manager.module.function.group
                              .delete({ id })
                              .then(() => {
                                fetchModulePermission();
                              }),
                          });
                          e.stopPropagation();
                        }}
                        ><DeleteOutlined />
                        </span>
                      </Tooltip>
                    </>
                  )}
                </Space>
              )}
            {/* 添加分类|添加权限|编辑|删除 */}
            {/* 编辑|删除 */}
          </div>
        </div>
      );
    }

    function makeKey (children, parentKey) {
      children.forEach((item) => {
        item.key = `${parentKey}-${item.id}`;
        if (item.children && item.children.length) {
          makeKey(item.children, item.key);
        }
      });
    }
  }

  function submitGroup () {
    GroupEditorForm.submit()
      .then(({ id, parentId, label, symbol }) => {
        if (id) {
          return api.manager.module.function.group.modify({ id, label, symbol });
        }
        return api.manager.module.function.group.create({ moduleId, parentId, label, symbol });
      })
      .then(() => {
        activeTabKeySet('index');
        fetchModulePermission();
      });
  }

  function submitPermission () {
    PermissionEditorForm.submit()
      .then(({ id, groupId, label, symbol }) => {
        // 编辑模式
        if (id) {
          return api.manager.module.function.modify({ id, label, symbol });
        }
        return api.manager.module.function.create({ moduleId, groupId, label, symbol });
      })
      .then(() => {
        activeTabKeySet('index');
        fetchModulePermission();
      });
  }
}

function delay (fn) {
  setTimeout(fn, 10);
}
