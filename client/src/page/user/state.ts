import { atom, useRecoilState, selector, useRecoilValue, useRecoilValueLoadable, useRecoilStateLoadable, useSetRecoilState } from 'recoil';
import { api } from '@/api';

let userInfo = {
  avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
  nick: '磐石',
  auths: [],
};

const userInfoAtom = atom({
  key: 'userInfoAtom',
  default: userInfo,
});


const useSetUserInfo = () => {
  const setUserInfo = useSetRecoilState(userInfoAtom);

  return async () => api.user
    .info()
    .then((data) => {
      setUserInfo(userInfo = data);
    });
};

export {
  useSetUserInfo,
};


// let hasLogin = false;


// const userInfoSelector = selector({
//   key: 'userInfoSelector',
//   async get () {
//     await pullUserLoginState();
//     return userInfo;
//   },
//   set ({ set }, nextValue: any) {
//     set(userInfoAtom, userInfo = nextValue);
//   },
// });

// async function pullUserLoginState () {
//   if (!hasLogin) {
//     try {
//       userInfo = await api.user.info();
//       hasLogin = true;
//     } catch (err) {
//       return false;
//     }
//   }
//   return hasLogin;
// }


// const useInfo = () => useRecoilValue(userInfoAtom); // useRecoilStateLoadable(userInfoSelector);

// export {
//   pullUserLoginState,

//   useInfo,
// };
