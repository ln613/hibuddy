import { allowCors } from '../utils'

export default allowCors(async (req, res) => {
  return res.send('hi-buddy')
})
