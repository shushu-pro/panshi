import React from 'react';
import { Avatar, Dropdown, Menu } from 'antd';
import { useHistory } from 'react-router-dom';
import { UserOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import user from '@/page/user/exports';

import HeaderStyles from '../../index.less';
import styles from './index.less';

// const mapStateToProps = ({ user }) => ({
//   user,
// });

// const mapDispatchToProps = (dispatch) => ({
//   logout: () => dispatch('user.logout'),
// });

// export default connect(mapStateToProps, mapDispatchToProps)(MyAvatar);

export default MyAvatar;

function MyAvatar () {
  // const userInfo = user.useInfo();
  const userInfo = {};

  return (
    <div className={HeaderStyles.action}>
      <Dropdown overlay={<Overlay />}>
        <div>
          <Avatar size="small" className={styles.avatar} src={userInfo.avatar} alt="avatar" />
          <span>{userInfo.nick}</span>
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
      // if (key === 'logout') {
      //   return logout().then(() => {
      //     history.push('/login');
      //   });
      // }

      // history.push(`/user/${key}`);
    }
  }
}
