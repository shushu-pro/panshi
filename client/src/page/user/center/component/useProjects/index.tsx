import React from 'react';

export default useProjects;

function useProjects () {
  const exportJSX = <div>开发中...</div>;
  const exportAPI: ExportAPI = createAPI();
  return [ exportJSX, exportAPI ];

  function createAPI () {
    return {
      openCreateDialog () {
        // ..
      },
    };
  }
}
