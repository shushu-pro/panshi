import React from 'react';
import { Tabs } from 'antd';
import { useRoute } from '@/router';
import { useHistory } from 'react-router-dom';
import Module from './component/Module';
import Role from './component/Role';


export default managePermission;

function managePermission () {
  const route = useRoute();
  const history = useHistory();
  const { params: { type: tabKey } } = route;

  return (
    <>
      <Tabs style={{ margin: '20px' }} defaultActiveKey={tabKey} onChange={tabChange}>
        <Tabs.TabPane tab="角色管理" key="role">
          <Role />
        </Tabs.TabPane>
        <Tabs.TabPane tab="模块管理" key="module">
          <Module />
        </Tabs.TabPane>
      </Tabs>
    </>
  );
  function tabChange (tabKey) {
    history.push(`./${tabKey}`);
  }
}
