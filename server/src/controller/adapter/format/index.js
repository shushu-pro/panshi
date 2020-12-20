
import adapter from '@shushu.pro/adapter'
adapter.addFormat({
  time: (value) => {
    const date = new Date(value)
    return `${[
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-')
    } ${[
      String(date.getHours()).padStart(2, '0'),
      String(date.getMinutes()).padStart(2, '0'),
      String(date.getSeconds()).padStart(2, '0'),
    ].join(':')}`
  },
})
