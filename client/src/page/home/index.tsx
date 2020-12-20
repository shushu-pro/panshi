import React, { useState } from 'react';
import { Input } from 'antd';

export default function Index () {
  const [ value, valueSet ] = useState('');
  return (
    <div>homekkkk

      <Input value={value} onChange={(e) => valueSet(e.target.value)} />
      jjj
      h
    </div>
  );
}
