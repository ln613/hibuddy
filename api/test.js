import { allowCors } from './util.js'

export default allowCors(async (req, res) => {
  return res.send('hi-buddy')
})
