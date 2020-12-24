import React from 'react';
import { Tabs } from 'antd';
import { useRoute } from '@/router';
import Info from './Info';
import Member from './Member';

export default AppInfo;

function AppInfo () {
  const { query: { appId } } = useRoute();
  return (
    <>
      <Tabs style={{ margin: '20px' }} defaultActiveKey="member">
        <Tabs.TabPane tab="基础信息" key="info">
          <Info appId={appId} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="用户管理" key="member">
          <Member appId={appId} />
        </Tabs.TabPane>
      </Tabs>
    </>
  );
}
