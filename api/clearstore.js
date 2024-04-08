import { allowCors, db } from './util.js'
import _ from 'lodash'

// delete all products in stores for a given city
export default allowCors(async (req, res) => {
  const city = req.query.city
  console.log(city)
  const stores = await db.stores.search({ to: city })
  console.log(stores.length)

  if (stores.length > 0) {
    stores.forEach(s => {
      s.products = null
    })
    await db.stores.save(stores)
  }
  return res.send(stores.length)
})
