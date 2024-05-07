export const saveStore = city =>
  fetch(`/api/store?city=${city}`)
    .then(r => r.json())
    .then(r => `${r.count} stores saved for ${city}`)
    .catch(e => e)

export const saveProduct = (city, id, page) =>
  fetch(`/api/product?city=${city}&id=${id}&page=${page}`).then(r => r.json())

export const loadStores = () =>
  fetch(`/api/loadstore`)
    .then(r => r.json())
    .catch(e => e)

export const clearStores = city =>
  fetch(`/api/clearstore?city=${city}`)
    .then(r => r.text())
    .then(r => `${r} stores cleared for ${city}`)
    .catch(e => e)

export const storeReport = (type, id, csv) =>
  fetch(`/api/storereport?${type}=${id}&csv=${csv}`)
    .then(r => (csv ? r.blob().then(dl) : r.json()))
    .catch(e => e)

const dl = r => {
  const blob = new Blob([r], { type: 'application/text/csv' })
  const downloadUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = downloadUrl
  a.download = 'report.csv'
  document.body.appendChild(a)
  a.click()
}

export const sleep = s => new Promise(r => setTimeout(r, s))
