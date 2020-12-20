
import { atom, useRecoilState, selector, useRecoilValue, useRecoilValueLoadable, useRecoilStateLoadable } from 'recoil';

const userInfo = atom({ key: 'userInfo', default: { name: '张三' } });


const useMyState = () => useRecoilState(userInfo);
const asyncUserInfo = selector({
  key: 'hjhkh',
  async get ({ get }) {
    const userInfoState = get(userInfo);
    console.info(userInfoState);

    const d = await new Promise((resolve) => {
      setTimeout(() => {
        resolve(userInfoState);
      }, 1000);
    });


    return d;
  },
  set ({ set }, nextValue) {
    set(userInfo, nextValue);
  },
//   set (nil, value) {
//     return value;
//   },
});

const useAsyncUserInfo = () => useRecoilStateLoadable(asyncUserInfo);

const myQuery = selector({
  key: 'MyDBQuery',
  get: () => 666,
//   get: async () => {
//     const response = await new Promise((resolve) => {
//       resolve(6);
//     });
//     return response;
//   },
});

const useMyQuery = () => useRecoilValue(myQuery);

export {
  useMyState,
  useAsyncUserInfo,
  useMyQuery,
};

export default {
  useMyState,
  useAsyncUserInfo,
};


// 状态 state
// 直接状态。atom(options)
// 聚合，异步状态，selector(options)
// 读写状态 useRecoilState
// 读状态 useRecoilValue
// 写状态 useSetRecoilState
// 重置状态 useResetRecoilState
// 重置状态 useResetRecoilState
