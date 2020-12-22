import { api } from '@/api';
import { useUserInfo, getUserInfo } from './state';


const pullInfo = async () => api.user.info();
const useLogout = () => {
  const [ , userInfoSet ] = useUserInfo();

  return () => api.user.logout().then(() => {
    userInfoSet({
      isLogin: false,
      info: {},
      auths: [],
    });
  });
};


// 权限接口
function hasAuth(atom: string): boolean;
function hasAuth(atoms: Array<string>): boolean;
function hasAuth (arg) {
  const { auths } = getUserInfo();
  const atoms = typeof arg === 'string' ? [ arg ] : arg;
  return atoms.some((atom) => auths.includes(atom));
}

export {
  useUserInfo,
  getUserInfo,

  pullInfo,
  useLogout,

  hasAuth,
};

export default {
  useUserInfo,
  getUserInfo,

  pullInfo,
  useLogout,

  hasAuth,
};
