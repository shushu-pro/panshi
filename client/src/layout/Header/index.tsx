import React from 'react';
import { Link } from 'react-router-dom';
import { Tooltip, Space, Menu } from 'antd';
import { QuestionCircleOutlined, DropboxOutlined } from '@ant-design/icons';
import { useRoute } from '@/router';
import styles from './index.less';
import Logo from './img/logo.svg';
import Avatar from './component/Avatar';


export default Header;

function Header () {
  return (
    <div className={styles.Header}>
      {renderLogo()}
      {renderNavBar()}
      {renderRight()}
    </div>
  );

  function renderLogo () {
    return (
      <div style={{ display: 'flex' }}>
        <h1 className={styles.logo}>
          <Link to="/">
            <img src={Logo} alt="logo" />
            磐石API
          </Link>
        </h1>
      </div>
    );
  }

  function renderNavBar () {
    const { path } = useRoute();
    let menuKey = path;
    if (/^\/manager\/permisstion/.test(path)) {
      menuKey = '/manager/permisstion';
    }

    return (
      <Menu className={styles.navBar} selectedKeys={[ menuKey ]} mode="horizontal">

        <Menu.Item key="/manager/user" icon={<QuestionCircleOutlined />}>
          <Link to="/manager/user">用户管理</Link>
        </Menu.Item>

        <Menu.Item key="/manager/permisstion" icon={<DropboxOutlined />}>
          <Link to="/manager/permisstion">权限管理</Link>
        </Menu.Item>
      </Menu>
    );
  }


  function renderRight () {
    return (
      <Space className={styles.right}>
        {/* <Help />
        <Message /> */}
        <Avatar />
      </Space>
    );
  }
}
