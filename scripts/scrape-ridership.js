const fs = require('fs')
const path = require('path')

const cheerio = require('cheerio')
const http = require('axios')
const json2csv = require('json2csv').parse

const url = 'http://web.mta.info/nyct/facts/ridership/ridership_sub_annual.htm'
const dest = path.join(__dirname, '../data/ridership.csv')

const hasTdChildren = (i, tr) => {
  const tds = tr.children.filter(c => c.name === 'td')
  return tds.length === 10
}
const toArray = data => Array.prototype.slice.apply(data)

const process = html => {
  const $ = cheerio.load(html)
  const $trs = $('tr').filter(hasTdChildren)
  const trs = toArray($trs).map(tr => {
    const tds = tr.children.filter(c => c.name === 'td')
    const lines = toArray($('img', tds[0])).map(l => l.attribs.alt.replace(' subway', ''))
    const fmt = td => parseInt($(td).text().replace(/,/g, ''))
    return {
      'station': $(tds[0]).text().trim(),
      lines: lines.join(' '),
      2011: fmt(tds[1]),
      2012: fmt(tds[2]),
      2013: fmt(tds[3]),
      2014: fmt(tds[4]),
      2015: fmt(tds[5]),
      2016: fmt(tds[6]),
    }
  })

  return trs.filter(tr => tr.lines.length > 0)
}

http.get(url).then(resp => {
  const html = resp.data
  const ridership = process(html)

  const fields = ['station', 'lines', '2011', '2012', '2013', '2014', '2015', '2016']
  const csv = json2csv(ridership, { fields, quote: '' })

  fs.writeFile(dest, csv, (err) => {
    if (err) throw err
    console.log('the file has been saved!')
  })
}).catch(err => {
  console.error('error:', error)
})
