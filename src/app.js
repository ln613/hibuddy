import { useEffect } from 'react'

export const App = () => {
  useEffect(() => fetch('/api/test').then(r => console.log(r)), [])
  return <h1>Hello world</h1>
}
