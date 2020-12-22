import React, { useEffect, useState } from 'react';
import { List, Card } from 'antd';
import { useSMForm, useSMDialog } from '@/package/shanmao';
import { useHistory } from 'react-router-dom';
import { api } from '@/api';
import cover1 from './img/cover/gLaIAoVWTtLbBWZNYEMg.png';
import cover2 from './img/cover/iXjVmWVHbCJAyqvDxdtx.png';
import cover3 from './img/cover/iZBVOIhGJiAnhplqjvZW.png';
import cover4 from './img/cover/uMfMFlvUuceEyPpotzlq.png';


export default useApps;

function useApps () {
  let exportJSX = null;
  const exportAPI = createAPI();

  const [ appListJSX, { fetchAppList } ] = useAppList();

  const [ CreateDialog, createDialog ] = useCreateDialog({
    fetchAppList,
  });

  exportJSX = (
    <>
      {appListJSX}
      <CreateDialog />
    </>
  );

  return [ exportJSX, exportAPI ];

  function createAPI () {
    return {
      openCreateDialog () {
        createDialog.open();
      },
    };
  }
}

function useAppList () {
  const history = useHistory();
  const [ appList, appListSet ] = useState([]);
  const [ loading, loadingSet ] = useState(false);
  let jsx = null;

  // 拉取应用列表
  useEffect(() => {
    fetchAppList();
  }, []);

  if (appList.length === 0) {
    jsx = (
      <div>
        暂无应用，请联系平台管理添加
      </div>
    );
  } else {
    jsx = (
      <List
        rowKey="id"
        loading={loading}
        grid={{
          gutter: 16,
          xs: 1,
          sm: 2,
          md: 3,
          lg: 3,
          xl: 4,
          xxl: 4,
        }}
        dataSource={appList}
        renderItem={(item) => (
          <List.Item>
            <Card hoverable cover={<img alt={item.name} src={item.cover} />} onClick={() => history.push(`/app?id=${item.id}`)}>
              <Card.Meta
                title={<h3>{item.name}</h3>}
                description={
                  <div>{item.description}</div>
                }
              />
            </Card>
          </List.Item>
        )}
      />
    );
  }

  return [ jsx, { fetchAppList } ];

  function fetchAppList () {
    loadingSet(true);
    api.app.list()
      .then(({ list }) => {
        list.forEach((item) => {
          item.cover = [ cover1, cover2, cover3, cover4 ][Math.floor(Math.random() * 4)];
          item.description = item.description || item.name;
        });
        appListSet(list);
      })
      .finally(() => {
        loadingSet(false);
      });
  }
}

function useCreateDialog ({ fetchAppList }) {
  const [ Form, form ] = useSMForm({
    fields: [
      { label: '应用名称', name: 'name', maxlength: 20, rules: [ { required: true, message: '请输入应用名称' } ] },
      { label: '应用描述', name: 'description', maxlength: 40, rules: [ ] },
    ],
    footer: null,
  });

  return useSMDialog({
    title: '创建应用',
    render: () => <Form />,
    onSubmit () {
      return form.submit()
        .then((values) => api.app.create(values))
        .then(() => {
          fetchAppList();
        });
    },
    afterClose () {
      form.reset();
    },
  });
}
