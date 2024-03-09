import axios from 'axios'

export const tap = x => {
  console.log(x)
  return x
}

const NF = 'https://sace-mongodb.netlify.app/.netlify/functions/'

export const HB = 'https://hibuddy.ca/'
export const HBQ = `${HB}graphql`

export const extract = (url, selectors) =>
  get(`${NF}web?type=extractUrl&url=${url}&selectors=${selectors}`)

export const get = url => axios.get(tap(url)).then(r => r.data)

export const post = (url, data) =>
  axios
    .post(tap(url), data, {
      headers: {
        Origin: HB,
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
    })
    .then(r => {
      if (url.includes(HBQ)) console.log(r.request._header)
      return r.data
    })

export const DB = (db, doc, type, params) =>
  `${NF}api?type=${type}&doc=${doc}&db=${db}${
    params ? `&params=${encodeURIComponent(JSON.stringify(params))}` : ''
  }`

export const dbInit = (db, docs) =>
  Object.fromEntries(
    docs.map(d => [
      d,
      {
        all: () => get(DB(db, d, 'doc')),
        flat: agg => get(DB(db, d, 'flat', { agg })),
        getById: id => get(DB(db, d, 'getById', { id: id.toString() })),
        // search: params => {
        //   const ps = mapValue(params, v => v.toString())
        //   return get(DB(db, d, 'doc', ps))
        // },
        save: data => post(DB(db, d, 'save'), data),
      },
    ])
  )

export const db = dbInit('mylist.hibuddy', ['stores'])

export const allowCors = fn => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  // another common pattern
  // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,OPTIONS,PATCH,DELETE,POST,PUT'
  )
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  return await fn(req, res)
}

export const toCsv = ps => {
  if (!ps || ps.length === 0) return ''
  const keys = Object.keys(ps[0])
  const h = keys.join(',')
  const lines = ps.map(p => keys.map(k => p[k]).join(','))
  return `${h}\n${lines.join('\n')}`
}

export const reportQ =
  'u_products&p_province,city,name,address,category=products.category1,brand=products.brand,product=products.prodname,price=products.price,size=products.size,count=products.count,avg=products.avg,best=products.best,img=products.imgurl,url=products.url'
