const { csvFormat } = require('d3-dsv');
const { writeFileSync } = require('fs');
const Nightmare = require('nightmare')
const jquery = require('jquery')

const nightmare = Nightmare({ show: true })

const getTableData = async () => {
  try {
    const results = await nightmare
      //load url
      .goto('https://google.ca')
      //type search term into google search
      .type('#lst-ib', 'datatables')
      //click submit search
      .click('#tsf .jsb input[type="submit"]')
      //wait for element results to load identified by css selector
      .wait('#search')
      //click on first google search result (is there a better way?)
      .click('#rso > div:nth-child(1) > div > div > div > div > h3 > a')
      //wait for #example table to load
      .wait('#example > tbody > tr')
      //get the table data on the page convert it into array where each row is 
      //an object in the array
      .evaluate(() => {
        return Array.from($('#example').DataTable().rows().data())         
      })

    //transform array of arrays into array of objects by creating key value pairs
    //is there a way to get this from the html scrape? wasn't able to get the <thead> data
    const objResults = results.map(cellData => { 
      return { 
        name: cellData[0], 
        position: cellData[1],
        office: cellData[2], 
        age: cellData[3],
        start_date: cellData[4], 
        salary: cellData[5] 
      }
    })

    //convert array of data objects to string (so that we can write to csv file)
    const csvData = csvFormat(objResults)
    writeFileSync('./output.csv', csvData, { encoding: 'utf8' })

  } catch (error) {
      // handle the error
      console.error(error)
    }
    finally {
      await nightmare.end()
    }
}

getTableData()

