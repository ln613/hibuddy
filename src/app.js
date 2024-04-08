import { useState, useEffect } from 'react'
import {
  saveStore,
  saveProduct,
  loadStores,
  clearStores,
  storeReport,
  sleep,
} from './util'
import _ from 'lodash'

export const App = () => {
  const [city, setCity] = useState('')
  const [msg, setMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [list, setList] = useState([])
  const [selectedProvince, setSelectedProvince] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedStoreId, setSelectedStoreId] = useState('')

  const out = m => {
    console.log(m)
    setMsg(typeof m === 'string' ? m : JSON.stringify(m))
  }

  const provinces = _.uniq(list.map(x => x.province)).sort()

  const cities = selectedProvince
    ? _.uniq(
        list.filter(x => x.province === selectedProvince).map(x => x.to)
      ).sort()
    : []

  const stores = selectedCity
    ? _.sortBy(
        list.filter(x => x.to === selectedCity),
        ['name', 'fulladdress']
      )
    : []

  const selectedStore = selectedStoreId
    ? stores.find(x => x.id === selectedStoreId)
    : null

  const saveStores = async () => {
    setIsLoading(true)
    await saveStore(city).then(out)
    setIsLoading(false)
  }

  const saveProducts = async (c, s, sc = '') => {
    if (!c) {
      alert('select a city first!')
    } else if (!s) {
      alert('select a store first!')
    } else {
      try {
        setIsLoading(true)

        let result
        while (true) {
          try {
            result = await saveProduct(c, s.id, 0)
            break
          } catch (e) {
            out('Error, keep retrying...')
            await sleep(1000)
          }
        }

        if (!result.noChange) {
          const n = Math.ceil(result.total / 10)
          const sm = (x, r) =>
            out(
              `Page ${x}/${n}, products ${r.saved}/${r.received} saved for store${sc}: ${s.name} - ${s.fulladdress}`
            )
          sm(1, result)
          for (let i = 1; i < n; i++) {
            while (true) {
              try {
                result = await saveProduct(c, s.id, i * 10)
                break
              } catch (e) {
                out('Error, keep retrying...')
                await sleep(1000)
              }
            }
            sm(i + 1, result)
          }
        } else {
          out(`No updates for store${sc}: ${s.name} - ${s.fulladdress}`)
        }
        setIsLoading(false)
      } catch (e) {
        out(e)
      }
    }
  }

  const saveProductsForAllStores = async c => {
    for (let i = 0; i < stores.length; i++) {
      await saveProducts(c, stores[i], `(${i + 1}/${stores.length})`)
    }
  }

  const clearStore = async c => {
    if (
      confirm(
        `Are you sure you want to delete all products in all stores in ${c}?`
      )
    ) {
      setIsLoading(true)
      await clearStores(c).then(out)
      setIsLoading(false)
    }
  }

  const genStoreReport = async csv => {
    if (!selectedStore) {
      alert('select a store first!')
    } else {
      setIsLoading(true)
      const r = await storeReport('id', selectedStore.id, csv)
      out(r)
      setIsLoading(false)
    }
  }

  const genCityReport = async csv => {
    if (!selectedCity) {
      alert('select a city first!')
    } else {
      setIsLoading(true)
      const r = await storeReport('city', selectedCity, csv)
      out(r)
      setIsLoading(false)
    }
  }

  const genProvinceReport = async csv => {
    if (!selectedProvince) {
      alert('select a province first!')
    } else {
      setIsLoading(true)
      const r = await storeReport('province', selectedProvince, csv)
      out(r)
      setIsLoading(false)
    }
  }

  const changeProvince = e => {
    setSelectedProvince(e.target.value)
    setSelectedCity('')
    setSelectedStoreId('')
  }

  const changeCity = e => {
    setSelectedCity(e.target.value)
    setSelectedStoreId('')
  }

  useEffect(() => {
    loadStores().then(r => {
      setList(r)
    })
  }, [])

  return (
    <>
      <div>
        <input value={city} onChange={e => setCity(e.target.value)} />
        <button
          disabled={isLoading}
          onClick={saveStores}
          style={{ backgroundColor: 'orange' }}
        >
          Save Stores for City
        </button>
      </div>
      <hr />
      <div>
        <div>
          Province:{' '}
          <select onChange={changeProvince}>
            <option value=""> -- Select a Province -- </option>
            {provinces.map(c => (
              <option value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          City:{' '}
          <select onChange={changeCity}>
            <option value=""> -- Select a City -- </option>
            {cities.map(c => (
              <option value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          Store:{' '}
          <select onChange={e => setSelectedStoreId(e.target.value)}>
            <option value=""> -- Select a Store -- </option>
            {stores.map(s => (
              <option value={s.id}>
                {s.name} - {s.fulladdress}
              </option>
            ))}
          </select>
        </div>
        <div>
          <button
            disabled={isLoading || !selectedStore}
            onClick={() => saveProducts(selectedCity, selectedStore)}
            style={{ backgroundColor: 'orange' }}
          >
            Save Products for Store
          </button>
          <button
            disabled={isLoading || !selectedCity}
            onClick={() => saveProductsForAllStores(selectedCity)}
            style={{ backgroundColor: 'orange' }}
          >
            Save Products for All Stores in City
          </button>
          <button
            disabled={isLoading || !selectedCity}
            onClick={() => clearStore(selectedCity)}
            style={{ backgroundColor: 'red' }}
          >
            Delete Products for All Stores in City
          </button>
        </div>
        <div>
          <button disabled={isLoading} onClick={() => genStoreReport(0)}>
            Store Report
          </button>
          <button disabled={isLoading} onClick={() => genStoreReport(1)}>
            Store Report (csv)
          </button>
        </div>
        <div>
          <button disabled={isLoading} onClick={() => genCityReport(0)}>
            City Report
          </button>
          <button disabled={isLoading} onClick={() => genCityReport(1)}>
            City Report (csv)
          </button>
        </div>
        <div>
          <button disabled={isLoading} onClick={() => genProvinceReport(0)}>
            Province Report
          </button>
          <button disabled={isLoading} onClick={() => genProvinceReport(1)}>
            Province Report (csv)
          </button>
        </div>
      </div>
      <hr />
      <div>Msg: {msg}</div>
    </>
  )
}
