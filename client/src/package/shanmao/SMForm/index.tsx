import React, { useEffect, useState } from 'react';
import { Form, Input, Radio, Checkbox, Select, Col, Row, Space, Button } from 'antd';
import { Rule } from 'antd/lib/form';
import { SelectProps } from 'antd/lib/select';

interface SMFormAPI {
  readonly reset: () => void;
  readonly submit: () => Promise<unknown>;
  readonly lockSubmit: () => void;
  readonly unlockSubmit: () => void;
  readonly setValue: (value) => void;
}

type CommonFieldConfig = {
  visible?: boolean | ((option) => boolean);
  type?: 'input'| 'select'| 'text' |'radio'| 'custom'|'password'| 'checkbox';
  options?: Array<{
    label: string;
    value: unknown;
  }>;

  render?(fieldConfig): React.ReactNode;
  trim?: boolean;
  rules?: Array<Rule>;
  dependencies?: Array<string>;
  disabled?: boolean | ((option) => boolean);

  props?: SelectProps<unknown>;
  maxlength?: number;
  placeholder?: string;
}

type FieldConfig = CommonFieldConfig & {
  name: string;
  label: string;
} | [string, string, CommonFieldConfig]

export interface SMFormProps {
  props?: Record<string, unknown>; // 传递组件的原生props
  initialValue?: Record<string, unknown>; // 组件的默认值
  value?: Record<string, unknown>; // 组件的值
  fields: Array<FieldConfig>;
  gridLayout?: {
    labelCol?: Record<string, unknown>;
    wrapperCol?: Record<string, unknown>;
  };
  footer?: JSX.Element;
  onSubmit?: (error, values) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function SMForm (props: SMFormProps) {
  // ...
}

type FCA = {
  (): JSX.Element;
  API: SMFormAPI
}

export default function useSMForm ({
  props = {},
  fields,
  initialValue = {},
  value,
  gridLayout = {},
  footer,
  onSubmit,
}: SMFormProps) {
  const [ exportFC ] = useState(() => FC as FCA);
  return [ exportFC, new Proxy(exportFC, {
    get (target: any, key) { return target.API[key]; },
  }) ] as [FCA, SMFormAPI];

  function FC () {
    const [ form ] = Form.useForm();
    const [ submitLoading, submitLoadingSet ] = useState(false);

    const [ initValue ] = useState(initialValue);
    const [ formValue, formValueSet ] = useState(value);


    // 渲染的字段配置
    const viewFields = [];

    // 需要被trim的字段
    const trimFields = {};

    fields.forEach((field) => {
      let label;
      let name;
      let option: CommonFieldConfig;

      if (Array.isArray(field)) {
        [ label, name, option = {} ] = field;
      } else {
        let rest;
        ({ label, name, ...rest } = field);
        option = rest;
      }

      const { visible } = option;

      // 不可见，或者返回值不可见，该字段直接过滤
      if (visible === false || typeof visible === 'function' && visible(option) === false) {
        return;
      }

      const { type, options, render } = option;

      const viewField: {
        [key: string]: unknown;
        // options?: Array<{ label:string; value:unknown; }>;
      } = {
        ...option,
        label,
        name,
        type,
      };

      // 设置默认type
      if (!type) {
        viewField.type = viewField.options ? 'select' : 'input';
      }

      if (viewField.type === 'input' && option.trim) {
        trimFields[name] = true;
      }

      if (initValue[name] !== undefined) {
        viewField.initialValue = initValue[name];
      }

      if (option.render) {
        viewField.type = 'custom';
        viewField.render = () => render(viewField);
      }

      if (/^(select|radio|checkbox|custom)$/.test(String(viewField.type))) {
        viewField.options = options || [];
      }

      viewFields.push(viewField);
    });

    const labelCol = gridLayout.labelCol || { span: 6 };
    const wrapperCol = gridLayout.wrapperCol || { span: 16 };

    const onBlur = (event) => {
      const { id, value } = event.target;
      if (trimFields[id]) {
        form.setFieldsValue({ [id]: value.trim() });
      }
    };

    const API = exportFC.API = createAPI();

    useEffect(() => {
      if (formValueSet) {
        form.setFieldsValue(formValue);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ formValue ]);

    // useEffect(() => {
    //   console.info('form.mouted');
    // }, []);

    const jsx = (
      <Form form={form} colon={false} {...props} {...createExternalProps()} onBlur={onBlur}>
        {viewFields.map((field) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { type, width, maxlength, disabled, options, render, placeholder, visible, selectProps, ...formItemProps } = field;
          const itemDisabled = typeof disabled === 'function' ? disabled(field) : disabled;

          let content = null;
          switch (type) {
            case 'input':
              content = (<Input disabled={itemDisabled} maxLength={maxlength} placeholder={placeholder} />);
              break;
            case 'password':
              content = (<Input.Password disabled={itemDisabled} maxLength={maxlength} placeholder={placeholder} />);
              break;
            case 'radio':
              content = (<Radio.Group disabled={itemDisabled} options={options} />);
              break;
            case 'checkbox':
              content = (<Checkbox.Group disabled={itemDisabled} options={options} />);
              break;
            case 'select':
              content = (<Select disabled={itemDisabled} options={options} {...selectProps} />);
              break;
            case 'custom':
              content = render(field.initialValue, field);
              break;
            case 'text':
              content = <div>{field.initialValue}</div>;
              break;
            default:
              content = null;
              break;
          }

          return (
            <Form.Item
              key={field.name}
              {...formItemProps}
              labelCol={labelCol}
              wrapperCol={wrapperCol}
              style={{ width: width ? `${width}px` : 'auto' }}
            >
              {content}
            </Form.Item>
          );
        })}
        {footer === undefined ? (
          <Row>
            <Col {...labelCol} />
            <Col {...wrapperCol}>
              <Space>
                <Button onClick={() => API.reset()} loading={submitLoading}>重置</Button>
                <Button type="primary" onClick={() => API.submit()} loading={submitLoading}>提交</Button>
              </Space>
            </Col>
          </Row>
        ) : footer}
      </Form>
    );

    return jsx;

    function createAPI (): SMFormAPI {
      return {
        reset () {
          form.resetFields();
        },
        submit () {
          const result = form.validateFields();
          if (onSubmit) {
            result
              .then((values) => {
                onSubmit(null, values);
              })
              .catch((error) => {
                onSubmit(error, null);
              });
          }
          return result;
        },
        lockSubmit () {
          submitLoadingSet(true);
        },
        unlockSubmit () {
          submitLoadingSet(false);
        },
        setValue (nextValue) {
          formValueSet(nextValue);
        },
      };
    }

    function createExternalProps () {
      const externalProps: { [k: string]: unknown } = {

      };
      return externalProps;
    }
  }
}
