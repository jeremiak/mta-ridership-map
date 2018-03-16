const fs = require('fs')
const path = require('path')

const d3 = require('d3')
const json2csv = require('json2csv').parse

const dest = path.join(__dirname, '../data/joined.csv')
const p = file => path.join(__dirname, '../data', file)
const geoFile = fs.readFileSync(p('Stations.csv'))
const ridershipFile = fs.readFileSync(p('ridership.csv'))

const common = 'controlled'
const addCommon = (data, key) => data.map(d => ({
  ...d,
  [common]: d[key].replace(/\s+/g, '')
}))

const geoCsv = d3.csvParse(geoFile.toString())
const riderCsv = d3.csvParse(ridershipFile.toString())

const geo = addCommon(geoCsv, 'Stop Name')
const ridership = addCommon(riderCsv, 'station')

const joined = ridership.map(r => {
  const controlled = r.station.replace(/\s+/g, '')
  const match = geo.find(g => g[common] === r[common])
  if (!match) return false
  return {
    ...r,
    lat: match['GTFS Latitude'],
    long: match['GTFS Longitude']
  }
})

const fields = Object.keys(joined[0])
const csv = json2csv(joined.filter(c => c), { fields, quote: '' })

const falseCount = joined.filter(j => j === false).length
console.log(`${falseCount} rows didn't match`)

fs.writeFile(dest, csv, err => {
  if (err) throw err
  console.log('the file has been saved!')
})

debugger
