import { allowCors } from '../utils/index.js'

export default allowCors(async (req, res) => {
  return res.send('hi-buddy')
})
