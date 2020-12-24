import React from 'react';
import MonacoEditor from '../MonacoEditor';

export default JSONEditor;

function JSONEditor (props) {
  const { hook } = props;
  hook.language = 'json';
  const nextProps = {
    ...props,
    hook,
  };
  return (<MonacoEditor {...nextProps} />);
}
