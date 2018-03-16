const fs = require('fs')

const csv = require('fast-csv')

const csvStream = csv()
    .transform(function(data){
      const before = data.slice(0, 7)
      const after = data.slice(9)

      return [
        ...before,
        ...data[8].split(' '),
        ...after,
      ]
    })
    .on('data', function(data){
         console.log(data)
    })
    .on('end', function(){
         console.log('done')
    })

fs.createReadStream('data/Stations.csv')
  .pipe(csvStream)
