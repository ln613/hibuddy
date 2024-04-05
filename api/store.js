import { allowCors, get, post, HB, HBQ, db } from './util.js'
import _ from 'lodash'

const q = c => ({
  documentId: 'nearby_stores_query',
  idToken: '',
  variables: { userlon: +c[0], userlat: +c[1], radius: 50000 },
})

// save stores for a given city
export default allowCors(async (req, res) => {
  const city = req.query.city
  const ids = await db.stores.flat(`p_storeid`)
  const c = await get(`${HB}api/v1/address?query=Downtown%20${city}`).then(
    r => r?.features?.[0].geometry?.coordinates
  ).catch(_ =>
    get(`${HB}api/v1/address?query=${city}`).then(
      r => r?.features?.[0].geometry?.coordinates
    )
  ).catch(_ => null)

  if (!c) return res.send(0)

  let stores = await post(HBQ, q(c)).then(r => r?.data?.stores?.nodes)
  stores = _.differenceBy(stores, ids, 'storeid')
  if (stores.length > 0) {
    stores.forEach(s => {
      s.to = city
      s.id = s.storeid
    })
    await db.stores.save(stores)
  }
  return res.send(stores.length)
})
