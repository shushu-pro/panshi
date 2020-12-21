import { Routes } from '../core/Router';
import others from './others';
import user from './user';

export default [
  {
    layout: {
      header: true,
    },
    children: [
      ...others,
      ...user,
    ],
  },
] as Routes;


// import other from './other';

// export default [
//   {
//     layout: {
//       header: true,
//     },

//     children: [
//       ...other,
//     ],
//   },
// ] as Routes;
