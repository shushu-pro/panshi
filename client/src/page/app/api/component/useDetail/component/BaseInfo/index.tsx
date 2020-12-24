import { api, mockapi } from '@/api';
import { useSMDialog, useSMForm } from '@/package/shanmao';
import { Button, Card, Modal, Input, Descriptions, message, Space, Timeline, Form } from 'antd';
import React, { useState, useEffect } from 'react';
import JSONEditor from '@/component/Editor/JSONEditor';

import { textCopy } from '@/util';
import { ClockCircleOutlined } from '@ant-design/icons';
import 'jsondiffpatch/dist/formatters-styles/annotated.css';
import 'jsondiffpatch/dist/formatters-styles/html.css';
import * as jsondiffpatch from 'jsondiffpatch';
// import './index.less';


export default BaseInfo;

function BaseInfo ({ appId, apiId, apiDetail, updateAPI }) {
  const [ isFavorite, isFavoriteSet ] = useState(false);
  const MockRequestDialog = useMockRequestDialog({ appId, apiDetail });
  const ModifyDialog = useModifyDialog({ appId, apiDetail, updateAPI });
  const HistoryListDialog = useHistoryListDialog({ apiId });

  useEffect(() => {
    if (apiId) {
      fetchFavoriteState();
    }
  }, [ apiId ]);

  return (
    <Card
      className="BaseInfo"
      title="基础信息"
      extra={(
        <Space>
          <Button type="primary" onClick={() => MockRequestDialog.open()}>查看MOCK</Button>
          <Button type="primary" onClick={() => ModifyDialog.open()}>编辑</Button>
          <Button type={isFavorite ? 'default' : 'primary'} onClick={favoriteToggle}>关注</Button>
          <Button type="primary" onClick={() => HistoryListDialog.open()}>操作记录</Button>
        </Space>
      )}
    >
      <Descriptions>
        <Descriptions.Item label="接口名称" span={3}>{ apiDetail.name }</Descriptions.Item>
        <Descriptions.Item label="接口地址" span={3}>
          <span title="点击复制" onClick={() => { textCopy(apiDetail.path, () => message.success('接口地址已经复制')); }}>{ apiDetail.path }</span>
        </Descriptions.Item>
        <Descriptions.Item label="请求方式">{ apiDetail.methodText }</Descriptions.Item>
        <Descriptions.Item label="接口描述">{ apiDetail.description || '-' }</Descriptions.Item>
      </Descriptions>
      <MockRequestDialog />
      <ModifyDialog />
      <HistoryListDialog />
      {/* <SMDialog hook={hookMockDialog} />
      <SMDialog hook={hookEditDialog} />
      <SMDialog hook={hookHistoryDialog} />
      <SMDialog hook={hookDiffDialog} /> */}
    </Card>
  );


  function favoriteToggle () {
    api.user.favorite.api[isFavorite ? 'remove' : 'add']({ apiId })
      .then(() => {
        fetchFavoriteState();
      });
  }

  function fetchFavoriteState () {
    api.user.favorite.api.enabled({ apiId })
      .then((state) => {
        isFavoriteSet(state);
      });
  }
}

function useMockRequestDialog ({ appId, apiDetail }) {
  const [ requestState, requestStateSet ] = useState(0);
  const [ mockResponseData, mockResponseDataSet ] = useState('');
  const mockResponseJSONEditor = {
    value: mockResponseData,
    format: true,
  };
  const mockRequestParamsJSONEditor = {
    value: JSON.stringify(apiDetail.mockReqData),
    format: true,
    height: 190,
  };

  return useSMDialog({
    title: '请求mock数据',
    width: 800,
    props: {
      okText: '发起请求',
    },
    render () {
      let content = null;
      if (requestState === 2) {
        content = <JSONEditor hook={mockResponseJSONEditor} />;
      } else {
        content = <div style={{ height: '260px' }}>{[ '等待请求...', '数据请求中...' ][requestState]}</div>;
      }
      return (
        <div>
          <h4>请求参数：</h4>
          <JSONEditor hook={mockRequestParamsJSONEditor} />
          <h4 style={{ marginTop: '8px' }}>响应数据：</h4>
          {content}
        </div>
      );
    },
    onOpen () {
      requestStateSet(0);
    },
    onSubmit ({ unlockSubmit }) {
      return new Promise((resolve, reject) => {
        let sendData;
        try {
          sendData = JSON.parse(mockRequestParamsJSONEditor.getValue());
        } catch (err) {
          unlockSubmit();
          return message.error('请求参数错误，请检查输入的是否符合JSON格式');
        }

        requestStateSet(1);
        mockapi
          .send(sendData, { method: apiDetail.methodText, url: `${appId}/${apiDetail.path}` })
          .then((data) => {
            mockResponseDataSet(JSON.stringify(data));
            requestStateSet(2);
          })
          .finally(() => {
            unlockSubmit();
          });
      });
    },
  });
}

