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

export const post = (url, data) => axios.post(tap(url), data).then(r => r.data)

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
