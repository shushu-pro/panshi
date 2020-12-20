import history from '@/service/history'
import DataX from '@shushu.pro/datax'
export default {
  api: {
    list: {
      async dispatcher ({ query: { apiId } }) {
        const { list } = await history.api.list({ apiId })
        return { list: list.reverse() }
      },
    },
    data: {
      async dispatcher ({ query: { historyId } }) {
        const typeData = JSON.parse((await history.api.data({ historyId })).typeData)
        const left = typeData.apiDataBefore
        const right = typeData.apiDataAfter
        left.mockReqDoc = DataX.document(left.reqData || '')
        left.mockResDoc = DataX.document(left.resData || '')
        right.mockReqDoc = DataX.document(right.reqData || '')
        right.mockResDoc = DataX.document(right.resData || '')

        left.reqData = left.resData = right.reqData = right.resData = null

        return { left, right }
      },
    },
  },
}
