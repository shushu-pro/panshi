import React from 'react';
import { Tabs, Button } from 'antd';
import { AppleOutlined, AndroidOutlined } from '@ant-design/icons';
import { hasAuth } from '@/page/user';
import { useRoute } from '@/router';
import { useHistory } from 'react-router-dom';
import useApps from './component/useApps';
import useProjects from './component/useProjects';
import styles from './index.less';

export default function UserCenter () {
  const route = useRoute();
  const history = useHistory();
  const { params: { type: tabKey } } = route;

  const [ appsJSX, apps ] = useApps();
  const [ projectsJSX, projects ] = useProjects();

  return (
    <div className={styles.content}>
      <Tabs defaultActiveKey={tabKey} tabBarExtraContent={{ right: <RightButton /> }} onChange={tabChange}>
        <Tabs.TabPane className={styles.space} tab={<div style={{ margin: '4px 16px' }}><AppleOutlined />我的应用</div>} key="apps">
          {appsJSX}
        </Tabs.TabPane>
        <Tabs.TabPane className={styles.space} tab={<div style={{ margin: '4px 16px' }}> <AndroidOutlined />我的项目</div>} key="projects">
          {projectsJSX}
        </Tabs.TabPane>
      </Tabs>
    </div>
  );

  function RightButton () {
    const buttonText = ({
      apps: '添加应用',
      projects: '添加项目',
    })[tabKey];

    return (
      <div style={{ marginRight: '10px' }}>
        {hasAuth('app.create') && <Button type="primary" onClick={openCreateDialog}>{buttonText}</Button>}
      </div>
    );

    function openCreateDialog () {
      console.info(projects);
      ({
        apps: () => apps.openCreateDialog(),
        projects: () => projects.openCreateDialog(),
      })[tabKey]();
    }
  }

  function tabChange (tabKey) {
    history.push(`./${tabKey}`);
  }
}
