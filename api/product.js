import { allowCors, get, post, HB, HBQ, db } from './util.js'
import _ from 'lodash'

const d = (id, ids, page) => ({
  // page starts from 0
  documentId: 'store_discounts_query',
  idToken: '',
  variables: {
    _ids: [],
    page,
    query: '',
    storeid: [id],
    storeids: ids,
  },
})

// save products for a given store, nearby stores and page
export default allowCors(async (req, res) => {
  try {
    const q = req.query
    const stores = await db.stores.flat(`m_to=${q.city}&p_id`)
    const store = await db.stores.flat(`m_id=${q.id}`).then(r => r?.[0])
    if (!store) return res.status(400).send('No store found!')

    const node = await post(
      HBQ,
      d(
        q.id,
        stores.map(s => s.id),
        q.page
      )
    ).then(r => r?.data?.stores)

    const products = node.nodes.map(p => ({
      ..._.omit(p, ['_id', 'avg_price', 'store_count', 'min_price']),
      id: p._id,
      avg: p.avg_price,
      count: p.store_count,
      best: p.min_price,
      to: q.city,
    }))

    if (!store.products) store.products = []
    let oldLen = store.products.length

    if (q.page == 0 && oldLen === node.totalCount)
      return res.send({ noChange: true })

    if (q.page == 0) {
      store.products = []
      oldLen = 0
    }
    store.products = store.products.concat(products) // _.unionBy(products, store.products, 'id')
    await db.stores.save(_.omit(store, '_id'))
    return res.send({
      received: products.length,
      saved: store.products.length - oldLen,
      total: node.totalCount,
    })
  } catch (e) {
    return res.status(500).send(e.message)
  }
})
