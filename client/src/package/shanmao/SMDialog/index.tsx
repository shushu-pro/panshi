import React, { useEffect, useState } from 'react';
import { Modal, Spin } from 'antd';

interface SMDialogAPI {
  readonly open: () => void;
  readonly close: () => void;
  readonly submit: () => void;
}

export interface SMDialogProps {
  title: string;
  render(): React.ReactNode

  width?: number;
  loading?: boolean;
  onOpen?(): void; // 打开窗口
  onSubmit?(): void; // 确定按钮的回调
  onClose?(): void; // 关闭触发，可以被拦截
  afterClose?(): void; // 关闭窗口后触发

  props?: Record <string, unknown>; // 传递组件的原生props
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function SMDialog (props: SMDialogProps) {
  // ...
}

export default function useSMDialog ({
  props = {},
  title,
  width,
  loading = false,

  render,
  onOpen,
  onSubmit,
  onClose,
  afterClose,
}: SMDialogProps) {
  const [ visible, visibleSet ] = useState(false);
  const [ contentLoading, contentLoadingSet ] = useState(false);
  const [ submitLoading, submitLoadingSet ] = useState(false);

  useEffect(() => {
    contentLoadingSet(loading);
  }, [ loading ]);

  useEffect(() => {
    if (visible) {
      onOpen && onOpen();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ visible ]);

  const jsx = (
    <Modal
      maskClosable={false}
      {...props}
      {...createExternalProps()}
    >
      <Spin spinning={contentLoading}>
        {render()}
      </Spin>
    </Modal>
  );

  const api = createAPI();

  return [ jsx, api ] as [JSX.Element, SMDialogAPI];

  function createAPI (): SMDialogAPI {
    return {
      open () {
        visibleSet(true);
      },
      submit () {
        hide(onSubmit && onSubmit());
      },
      close () {
        hide(onClose && onClose());
      },
    };
  }

  function createExternalProps () {
    const externalProps: { [k: string]: unknown } = {
      title,
      width,
      visible,
      okButtonProps: {},
      cancelButtonProps: {},
    };

    if (onSubmit) {
      externalProps.onOk = () => api.submit();
    }

    if (onClose || !props.onCancel) {
      externalProps.onCancel = () => api.close();
    }

    if (afterClose) {
      externalProps.afterClose = afterClose;
    }

    Object.assign(externalProps.okButtonProps, props.okButtonProps, {
      loading: submitLoading,
    });

    Object.assign(externalProps.cancelButtonProps, props.cancelButtonProps, {
      loading: submitLoading,
    });

    return externalProps;
  }

  function hide (result) {
    if (result instanceof Promise) {
      submitLoadingSet(true);
      result.then(() => {
        visibleSet(false);
      }).finally(() => {
        submitLoadingSet(false);
      });
    } else if (result !== false) {
      visibleSet(false);
    }
  }
}
