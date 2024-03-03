import { allowCors, db, reportQ, toCsv } from './util.js'
import _ from 'lodash'

// get product details for a store/city/prov
export default allowCors(async (req, res) => {
  const q = req.query
  const m = q.id
    ? `id=${q.id}`
    : q.city
    ? `to=${q.city}`
    : `province=${q.province}`
  let products = await db.stores.flat(`m_${m}&${reportQ}`)
  products = _.sortBy(
    products.map(x => _.omit(x, '_id')),
    ['province', 'city', 'name', 'address', 'product']
  )
  return res.send(q.csv === '1' ? toCsv(products) : products)
})
