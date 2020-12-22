import React from 'react';
import { Layout } from 'antd';
import { useRoute } from '@/router';
import useSidebar from './component/useSidebar';
// import Sidebar from '../Sidebar';
// import ApiDetail from './ApiDetail';

export default Api;

function Api () {
  const { query: { appId, apiId } } = useRoute();
  const [ sidebarJSX, sidebar ] = useSidebar({
    appId, apiId,
  });

  return (
    <>
      <Layout>kkkk
        {sidebarJSX}
        {/* <ApiDetail appId={appId} apiId={apiId} /> */}
      </Layout>
    </>
  );
}
