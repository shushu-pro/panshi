import React, { useEffect, useState } from 'react';
import { Card, Button } from 'antd';
import { useSMDialog, useSMTable } from '@/package/shanmao';
import { api } from '@/api';
import adapter from '@shushu.pro/adapter';
import DataXEditor from '@/component/Editor/DataXEditor';
import './index.less';

export default RequestInfo;

function RequestInfo ({ apiDetail, updateAPI }) {
  const ModifyDialog = useModifyDialog({ apiDetail, updateAPI });

  return (
    <Card
      className="RequestInfo"
      title="请求参数"
      extra={(
        <>
          <Button type="primary" style={{ marginRight: '8px' }} onClick={() => ModifyDialog.open()}>编辑</Button>
        </>
      )}
    >
      <RequestDoc apiDetail={apiDetail} />
      <ModifyDialog />
    </Card>
  );
}

function useModifyDialog ({ apiDetail, updateAPI }) {
  const hookDataXEditor = {
    value: apiDetail.reqData || '',
    onSave () {
      Dialog.submit();
    },
  };

  const Dialog = useSMDialog({
    title: '请求数据',
    width: 800,
    render: () => <DataXEditor hook={hookDataXEditor} />,
    onSubmit () {
      return api.app.api.modify({ id: apiDetail.id, reqData: hookDataXEditor.getValue() })
        .then(() => {
          updateAPI();
        });
    },
  });

  return Dialog;
}

function RequestDoc ({ apiDetail }) {
  const [ docList, docListSet ] = useState([]);

  useEffect(() => {
    if (apiDetail.mockReqDoc) {
      docListSet(transformData(apiDetail.mockReqDoc));
      Table.reload();
    }
  }, [ apiDetail.mockReqDoc ]);

  const Table = useSMTable({
    columns: [
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
        width: 300,
      },
      {
        title: '类型',
        dataIndex: 'types',
        key: 'types',
        width: 160,
      },
      {
        title: '必选',
        dataIndex: 'required',
        key: 'required',
        width: 60,
      },
      {
        title: '默认值',
        dataIndex: 'defaultValue',
        width: 120,
      },
      {
        title: '描述',
        dataIndex: 'description',
        // width: 320,
      },
    ],
    dataSource: () => ({
      total: 1,
      page: 1,
      pageSize: 10,
      list: docList,
    }),
    rowKey: 'key',
    props: {
      rowClassName: (record, index) => {
        if (!record) {
          return '';
        }
        return ({
          '-': 'state-remove',
          '+': 'state-add',
          '?': 'state-question',
          '!': 'state-warn',
        })[record.flag];
      },
      pagination: false,
    },

  });

  return <Table />;

  function transformData (data, parentKey = '') {
    const newData = adapter({
      key: [ (key) => `${parentKey}-${key}`, 'name' ],
      types: [
        { $value: (value) => value.filter((item) => item !== 'null') },
        { $key: 'required', $value: (value) => (value.includes('null') ? '否' : '是') },
      ],
      flag: true,
      description: true,
      children: (value, { row }) => transformData(value, `${parentKey}-${row.key}`),
    }, data);
    return newData;
  }
}
