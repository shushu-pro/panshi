import React, { useEffect, useState } from 'react';
import { Button, Layout, message, Tree, Tooltip, Modal } from 'antd';
import { useRouteMatch, Link, useHistory } from 'react-router-dom';
import { useSMDialog, useSMForm } from '@/package/shanmao';
import { hasAuth } from '@/page/user';
import { api } from '@/api';
import adapter from '@shushu.pro/adapter';
import { PlusCircleOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
// import tower from '@/package/tower';
import { AnyAction } from 'redux';
import styles from './index.less';

export default useSidebar;

type ExportAPI = {
  noop: () => void;
}

function useSidebar ({ apiId, appId }) {
  let exportJSX = null;
  const exportAPI = createAPI();

  const [ sidebarTop, sidebarTopSet ] = useState(65);
  const [ { appDetail } ] = useDataState({ appId });

  const [ topbarJSX, topbar ] = useTopbar({
    appId, appDetail,
  });
  const [ APITreeJSX, APITree ] = useAPITree({
    appId,
  });

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

  function createAPI (): ExportAPI {
    return {
      noop () {
        // ...
      },
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

function useTopbar ({ appId, appDetail }) {
  const history = useHistory();
  const [ ProjectCategoryCreateDialog, projectCategoryCreateDialog ] = useProjectCategoryCreateDialog({ appId });
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
          onClick={() => projectCategoryCreateDialog.open()}
        >
          添加分类
        </Button>

      </h3>
      <ProjectCategoryCreateDialog />
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

function useProjectCategoryCreateDialog ({ appId }) {
  const [ parentId, parentIdSet ] = useState();
  const [ Form, form ] = useSMForm({
    initialValue: {
      name: '',
    },
    gridLayout: {
      labelCol: { span: 6 },
      wrapperCol: { span: 17 },
    },
    fields: [
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
    onOpen (parentIdNext) {
      parentIdSet(parentIdNext);
    },
    onSubmit () {
      return form.submit()
        .then((values) => {
          api.app.category
            .create({
              appId,
              parentId,
              name: values.name,
            })
            .then(() => {
              message.success('操作成功');
            });
        });
    },
    afterClose () {
      form.reset();
    },
  });
}

// API菜单树
function useAPITree ({ appId }) {
  const exportAPI = createAPI();
  const [ treeData, treeDataSet ] = useState([]);

  const exportJSX = (
    <>
      <Tree.DirectoryTree
        draggable
        autoExpandParent
        treeData={treeData}
        // onDrop={onDrop}
      />
      {/* <SMDialog hook={hookCreateAPIDialog} />
    <SMDialog hook={hookModifyCategoryDialog} /> */}
    </>
  );

  return [ exportJSX, exportAPI ];

  function createAPI () {
    return {
      noop () {
        // ..
      },
    };
  }
}
