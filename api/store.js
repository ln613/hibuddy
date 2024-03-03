import { allowCors, get, post, HB, HBQ, db } from '../utils'

const q = c => ({
  documentId: 'nearby_stores_query',
  idToken: '',
  variables: { userlon: +c[0], userlat: +c[1], radius: 50000 },
})

// get stores for a given city
export default allowCors(async (req, res) => {
  const city = req.query.city
  const c = await get(`${HB}api/v1/address?query=Downtown%20${city}`).then(
    r => r?.features?.[0].geometry?.coordinates
  )
  if (!c) return res.send([])
  const stores = await post(HBQ, q(c)).then(r => r?.data?.stores?.nodes)
  stores.forEach(s => {
    s.to = city
    s.id = s.storeid
  })
  await db.stores.save(stores)
  return res.send(stores.length)
})
