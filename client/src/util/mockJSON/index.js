import DataX from '@shushu.pro/datax';

export default mockJSON;

function mockJSON (datax, params) {
  return DataX.parse(datax, params);
}
