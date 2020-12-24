import React, { useState, useEffect } from 'react';
import { Descriptions, Spin, Space, Button, message, Modal } from 'antd';
import { api } from '@/api';
import { useSMDialog, useSMForm } from '@/package/shanmao';
import { useHistory } from 'react-router-dom';

export default Info;

function Info ({ appId }) {
  const [ detail, detailSet ] = useState({});
  const [ loading, loadingSet ] = useState(false);
  const ModifyDialog = useModifyDialog();
  const history = useHistory();

  useEffect(() => {
    fetchDetail();
  }, []);

  return (
    <>
      <Spin spinning={loading} delay={500}>
        <Descriptions
          title="应用详情"
          style={{ marginBottom: 32 }}
          bordered
          extra={(
            <Button type="primary" onClick={() => ModifyDialog.open()}>修改</Button>
          )}
        >
          <Descriptions.Item label="应用名称">{detail.name}</Descriptions.Item>
          <Descriptions.Item label="应用描述">{detail.description}</Descriptions.Item>
          <Descriptions.Item label="创建时间">{detail.createTime}</Descriptions.Item>
        </Descriptions>
        <ModifyDialog />

        <Space>
          <Button danger onClick={deleteApp}>删除应用</Button>
        </Space>
      </Spin>

    </>
  );

  function fetchDetail () {
    loadingSet(true);
    api.app.detail({ id: appId })
      .then((detail) => {
        detailSet(detail);
      })
      .finally(() => {
        loadingSet(false);
      });
  }

  function deleteApp () {
    Modal.confirm({
      title: '确定删除该应用？',
      content: '只允许删除空应用',
      onOk: () => api.app
        .delete({ id: appId })
        .then(() => {
          history.push('/user/center/apps');
        }),
    });
  }

  function useModifyDialog () {
    const Form = useSMForm({
      initialValue: detail,
      fields: [
        { label: '应用名称', name: 'name', rules: [ { required: true } ] },
        { label: '应用描述', name: 'description' },
      ],
      footer: null,
    });

    return useSMDialog({
      title: '修改信息',
      render: () => <Form />,
      onOpen () {
        Form.setValue(detail);
      },
      onSubmit  () {
        return Form.submit()
          .then((values) => api.app.modify({
            id: appId,
            ...values,
          }))
          .then(() => {
            fetchDetail();
          });
      },
    });
  }
}