function useModifyDialog ({ appId, apiDetail, updateAPI }) {
  const Form = useSMForm({
    fields: [
      {
        label: '接口名称',
        name: 'name',
        maxlength: 20,
        rules: [ { required: true, message: '请输入接口名称' } ],
      },
      {
        label: '接口地址',
        name: 'path',
        maxlength: 20,
        rules: [ { required: true, message: '请输入接口地址' } ],
      },
      {
        label: '请求方式',
        name: 'method',
        type: 'select',
        options: [
          { label: 'GET', value: 0 },
          { label: 'POST', value: 1 },
          { label: 'PUT', value: 2 },
          { label: 'DELETE', value: 3 },
          { label: 'OPTION', value: 4 },
        ],
        rules: [ { required: true, message: '请选择请求方式' } ],
      },
      [
        '接口描述', 'description', {
          maxlength: 256,
          render: () => (<Input.TextArea maxLength={256} />),
        },
      ],
    ],
    footer: null,
  });

  return useSMDialog({
    title: '修改基础信息',
    render: () => <Form />,
    onOpen () {
      Form.setValue({
        name: apiDetail.name,
        path: apiDetail.path,
        method: apiDetail.method,
        description: apiDetail.description,
      });
    },
    onSubmit () {
      return Form.submit()
        .then((values) => api.app.api.modify({ ...values, path: values.path.replace(/^\/+/, ''), id: apiDetail.id }))
        .then(() => updateAPI(true));
    },
  });
}

function useHistoryListDialog ({ apiId }) {
  const [ TimelineJSX, TimelineJSXSet ] = useState(null);
  const [ html, htmlSet ] = useState('');
  const HistoryDetailDialog = useSMDialog({
    title: '修改信息',
    render () {
      // eslint-disable-next-line react/no-danger
      return (<div dangerouslySetInnerHTML={{ __html: html }} />);
    },
  });
  const Dialog = useSMDialog({
    title: '操作记录',
    width: 800,
    render () {
      return (
        <div style={{ maxHeight: '600px', overflowY: 'scroll', paddingTop: '10px' }}>
          {TimelineJSX}
          <HistoryDetailDialog />
        </div>
      );
    },
    onOpen () {
      fetchHistory();
    },
  });


  useEffect(() => {
    if (apiId) {
      fetchHistory();
    }
  }, [ apiId ]);

  return Dialog;

  function fetchHistory () {
    Dialog.setContentLoading(true);
    api.history.api.list({ page: 1, apiId })
      .then(({ list }) => {
        const timelineItems = [];
        list.forEach(({ createTime, operatorId, historyId, nick, type }) => {
          const color = ({ 'api.create': 'green', 'api.modify': 'blue' })[type];
          timelineItems.push(
            {
              id: `${historyId}#1`,
              color,
              dot: <ClockCircleOutlined />,
              content: createTime,
            },
            {
              id: `${historyId}#2`,
              color,
              content: ({
                'api.create': `"${nick}"创建了接口`,
                'api.modify': (
                  <>
                    <span style={{ marginRight: '8px' }}>"{nick}"修改了接口</span>
                    <span
                      style={{ color: '#40a9ff', cursor: 'pointer' }}
                      onClick={() => {
                        api.history.api.data({ historyId }).then(({ left, right }) => {
                          // const left = { left: 12 };
                          const delta = jsondiffpatch.diff(left, right);
                          htmlSet(jsondiffpatch.formatters.html.format(delta, left));
                          HistoryDetailDialog.open();
                        });
                      }}
                    >查看详情
                    </span>
                  </>
                ),
                'api.move': (
                  <>
                    <span style={{ marginRight: '8px' }}>"{nick}"移动了接口</span>
                    <span style={{ color: '#40a9ff', cursor: 'pointer' }} onClick={() => null}>查看详情</span>
                  </>
                ),
              })[type],
            }
          );
        });

        TimelineJSXSet(
          <Timeline>{
            timelineItems.map(({ id, color, dot, content }) => (
              <Timeline.Item key={id} color={color} dot={dot}>{content}</Timeline.Item>
            ))
          }
          </Timeline>
        );
      })
      .finally(() => {
        Dialog.setContentLoading(false);
      });
  }
}
