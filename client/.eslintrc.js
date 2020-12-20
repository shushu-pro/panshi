module.exports = {
  root: true,
  extends: [
    '@shushu.pro/eslint-config-all/react',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  // parser: 'babel-eslint',
  parser: '@typescript-eslint/parser',
  plugins: [ 'react', 'babel', '@typescript-eslint', 'react-hooks' ],
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },

  // 你的环境变量（包含多个预定义的全局变量）
  env: {
    // browser: true,
    // node: true,
  },

  // 全局变量忽略校验设置
  globals: {

    // jQuery: true,
    // myGlobal: false // 设置为false表示该值不能被重写
  },

  // 自定义规则
  rules: {
    'no-param-reassign': 'off',
    'no-multi-assign': 'off',
    'no-restricted-syntax': [ 'error', 'BinaryExpression[operator="in"]' ],
    'no-shadow': 'warn',
    'no-use-before-define': 'off',
    semi: [ 'error', 'always' ],
    'semi-style': [ 'error', 'last' ],
    camelcase: 'off',
    'max-len': [ 'warn', { code: 160 } ],
    'prefer-promise-reject-errors': 'warn', // 允许promise抛出非错误类型的值

    'react/jsx-curly-newline': 'off',
    'react/no-unescaped-entities': [ 'error', { forbid: [ '<', '>', '{', '}' ] } ],
    'react/jsx-one-expression-per-line': 'off',
    'react-hooks/rules-of-hooks': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'react/no-unused-prop-types': 0,
    'react/jsx-filename-extension': 0,
    'react/require-default-props': 0,


    'jsx-a11y/label-has-associated-control': 'off',

    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/type-annotation-spacing': [ 'error' ],
    '@typescript-eslint/indent': [ 'error', 2 ],

    'import/no-unresolved': [ 'warn', { ignore: [ '^@/' ] } ],
    'import/prefer-default-export': 'off', // 允许不导出default
    'import/no-extraneous-dependencies': [ 'off', {
      devDependencies: false,
      optionalDependencies: false,
      peerDependencies: false,
    } ],
    'import/extensions': [ 'error', 'ignorePackages', {
      js: 'never',
      jsx: 'never',
      ts: 'never',
      tsx: 'never',
    } ],
  },
  settings: {
    'import/resolver': {
      alias: {
        map: [
          [ '@', './src' ],
        ],
        extensions: [ '.js', '.jsx', '.json', '.ts', '.tsx' ],
      },
      node: {
        extensions: [ '.js', '.jsx', '.ts', '.tsx' ],
      },
    },
    'import/ignore': [ /\.(scss|less|css)$/ ],
  },
};
