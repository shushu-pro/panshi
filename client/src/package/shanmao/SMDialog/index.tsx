import React, { useState, useEffect } from 'react';
import { Modal, Spin } from 'antd';

interface SMDialogInterface {
  (): JSX.Element;
  readonly open?: (params?) => void;
  readonly close?: () => void;
  readonly submit?: () => void;
  readonly unlockSubmit?: () => void;
  readonly setContentLoading?: (loading: boolean) => void;
}

export type SMDialogProps = {
  title: string;
  render(api?: SMDialogInterface): React.ReactNode

  width?: number;
  loading?: boolean;
  onOpen?(api?: SMDialogInterface, params?): void; // 打开窗口
  onSubmit?(api?: SMDialogInterface): void | false | Promise<any>; // 确定按钮的回调
  onClose?(api?: SMDialogInterface): void; // 关闭触发，可以被拦截
  afterClose?(api?: SMDialogInterface): void; // 关闭窗口后触发

  props?: Record <string, unknown>; // 传递组件的原生props
}

const propsKey = Symbol('propsKey');

function useSMDialog (props: SMDialogProps) {
  // useEffect(() => {
  //   console.info('SMDialog.init');
  // }, []);

  const SMDialogFactory: SMDialogInterface = () => {
    const {
      props = {},
      title,
      width,
      loading = false,

      render,
      onOpen,
      onSubmit,
      onClose,
      afterClose,
    } = SMDialog[propsKey];

    const [ visible, visibleSet ] = useState(false);
    const [ contentLoading, contentLoadingSet ] = useState(false);
    const [ submitLoading, submitLoadingSet ] = useState(false);
    const [ openParams, openParamsSet ] = useState();

    // console.info('SMDialog.render');

    useEffect(() => {
      contentLoadingSet(loading);
    }, [ loading ]);

    useEffect(() => {
      if (visible) {
        onOpen && onOpen(SMDialog, openParams);
      }
    }, [ visible ]);

    // useEffect(() => {
    //   console.info('SMDialog.mouted');
    // }, []);

    exportAPI();

    return (
      <Modal
        maskClosable={false}
        {...props}
        {...createExternalProps(SMDialog)}
      >
        <Spin spinning={contentLoading}>
          {render(SMDialog)}
        </Spin>
      </Modal>
    );

    function exportAPI () {
      Object.assign(SMDialog, {
        open (params) {
          openParamsSet(params);
          visibleSet(true);
        },
        submit () {
          hide(onSubmit && onSubmit(SMDialog));
        },
        close () {
          hide(onClose && onClose());
        },
        unlockSubmit () {
          setTimeout(() => {
            submitLoadingSet(false);
          });
        },
        setContentLoading (loading) {
          contentLoadingSet(loading);
        },
      });
    }

    function createExternalProps (innerAPI) {
      const externalProps: { [k: string]: unknown } = {
        title,
        width,
        visible,
        okButtonProps: {},
        cancelButtonProps: {},
      };

      if (onSubmit) {
        externalProps.onOk = () => innerAPI.submit();
      }

      if (onClose || !props.onCancel) {
        externalProps.onCancel = () => innerAPI.close();
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
  };

  const [ SMDialog ] = useState(() => SMDialogFactory);

  SMDialog[propsKey] = props;

  return SMDialog;
}

export default useSMDialog;
