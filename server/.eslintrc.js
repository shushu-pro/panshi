module.exports = {
  root: true,
  extends: '@shushu.pro/all',
  parser: 'babel-eslint',
  env: {
    jest: true,
    node: true,
    browser: true,
  },
  rules: {
    'max-len': [ 'error', { code: 160 } ],
  },
}
