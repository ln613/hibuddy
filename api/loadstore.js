import { allowCors, db } from './util.js'

// get all stores
export default allowCors(async (req, res) => {
  const stores = await db.stores.flat(`p_id,name,province,to,fulladdress`)
  return res.send(stores)
})
