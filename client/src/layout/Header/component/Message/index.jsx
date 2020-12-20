import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Dropdown, List, Spin, Tabs, Tag } from 'antd';

import { BellOutlined } from '@ant-design/icons';
import { api } from '@/api';
import HeaderStyles from '../../index.less';
import styles from './index.less';

let timer;

export default Message;

function Message () {
  const [ visible, visibleSet ] = useState(false);
  const [ messageList, messageListSet ] = useState([]);
  const [ loading, loadingSet ] = useState(false);

  useEffect(() => {
    fetchMessage();
    timer = setInterval(() => {
      fetchMessage();
    }, 30000);
    return () => {
      clearInterval(timer);
    };
  }, []);


  return (
    <div className={HeaderStyles.action}>
      <Dropdown overlay={<Overlay />} placement="bottomCenter" visible={visible} onVisibleChange={onVisibleChange}>
        <Badge
          count={messageList.length}
          style={{
            boxShadow: 'none',
          }}
        >
          <BellOutlined />
        </Badge>
      </Dropdown>
    </div>
  );

  function Overlay () {
    return (
      <div className={styles.dropbox}>
        <Spin spinning={loading} delay={300}>
          <Tabs defaultActiveKey="1" centered>
            <Tabs.TabPane tab="通知" key="1">
              <List className={styles.list}>
                {messageList.length > 0 ? (
                  messageList.map(({ id, path, text }) => (
                    <List.Item key={id}>
                      <Link to={path}>{text}</Link>
                      <Tag color="warning" style={{ cursor: 'pointer' }} onClick={() => closeMessage(id)}>关闭</Tag>
                    </List.Item>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '8px' }}>暂无信息...</div>
                )}
              </List>
            </Tabs.TabPane>
          </Tabs>
        </Spin>
      </div>
    );
  }

  function closeMessage (id) {
    loadingSet(true);
    api.user.message.api.delete({ id })
      .then(() => {
        fetchMessage();
      })
      .finally(() => {
        loadingSet(false);
      });
  }

  function onVisibleChange (visible) {
    visibleSet(visible);
    if (visible) {
      fetchMessage();
      // messageListSet([
      //   { id: '1', path: '/prject/1/api/1', text: 'API1已更新' },
      //   { id: '2', path: '/prject/1/api/2', text: 'API2已更新' },
      //   { id: '3', path: '/prject/1/api/3', text: 'API3已更新' },
      // ]);
    }
  }

  function fetchMessage () {
    loadingSet(true);
    api.user.message.api
      .list()
      .then(({ list }) => {
        messageListSet(list.map(({ id, appId, apiId, name }) => ({
          id,
          text: `接口“${name}”已更新`,
          path: `/app/api?appId=${appId}&apiId=${apiId}`,
        })));
      })
      .finally(() => {
        loadingSet(false);
      });
  }
}
