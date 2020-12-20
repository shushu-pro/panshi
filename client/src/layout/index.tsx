import React, { useEffect, useState } from 'react';
import user from '@/page/user/exports';
import { Link } from 'react-router-dom';
import Header from './Header/index';
import styles from './index.less';

export default function Layout ({ layout, render }) {
  return (
    <div className={styles.layout}>
      {layout.header && <Header /> }
      <div className={styles.content}>
        {render()}
      </div>
    </div>
  );
}