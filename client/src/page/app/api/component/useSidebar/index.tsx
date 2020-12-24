import React, { useEffect, useState } from 'react';
import { Button, Layout, message, Tree, Tooltip, Modal } from 'antd';
import { Link, useHistory } from 'react-router-dom';
import { useSMDialog, useSMForm } from '@/package/shanmao';
import { hasAuth } from '@/page/user';
import { api } from '@/api';
import adapter from '@shushu.pro/adapter';
import { PlusCircleOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
// import tower from '@/package/tower';
import styles from './index.less';

export default useSidebar;

function useSidebar ({ apiId, appId }) {
  let exportJSX = null;
  const innerAPI: any = {};

  const [ sidebarTop, sidebarTopSet ] = useState(65);
  const [ { appDetail, rawCategorys, appApiList }, { fetchAppApiList, fetchAppCategoryList } ] = useDataState({ appId });
  const [ topbarJSX, topbar ] = useTopbar({
    appId, appDetail, fetchAppCategoryList, innerAPI,
  });
  const [ APITreeJSX, APITree ] = useAPITree({
    appId,
    apiId,
    rawCategorys,
    appApiList,
    fetchAppApiList,
    fetchAppCategoryList,
  });

  innerAPI.CategoryCreateDialog = APITree.CategoryCreateDialog;


  useEffect(() => {
    // 设置滚动监听
    window.addEventListener('scroll', scroll);
    return () => {
      // tower.leave(who);
      window.removeEventListener('scroll', scroll);
    };
    function scroll () {
      sidebarTopSet(Math.max(0, 65 - Math.round(window.document.documentElement.scrollTop)));
    }
  }, []);

  const exportAPI = createAPI();

  exportJSX = (
    <Layout.Sider
      className={styles.sidebar}
      theme="light"
      width={360}
      style={{
        overflow: 'auto',
        height: `calc(100vh - ${sidebarTop}px)`,
        position: 'fixed',
        left: 0,
        bottom: 0,
      }}
    >
      {topbarJSX}
      {APITreeJSX}
    </Layout.Sider>
  );

  return [ exportJSX, exportAPI ];

  function createAPI () {
    return {
      noop () {
        // ...
      },
      fetchAppApiList,
    };
  }
}

function useDataState ({ appId }) {
  const [ appDetail, appDetailSet ] = useState({});
  const [ rawCategorys, rawCategorysSet ] = useState(null);
  const [ appApiList, appApiListSet ] = useState(null);

  useEffect(() => {
    fetchAppDetail();
    fetchAppCategoryList();
    fetchAppApiList();
  }, []);

  function fetchAppDetail () {
    api.app.detail({ id: appId })
      .then((detail) => {
        appDetailSet(detail);
      });
  }

  function fetchAppCategoryList () {
    api.app.category.list({ appId })
      .then(({ list: data }) => {
        rawCategorysSet(data);
      });
  }

  function fetchAppApiList () {
    api.app.api.list({ appId })
      .then(({ list: data }) => {
        appApiListSet(data);
      });
  }

  return [ { appDetail, rawCategorys, appApiList }, { fetchAppDetail, fetchAppCategoryList, fetchAppApiList } ];
}

function useTopbar ({ appId, appDetail, fetchAppCategoryList }) {
  const history = useHistory();
  const CategoryCreateDialog = useCategoryCreateDialog({ appId, fetchAppCategoryList });
  const exportAPI = createAPI();
  const exportJSX = (
    <div className={styles.topbar}>
      <h3>
        <span className={styles.appName} title={appDetail.name}>{ appDetail.name || 'loading...' }</span>
        {hasAuth('app.modify') && (
          <Button
            type="primary"
            style={{ float: 'right' }}
            onClick={() => history.push(`/app/info?appId=${appId}`)}
          >
            应用设置
          </Button>
        )}
        <Button
          type="primary"
          style={{ float: 'right', marginRight: '8px' }}
          onClick={() => CategoryCreateDialog.open()}
        >
          添加分类
        </Button>
        <CategoryCreateDialog />
      </h3>
    </div>
  );

  return [ exportJSX, exportAPI ];

  function createAPI () {
    return {
      noop () {
        // ...
      },
    };
  }
}

// API菜单树
function useAPITree ({ appId, apiId, rawCategorys, appApiList, fetchAppApiList, fetchAppCategoryList }) {
  const exportAPI = createAPI();
  const [ treeData, treeDataSet ] = useState([]);
  const history = useHistory();

  const [ dialogsJSX, { ApiCreateDialog, CategoryCreateDialog, CategoryModifyDialog } ] =
    useDialogs({ history, appId, apiId, fetchAppCategoryList, fetchAppApiList });

  useEffect(() => {
    if (!rawCategorys || !appApiList) {
      return;
    }

    treeDataSet(transformTreeData({
      appId,
      apiId,
      history,
      categorys: transfromCategorys({ rawCategorys, appApiList }),

      // 操作接口
      fetchAppApiList,
      fetchAppCategoryList,

      ApiCreateDialog,
      CategoryCreateDialog,
      CategoryModifyDialog,
    }));
  }, [ rawCategorys, appApiList ]);

  const exportJSX = (
    <>
      <Tree.DirectoryTree
        draggable
        autoExpandParent
        treeData={treeData}
        onDrop={onDrop}
      />
      {dialogsJSX}
    </>
  );

  return [ exportJSX, exportAPI ] as [JSX.Element, any];

  function createAPI () {
    return {
      noop () {
        // ..
      },
      CategoryCreateDialog,
    };
  }

  function onDrop (info) {
    const dropKey = String(info.node.props.eventKey);
    const dragKey = String(info.dragNode.props.eventKey);

    // 分类类目不能移动到未分类
    if (dropKey.indexOf('#') !== -1 && /^(\d+)$/.test(dragKey)) {
      return;
    }

    api.app.category
      .move({
        appId, selfId: dragKey, targetId: dropKey,
      })
      .then(() => {
        fetchAppCategoryList();
        fetchAppApiList();
      });
  }
}

// 将接口挂载到分类下
function transfromCategorys ({ rawCategorys, appApiList }) {
  const categorys = [];
  const parentCategorys = {};
  const allCategorys = {};
  rawCategorys.forEach((category) => {
    const { parentId } = category;
    if (parentId) {
      parentCategorys[parentId] = parentCategorys[parentId] || [];
      parentCategorys[parentId].push(category);
    } else {
      categorys.push(category);
    }

    // 用于挂载API的分类索引
    if (!allCategorys[category.id]) {
      allCategorys[category.id] = category;
    }
  });

  rawCategorys.forEach((category) => {
    category.children = parentCategorys[category.id] || [];
  });

  const unCategoryApis = [];
  const allCategorysIds = Object.keys(allCategorys).map((item) => Number(item));

  appApiList.forEach((apiInfo) => {
    const { parentId } = apiInfo;
    if (allCategorysIds.includes(parentId)) {
      allCategorys[parentId].children.push(apiInfo);
      apiInfo.key = `${parentId}-${apiInfo.id}`;
    } else {
      unCategoryApis.push(apiInfo);
      apiInfo.key = `#${apiInfo.id}`;
    }
  });

  categorys.unshift({
    title: '未分类',
    key: '#',
    children: unCategoryApis,
  });

  return categorys;
}

// 转化分类/接口树
// eslint-disable-next-line max-len
function transformTreeData ({ appId, apiId, history, categorys, fetchAppApiList, fetchAppCategoryList, ApiCreateDialog, CategoryCreateDialog, CategoryModifyDialog }) {
  const titleFactory = (title, { row: { key, id, parentId, isLeaf } }) => {
    // eslint-disable-next-line no-nested-ternary
    const titleType = isLeaf ? 'api' : (parentId ? 'cat2' : 'cat1');

    let titleContent;

    if (titleType === 'api') {
      titleContent = (
        <Link to={`/app/api?appId=${appId}&apiId=${id}`} style={{ display: 'block' }}>
          {title}
          <span className={styles.btns}>
            <Tooltip placement="top" title="删除接口">
              <span onClick={(e) => {
                Modal.confirm({
                  title: '确定删除该接口？',
                  content: '注意：删除后不可恢复！',
                  onOk: () => api.app.api
                    .delete({ id })
                    .then(() => {
                      if (apiId === id) {
                        history.push(`/app/api?appId=${appId}`);
                      }
                      fetchAppApiList();
                    }),
                });
                e.stopPropagation();
                e.preventDefault();
              }}
              ><DeleteOutlined />
              </span>
            </Tooltip>
          </span>
        </Link>
      );
    } else {
      titleContent = (
        <span>
          {title}
          <span className={styles.btns}>
            <Tooltip placement="top" title="添加接口">
              <span onClick={(e) => {
                ApiCreateDialog.open(id);
                e.stopPropagation();
              }}
              ><PlusCircleOutlined />
              </span>
            </Tooltip>
            {
              key !== '#' && titleType === 'cat1' && (
                <Tooltip
                  placement="top"
                  title="添加子分类"
                >
                  <span onClick={(e) => {
                    CategoryCreateDialog.open(id);
                    e.stopPropagation();
                  }}
                  ><PlusOutlined />
                  </span>
                </Tooltip>
              )
            }
            {key !== '#' && (
              <Tooltip placement="top" title="修改分类">
                <span onClick={(e) => {
                  CategoryModifyDialog.open({ categoryId: id, name: title });
                  e.stopPropagation();
                }}
                ><EditOutlined />
                </span>
              </Tooltip>
            )}
            {key !== '#' && (
              <Tooltip placement="top" title="删除分类">
                <span onClick={(e) => {
                  Modal.confirm({
                    title: '确定删除该分类？',
                    content: '删除分类不会删除存在的接口',
                    onOk: () => api.app.category
                      .delete({ appId, id })
                      .then(() => {
                        fetchAppCategoryList();
                      }),
                  });
                  e.stopPropagation();
                }}
                ><DeleteOutlined />
                </span>
              </Tooltip>
            )}
          </span>
        </span>
      );
    }
    // console.info({ titleContent })
    return () => (
      <div className={styles[`${titleType}-title`]}>
        {titleContent}
      </div>
    );
  };
  return adapter({
    key: String,
    isLeaf: true,
    title: titleFactory,
    children: {
      key: String,
      isLeaf: true,
      title: titleFactory,
      children: {
        key: String,
        isLeaf: true,
        title: titleFactory,
      },
    },
  }, categorys);
}

function useDialogs ({ history, appId, apiId, fetchAppCategoryList, fetchAppApiList }) {
  const ApiCreateDialog = useApiCreateDialog({ history, appId, apiId, fetchAppApiList });
  const CategoryCreateDialog = useCategoryCreateDialog({ appId, fetchAppCategoryList });
  const CategoryModifyDialog = useCategoryModifyDialog({ appId, fetchAppCategoryList });
  return [
    <>
      <ApiCreateDialog />
      <CategoryCreateDialog />
      <CategoryModifyDialog />
    </>,
    { ApiCreateDialog, CategoryCreateDialog, CategoryModifyDialog },
  ] as [JSX.Element, Record<string, any>];
}

function useApiCreateDialog ({ history, appId, apiId, fetchAppApiList }) {
  const Form = useSMForm({
    initialValue: { appId, method: 0 },
    fields: [
      { type: 'hidden', name: 'appId', label: '应用id' },
      { type: 'hidden', name: 'categoryId', label: '分类id' },
      [ '接口名称', 'name', {
        maxlength: 20,
        rules: [
          { required: true, message: '请输入接口名称' },
        ],
      } ],
      [ '接口地址', 'path', {
        maxlength: 64,
        rules: [
          { required: true, message: '请输入接口地址' },
        ],
      } ],
      [ '请求方式', 'method', {
        type: 'select',
        options: [
          { label: 'GET', value: 0 },
          { label: 'POST', value: 1 },
        ],
        rules: [
          { required: true, message: '请选择请求方式' },
        ],
      } ],
    ],
    footer: null,
  });

  return useSMDialog({
    title: '创建API',
    render: () => <Form />,
    onOpen (categoryId) {
      Form.setValue({ categoryId });
    },
    onSubmit () {
      return Form.submit()
        .then((values) => api.app.api
          .create({ ...values, path: values.path.replace(/^\/+/, '') }))
        .then(() => {
          message.success('操作成功');
          fetchAppApiList();
          history.push(`/app/api?appId=${appId}&apiId=${apiId}`);
        });
    },
    afterClose () {
      Form.reset();
    },
  });
}

function useCategoryCreateDialog ({ appId, fetchAppCategoryList }) {
  const Form = useSMForm({
    initialValue: {
      appId,
      name: '',
    },
    fields: [
      [ '应用id', 'appId', { type: 'hidden' } ],
      [ '父分类id', 'parentId', { type: 'hidden' } ],
      [ '分类名称', 'name', {
        placeholder: '请输入分类名称',
        maxlength: 10,
        rules: [
          { required: true, message: '请输入分类名称' },
        ],
      } ],
    ],
    footer: null,
  });

  return useSMDialog({
    title: '添加分类',

    render: () => <Form />,
    onOpen (parentId) {
      Form.setValue({ parentId });
    },
    onSubmit () {
      return Form.submit()
        .then((values) => {
          api.app.category
            .create(values)
            .then(() => {
              message.success('操作成功');
              fetchAppCategoryList();
            });
        });
    },
    afterClose () {
      Form.reset();
    },
  });
}

function useCategoryModifyDialog ({ appId, fetchAppCategoryList }) {
  const Form = useSMForm({
    initialValue: {
      appId,
    },
    fields: [
      [ '应用id', 'appId', { type: 'hidden' } ],
      [ '分类id', 'categoryId', { type: 'hidden' } ],
      [ '分类名称', 'name', {
        maxlength: 10,
        rules: [
          { required: true, message: '请输入分类名称' },
        ],
      } ],
    ],
    footer: null,
  });

  return useSMDialog({
    title: '修改分类',

    render: () => <Form />,
    onOpen (values) {
      Form.setValue(values);
    },
    onSubmit () {
      return Form.submit()
        .then((values) => api.app.category.modify(values))
        .then(() => {
          message.success('操作成功');
          fetchAppCategoryList();
        });
    },
    afterClose () {
      Form.reset();
    },
  });
}
