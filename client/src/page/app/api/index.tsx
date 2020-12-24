import React from 'react';
import { Layout } from 'antd';
import { useRoute } from '@/router';
import useSidebar from './component/useSidebar';
import useDetail from './component/useDetail';
// import Sidebar from '../Sidebar';
// import ApiDetail from './ApiDetail';

export default Api;

function Api () {
  const { query } = useRoute();
  const appId = Number(query.appId);
  const apiId = Number(query.apiId);

  const [ sidebarJSX, { fetchAppApiList } ] = useSidebar({
    appId, apiId,
  });

  const [ detailJSX ] = useDetail({ appId, apiId, fetchAppApiList });

  return (
    <Layout>
      {sidebarJSX}
      {detailJSX}
    </Layout>
  );
}
