// import { pullUserLoginState, useInfo } from './state';


// const hasLogin = pullUserLoginState;

// export default {
//   hasLogin,
//   useInfo,
//   usePullUserInfo,
// };

// export {
//   hasLogin,
//   useInfo,
//   usePullUserInfo,
// };

// function usePullUserInfo(){
//  const st =  useRecoilStateLoadable(userInfoSelector);

//  return ()=> {
//    api.user.info().then(()=>{
//       st.set(data)
//    })
//  }

// }

import { useSetUserInfo } from './state';

export default {
  useSetUserInfo,
};
