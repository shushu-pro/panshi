
export default {
  kvlog,
};

export {
  kvlog,
};

function logStyle (items) {
  const texts = [];
  const styles = [];
  (Array.isArray(items) ? items : [ items ]).forEach(({ text, style }) => {
    texts.push(`%c${text}`);
    styles.push(style);
  });

  // eslint-disable-next-line no-console
  console.log(texts.join(''), ...styles);
}


function kvlog (key, value) {
  logStyle([
    { text: key, style: 'padding: 4px 8px; border-radius: 4px 0 0 4px; color: #fff; background:#606060' },
    { text: value, style: 'padding: 4px 8px; border-radius: 0 4px 4px 0; color: #fff; background:#a0d911' },
  ]);
}
