import React, { useState } from 'react';
import { useSMForm } from '@/package/shanmao';
import { Input } from 'antd';

export default function Index () {
  // const [ disabled, disabledSet ] = useState(false);
  // const [ sexVisible, sexVisibleSet ] = useState(false);
  const [ myFormJSX, myForm ] = useSMForm({
    initialValue: {
      name: '张三',
      sex: 2,
      hobby: [ 1, 3 ],
      text: '这是一段描述',
      custom: 'aaa',
    },
    fields: [
      { name: 'name', label: '名称', rules: [ { required: true } ] },
      {
        name: 'sex',
        label: '性别',
        type: 'radio',
        options: [
          { label: '男', value: 1 },
          { label: '女', value: 2 },
          { label: '保密', value: 3 },
        ],
        rules: [
          { required: true },
        ],
        // disabled,
        // visible: sexVisible,
      },
      {
        name: 'password',
        label: '密码',
        type: 'password',
        rules: [ { required: true } ],
        // disabled,
      },
      {
        name: 'password2',
        label: '确认密码',
        type: 'password',
        dependencies: [ 'password' ],
        rules: [
          { required: true },
          ({ getFieldValue }) => ({
            validator (rule, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject('输入的密码不一致');
            },
          }),
        ],
      },
      {
        name: 'hobby',
        label: '爱好',
        type: 'checkbox',
        options: [
          { label: '唱歌', value: 1 },
          { label: '跳舞', value: 2 },
          { label: '钓鱼', value: 3 },
          { label: '下棋', value: 4 },
        ],
      },
      {
        name: 'profession',
        label: '职业',
        options: [
          { label: '工程师', value: 1 },
          { label: '教师', value: 2 },
          { label: '司机', value: 3 },
          { label: '大BOSS', value: 4 },
        ],
        selectProps: {
          mode: 'multiple',
        },
        // disabled,
      },
      {
        name: 'text',
        label: '文本字段',
        type: 'text',
      },
      {
        name: 'custom',
        label: '自定义字段',
        render () {
          return <Input />;
        },
      },
    ],
    props: {
      colon: true,
    },
    // footer: null,
    onSubmit (error, values) {
      myForm.lockSubmit();
      setTimeout(() => {
        myForm.unlockSubmit();
      }, 1000);
      console.info({ error, values });
    },
  });

  return <div>{myFormJSX}</div>;
}
