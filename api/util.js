import axios from 'axios'
import { MongoClient } from 'mongodb'

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

let _db = null

export const connectDB = async () =>
  _db ||
  (_db = await MongoClient.connect(
    'mongodb+srv://techpos:hi-buddy@cluster0.z2ghhgq.mongodb.net/hibuddy?retryWrites=true'
  ).then(x => x.db()))

const Stages = {
  u: ['unwind', 0],
  l: ['limit', 1],
  m: ['match', 2],
  r: ['sample', 2],
  p: ['project', 3],
  s: ['sort', 4],
  k: ['skip', 1],
  c: ['count', 5],
}

const Ops = {
  in: x => x.split(';'),
  first: x => '$' + x,
}

export const flat = async (doc, agg) => {
  const stages = !agg
    ? [{ $match: {} }]
    : agg.split('&').map(s => {
        const [stage, props] = s.split('_')
        const $stage = `$${Stages[stage][0]}`
        const type = Stages[stage][1]
        let value = null
        if (type === 0) value = `$${props}`
        else if (type === 1) value = +props
        else if (type === 5) value = props || stage
        else {
          const ps = props.split(',').map(p => {
            let [k, v = '1'] = p.split('=')
            if (v.includes('$')) {
              const [op, opv] = v.split('$')
              return [k, { [`$${op}`]: Ops[op] ? Ops[op](opv) : opv }]
            }
            if (v.includes('.')) v = '$' + v
            return [k, isNaN(+v) ? v : +v]
          })
          value = Object.fromEntries(ps)
        }
        return { [$stage]: value }
      })
  const r = await _db.collection(doc).aggregate(stages).toArray()
  return r
}

export const replace = async (doc, obj) => {
  const list = makeArray(obj)

  if (list.some(o => !o.id)) {
    const id1 = await maxId(doc)
    const id = Math.max(...list.map(o => o.id || 0), id1) + 1
    list.filter(o => !o.id).forEach((o, i) => (o.id = id + i))
  }

  await Promise.all(
    list.map(o =>
      _db.collection(doc).replaceOne({ id: o.id }, o, { upsert: true })
    )
  )

  return list
}

// export const DB = (db, doc, type, params) =>
//   `${NF}api?type=${type}&doc=${doc}&db=${db}${
//     params ? `&params=${encodeURIComponent(JSON.stringify(params))}` : ''
//   }`

export const dbInit = (
  docs // (db, docs) =>
) =>
  Object.fromEntries(
    docs.map(d => [
      d,
      {
        flat: agg => flat(d, agg),
        save: o => replace(d, o),
        // all: () => get(DB(db, d, 'doc')),
        // flat: agg => get(DB(db, d, 'flat', { agg })),
        // search: (query, fields, sort) =>
        //  get(DB(db, d, 'search', { query, fields, sort })),
        // getById: id => get(DB(db, d, 'getById', { id: id.toString() })),
        // search: params => {
        //   const ps = mapValue(params, v => v.toString())
        //   return get(DB(db, d, 'doc', ps))
        // },
        // save: data => post(DB(db, d, 'save'), data),
      },
    ])
  )

// export const db = dbInit('mylist.hibuddy', ['stores'])

export const db = dbInit(['stores'])

export const allowCors = fn => async (req, res) => {
  await connectDB()
  return await fn(req, res)
}
// export const allowCors = fn => async (req, res) => {
//   res.setHeader('Access-Control-Allow-Credentials', true)
//   res.setHeader('Access-Control-Allow-Origin', '*')
//   // another common pattern
//   // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
//   res.setHeader(
//     'Access-Control-Allow-Methods',
//     'GET,OPTIONS,PATCH,DELETE,POST,PUT'
//   )
//   res.setHeader(
//     'Access-Control-Allow-Headers',
//     'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
//   )
//   if (req.method === 'OPTIONS') {
//     res.status(200).end()
//     return
//   }
//   return await fn(req, res)
// }

const fix = x =>
  typeof x === 'string' ? x.replace(/(\r\n|\n|\r)/gm, '').replace(/,/g, '') : x

export const toCsv = ps => {
  if (!ps || ps.length === 0) return ''
  const keys = Object.keys(ps[0])
  const h = keys.join(',')
  const lines = ps.map(p => keys.map(k => fix(p[k])).join(','))
  return `${h}\n${lines.join('\n')}`
}

export const reportQ =
  'u_products&p_province,city,name,number,address,category=products.category1,brand=products.brand,product=products.prodname,price=products.price,size=products.size,count=products.count,avg=products.avg,best=products.best,img=products.imgurl,url=products.url'
