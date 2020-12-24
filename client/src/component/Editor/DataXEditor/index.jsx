import React from 'react';
import MonacoEditor from '../MonacoEditor';
import './language';
import './index.less';

export default DataXEditor;

function DataXEditor (props) {
  const { hook } = props;
  hook.language = 'datax';
  hook.theme = 'datax';
  const nextProps = {
    ...props,
    hook,
  };
  return (<MonacoEditor {...nextProps} />);
}
