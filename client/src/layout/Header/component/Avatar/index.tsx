import React from 'react';
import { Avatar, Dropdown, Menu } from 'antd';
import { useHistory } from 'react-router-dom';
import { UserOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import user from '@/page/user';

import HeaderStyles from '../../index.less';
import styles from './index.less';

export default MyAvatar;

function MyAvatar () {
  const { info } = user.getUserInfo();
  const logout = user.useLogout();

  return (
    <div className={HeaderStyles.action}>
      <Dropdown overlay={<Overlay />}>
        <div>
          <Avatar size="small" className={styles.avatar} src={info.avatar} alt="avatar" />
          <span>{info.nick}</span>
        </div>
      </Dropdown>
    </div>
  );

  function Overlay () {
    const history = useHistory();
    return (
      <div className={styles.dropMenu}>
        <Menu onClick={onMenuClick}>
          <Menu.Item key="center">  <UserOutlined /> 个人中心 </Menu.Item>
          <Menu.Item key="settings"> <SettingOutlined /> 个人设置 </Menu.Item>
          <Menu.Divider />
          <Menu.Item key="logout"> <LogoutOutlined />退出登录 </Menu.Item>
        </Menu>
      </div>
    );

    function onMenuClick ({ key }) {
      if (key === 'logout') {
        logout()
          .then(() => {
            history.push('/login');
          });
        return;
      }

      history.push(`/user/${key}`);
    }
  }
}
