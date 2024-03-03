import { allowCors, get, post, HB, HBQ, db } from '../utils'
import { omit, unionBy } from 'lodash'

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

// get products for a given store, nearby stores and page
export default allowCors(async (req, res) => {
  const q = req.query
  const stores = await db.stores.flat(`m_to=${q.city}&p_id`)
  const store = await db.stores.flat(`m_id=${q.id}`).then(r => r?.[0])
  if (!store) return res.send('No store found!')

  let products = await post(
    HBQ,
    d(
      q.id,
      stores.map(s => s.id),
      q.page
    )
  ).then(r => r?.data?.stores?.nodes)
  products = products.map(p => ({
    ...omit(p, '_id'),
    id: p._id,
    to: q.city,
  }))
  store.products = unionBy(products, store.products, 'id')
  await db.stores.save(omit(store, '_id'))
  return res.send(products)
})
