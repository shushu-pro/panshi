import React, { useEffect, useState } from 'react';
import user from '@/page/user';
import { Link } from 'react-router-dom';
import Header from './Header/index';
import styles from './index.less';

export default function Layout ({ layout, routerView }) {
  return (
    <div className={styles.layout}>
      {layout.header && <Header /> }
      <div className={styles.content}>
        {routerView}
      </div>
    </div>
  );
}
