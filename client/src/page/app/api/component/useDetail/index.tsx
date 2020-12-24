
import React, { useEffect, useState } from 'react';
import { Layout, Result, Spin } from 'antd';
import { SmileOutlined } from '@ant-design/icons';
// import tower from '@/package/tower';
import { api, mockapi } from '@/api';
import styles from './index.less';
import BaseInfo from './component/BaseInfo';
import RequestInfo from './component/RequestInfo';
import ResponseInfo from './component/ResponseInfo';

export default useDetail;

function useDetail ({ appId, apiId, fetchAppApiList }) {
  const [ loading, loadingSet ] = useState(false);
  const [ apiDetail, apiDetailSet ] = useState({});

  useEffect(() => {
    if (apiId) {
      fetchApiDetail();
    }
  }, [ apiId ]);

  let content = null;

  if (!apiId || !apiDetail) {
    content = (<Result icon={<SmileOutlined />} title="点击左侧菜单查看接口信息!" />);
  } else {
    content = (
      <>
        <BaseInfo appId={appId} apiId={apiId} apiDetail={apiDetail} updateAPI={updateAPI} />
        <RequestInfo apiDetail={apiDetail} updateAPI={updateAPI} />
        <ResponseInfo apiDetail={apiDetail} updateAPI={updateAPI} />
      </>
    );
  }

  return [
    <Layout className={styles.wrapper}>
      <Spin tip="加载中..." spinning={loading}>
        <div className={styles.content}>
          {content}

          {/*
          <RequestInfo apiDetail={apiDetail} updateAPI={updateAPI} />
          <ResponseInfo apiDetail={apiDetail} updateAPI={updateAPI} /> */}
        </div>
      </Spin>
    </Layout>,
  ];

  function fetchApiDetail () {
    loadingSet(true);
    api.app.api
      .detail({ id: apiId })
      .then((data) => {
        apiDetailSet(data);
      })
      .finally(() => {
        loadingSet(false);
      });
  }

  function updateAPI () {
    fetchAppApiList();
    fetchApiDetail();
  }
}

function ApiDetail2 ({ appId, apiId }) {
  const [ loading, loadingSet ] = useState(false);
  const [ apiDetail, apiDetailSet ] = useState({});

  useEffect(() => {
    if (apiId) {
      fetchApiDetail();
    }
  }, [ apiId ]);

  return (
    <Layout className={styles.content}>
      {content()}
    </Layout>
  );

  function content () {
    if (!apiId) {
      return (
        <Result
          icon={<SmileOutlined />}
          title="点击左侧菜单查看接口信息!"
        />
      );
    }

    return (
      <Spin tip="加载中..." spinning={loading}>
        <div className={styles.apiContent}>
          <BaseInfo appId={appId} apiDetail={apiDetail} updateAPI={updateAPI} />

          <ResponseInfo apiDetail={apiDetail} updateAPI={updateAPI} />
        </div>
      </Spin>
    );
  }

  function fetchApiDetail (params) {
    loadingSet(true);
    api.app.api
      .detail({ id: apiId })
      .then((data) => {
        apiDetailSet(data);
      })
      .finally(() => {
        loadingSet(false);
      });
  }

  function updateAPI (API_UPDATE) {
    if (API_UPDATE) {
      tower.send('API_UPDATE');
    }
    fetchApiDetail();
  }
}
