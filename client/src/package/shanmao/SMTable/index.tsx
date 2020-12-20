import React, { useState, useEffect } from 'react';
import { Table } from 'antd';
import { ColumnType } from 'antd/lib/table/index';


interface SMTableAPI {
  readonly reload: () => void;
}

interface OCSourceData {
  page: number;
  pageSize: number;
  total: number;
  list: Array<unknown>;
}

type SMTableColumnNoraml = {
  visible?: boolean;
}

type SMTableColumn = SMTableColumnNoraml & ColumnType<unknown>

export interface SMTableProps {
  props?: Record<string, unknown>; // 传递组件的原生props
  dataSource: (params) => Promise<OCSourceData> | OCSourceData;
  columns: Array<SMTableColumn | [string, string, SMTableColumn?]>;
  rowKey?: (record) => string | number;

}

export default function useTable ({
  props = {},
  dataSource,
  rowKey = (record) => record.id,
  columns,
}: SMTableProps) {
  const [ loading, loadingSet ] = useState(false);
  const [ params, paramsSet ] = useState({
    page: 1,
    pageSize: 20,
    sortField: undefined,
    sortType: undefined,
  });
  const [ tableData, tableDataSet ] = useState({
    list: [],
    total: 0,
    pageSize: 20,
  });

  const api = createAPI();
  const jsx = (
    <Table
      {...props}
      {...createProps()}
      loading={loading}
      dataSource={tableData.list}
      onChange={onChange}
    />
  );


  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(fetchDataSource, [ params ]);

  return [ jsx, api ] as [JSX.Element, SMTableAPI];

  function createAPI (): SMTableAPI {
    return {
      reload () {
        if (loading) {
          return;
        }
        paramsSet({ ...params });
      },
    };
  }

  function createProps () {
    const externalProps: { [k: string]: unknown } = {
      rowKey,
      columns: transformColumns(columns),
    };

    externalProps.pagination = props.pagination === false ? false : {
      ...(props.pagination as Record<string, unknown>),
      current: params.page,
      pageSize: tableData.pageSize,
      total: tableData.total,
    };

    return externalProps;
  }

  // 拉取数据
  function fetchDataSource () {
    const result = dataSource(params);
    if (result instanceof Promise) {
      loadingSet(true);
      result
        .then((data) => {
          tableDataSet(data);
        })
        .catch(() => {
          // ...
        })
        .finally(() => {
          loadingSet(false);
        });
    } else {
      tableDataSet(result);
    }
  }

  function onChange (pagination, filters, { field, order }) {
    paramsSet((params) => {
      let page = pagination.current;

      // 排序条件发生变化
      if (params.sortType !== order || params.sortField && params.sortField !== field) {
        page = 1;
        if (!order) {
          field = undefined;
        }
      }

      return {
        page,
        pageSize: pagination.pageSize,
        sortField: field,
        sortType: order,
      };
    });
  }
}

// 数据转化
function transformColumns (columns) {
  const columnsNext = columns
    .map((column) => {
      if (Array.isArray(column)) {
        const [ title, dataIndex, option ] = column;
        const columnNext = { title, dataIndex };

        if (option) {
          Object.assign(columnNext, option);
        }

        return columnNext;
      }
      return column;
    })
    .filter((column) => {
      const { disabled } = column;
      // disabled配置项为非false或者为函数并且返回值非false
      if (!disabled || typeof disabled === 'function' && !disabled()) {
        return true;
      }
      return false;
    });

  return columnsNext;
}
