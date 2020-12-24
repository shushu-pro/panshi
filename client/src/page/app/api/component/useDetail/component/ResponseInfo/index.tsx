import React, { useEffect } from 'react';
import { Card, Button, Table } from 'antd';

import './index.less';
import { useSMDialog } from '@/package/shanmao';
import { api } from '@/api';
import adapter from '@shushu.pro/adapter';
import DataXEditor from '@/component/Editor/DataXEditor';

export default ResponseInfo;

function ResponseInfo ({ apiDetail, updateAPI }) {
  const hookDataXEditor = {
    value: apiDetail.resData || '',
    onSave () {
      // eslint-disable-next-line no-use-before-define
      ModifyDialog.submit();
    },
  };
  const ModifyDialog = useSMDialog({
    title: '响应数据',
    width: 800,
    render: () => <DataXEditor hook={hookDataXEditor} />,
    onSubmit () {
      return api.app.api.modify({ id: apiDetail.id, resData: hookDataXEditor.getValue() })
        .then(() => {
          updateAPI();
        });
    },
  });

  return (
    <Card
      className="ResponseInfo"
      title="响应数据"
      extra={(
        <>
          <Button type="primary" style={{ marginRight: '8px' }} onClick={() => ModifyDialog.open()}>编辑</Button>
        </>
      )}
    >
      {renderTable()}
      <ModifyDialog />
    </Card>
  );

  function renderTable () {
    const hookTable = {
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
      dataSource: transformData(apiDetail.mockResDoc),
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
    };

    return (<Table {...hookTable} pagination={false} />);

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
}
