import { allowCors, db, reportQ, toCsv } from './util.js'
import _ from 'lodash'

const pageSize = 10000

// get product details for a store/city/prov
export default allowCors(async (req, res) => {
  const q = req.query
  const m = q.id
    ? `id=${q.id}`
    : q.city
    ? `to=${q.city}`
    : `province=${q.province}`
  const agg = `m_${m}&${reportQ}`
  const count = await db.stores.flat(`${agg}&c`).then(r => r[0].c)

  let products = []
  if (count <= pageSize) {
    products = await db.stores.flat(agg)
  } else {
    const pages = Math.ceil(count / pageSize)
    for (let i = 0; i < pages; i++) {
      const r = await db.stores.flat(`${agg}&k_${i * pageSize}&l_${pageSize}`)
      products = products.concat(r)
      console.log(`Page ${i + 1} / ${pages} done`)
    }
  }
  products = _.sortBy(
    products.map(x => _.omit(x, '_id')),
    ['province', 'city', 'name', 'number', 'address', 'product']
  )
  return res.send(q.csv === '1' ? toCsv(products) : products)
})
