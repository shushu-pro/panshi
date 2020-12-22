export default function textCopy (value, success) {
  const input = document.createElement('input');
  document.body.appendChild(input);
  input.value = value;
  input.select();
  document.execCommand('Copy'); // 执行浏览器复制命令
  document.body.removeChild(input);
  success && success();
}
