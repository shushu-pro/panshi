import React, { useEffect, useState } from 'react';
import * as monaco from 'monaco-editor';
import './index.less';

let globalMonacoReady = false;

export default MonacoEditor;

function MonacoEditor (props) {
  const { hook } = props;
  const [ editorValue, editorValueSet ] = useState(hook.value);
  const [ nextValue, nextValueSet ] = useState();
  const [ editorBox, editorBoxSet ] = useState(null);
  const [ editor, editorSet ] = useState(null);
  const [ monacoReady, monacoReadySet ] = useState(globalMonacoReady);
  const { height = 305, format, onSave } = hook;

  createExports();

  useEffect(() => {
    if (!monacoReady) {
      checkMonacoReady(() => monacoReadySet(true));
    }
  }, []);

  useEffect(() => {
    if (!editorBox) {
      return;
    }

    const { theme = 'vs-dark', language, readOnly, ...editorOptions } = hook;
    const nextEditor = monaco.editor.create(editorBox, {
      value: editorValue,
      theme,
      language,
      scrollBeyondLastLine: false,
      readOnly,
      autoIndent: 'brackets',
      ...editorOptions,
      // lineNumbers: 'off',
    });

    // eslint-disable-next-line no-bitwise
    nextEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, () => onEditorSave(nextEditor.getValue()));
    nextEditor.onDidChangeModelContent((e) => {
      editorValueSet(nextEditor.getValue());
    });
    if (format) {
      setTimeout(() => {
        nextEditor.trigger('格式化json', 'editor.action.formatDocument');
      });
    }

    // console.info('initEditor')
    editorSet(nextEditor);
    return () => {

    };
  }, [ editorBox ]);

  useEffect(() => {
    setEditorValue(nextValue);
  }, [ nextValue ]);

  useEffect(() => {
    setEditorValue(hook);
  }, [ hook.value ]);


  if (!monacoReady) {
    return null;
  }


  return (
    <div className="MonacoEditor">
      <div ref={(target) => editorBoxSet(target)} style={{ height: `${height}px`, border: '1px solid #666' }} />
    </div>
  );

  function onEditorSave (value) {
    onSave && onSave(value);
    // console.info('save', { value })
  }

  function createExports () {
    hook.setValue = (value) => {
      nextValueSet({ value });
    };

    hook.getValue = () => editorValue;
  }

  function setEditorValue (obj) {
    if (!editor) {
      return;
    }
    editor.setValue(obj.value);
    editorValueSet(obj.value);
    if (format) {
      setTimeout(() => {
        editor.trigger('格式化json', 'editor.action.formatDocument');
      });
    }
  }
}

function checkMonacoReady (ready) {
  if (typeof monaco === 'object') {
    globalMonacoReady = true;
    ready();
  } else {
    setTimeout(() => {
      checkMonacoReady(ready);
    }, 100);
  }
}

export {
  checkMonacoReady,
};
