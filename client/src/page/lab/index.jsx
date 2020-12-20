import React, { useState } from 'react';
import { RecoilRoot, atom, useRecoilState, selector, useRecoilValue } from 'recoil';
import { Input, Card, Button } from 'antd';
import { useMyState, useAsyncUserInfo, useMyQuery } from './state';

export default index;


const inputValueState = atom({
  key: 'inputValue',
  default: '',
});

function index () {
  return (
    <RecoilRoot>
      <Index2 />
    </RecoilRoot>
  );
}

function Index2 () {
  const [ count, countSet ] = useState(0);
  const [ userInfo ] = useMyState();

  console.info('render.index');

  return (

    <div>
      {userInfo.name}
      <div onClick={() => countSet(count + 1)}>{count}</div>
      <Com1 />
      <Com2 />

    </div>

  );

//   return (
//     <div onClick={() => countSet(count + 1)}>{count}</div>
//   );
}


function Com1 () {
  console.info('render.Com1');
  const [ count, countSet ] = useState(0);
  const [ value, setValue ] = useRecoilState(inputValueState);


  return (

    <>
      <Input value={value} onChange={(v) => setValue(v.target.value)} />
      <div onClick={() => countSet(count + 1)}>{value}</div>;
    </>
  );
}

const mySelector = selector({
  key: 'MySelector',
  get: async ({ get }) => {
    await sleep();
    return 666;
  }
  // const response = await new Promise((resolve) => {
  //   resolve(6);
  // });
  // return response;
  ,
});


function sleep () {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), 1000);
  });
}


const hhh = () => useRecoilValue(mySelector);

function Com2 () {
  console.info('render.Com2');
  // const [ count, countSet ] = useState(0);
  // const [ value, valueSet, valueReset ] = useRecoilState(inputValueState);

  // const [ userInfo, userInfoSet ] = useMyState();
  // const [ myQuery ] = useMyQuery();


  return (
    <Card>
      {/* <React.Suspense fallback={<div>Loading...</div>}> */}
      <QueryResults />
      {/* </React.Suspense> */}
      {/* <div onClick={() => countSet(count + 1)}>{value}</div>;
      <div onClick={() => userInfoSet({ name: `${Math.random()}` })}>{userInfo.name}</div>; */}
      {/* <div onClick={() => asyncUserInfoSet({ name: `${Math.random()}` })}>KKKKK:{asyncUserInfo.name}</div>; */}
    </Card>
  );
}

function QueryResults () {
  const [ nil, userInfoSet ] = useMyState();
  const [ asyncUserInfo, asyncUserInfoSet ] = useAsyncUserInfo(mySelector);
  console.info({ asyncUserInfo });
  return (
    <>
      <div onClick={() => asyncUserInfoSet({ name: 'yyy' })}>{asyncUserInfo.state === 'hasValue' ? asyncUserInfo.contents.name : '###'}</div>

      <Button onClick={() => userInfoSet({ name: 'uuuuuuuuuuu' })}>改变</Button>
    </>
  );
}

function useState2 (initailValue) {
  const [ setValue, getValue ] = createSetValue(initailValue);


  return [ getValue(), setValue ];
}


function createSetValue (initailValue) {
  let value = initailValue;

  return [
    function setValue (nextValue) {
      console.info({ nextValue });
      value = nextValue;
    },
    function getValue () {
      return value;
    },
  ];
}
