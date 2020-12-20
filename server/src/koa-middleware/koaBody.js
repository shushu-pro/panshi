const koaBody = require('koa-body')

export default koaBody({
  multipart: true,
  formLimit: '5mb',
  jsonLimit: '5mb',
  textLimit: '5mb',
  formidable: {
    maxFieldsSize: 20 * 1024 * 1024,
    maxFileSize: 100 * 1024 * 1024, // 设置当前上传文件大小最大限制为100M，默认2M
  },
})
