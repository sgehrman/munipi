import React, { useState, useCallback, useEffect } from 'react'
import './App.scss'
import axios from 'axios'

// http://webservices.nextbus.com/service/publicXMLFeed?command=routeList&a=sf-muni
// http://webservices.nextbus.com/service/publicJSONFeed?command=routeConfig&a=sf-muni&r=29
// https://gist.github.com/grantland/7cf4097dd9cdf0dfed14

function App() {
  const [contents, setContents] = useState(null)
  const [contents2, setContents2] = useState(null)

  async function trainTimes(line, alt = false) {
    let inbound = `http://webservices.nextbus.com/service/publicJSONFeed?command=predictions&a=sf-muni&r=${line}&s=5206`

    if (alt) {
      inbound = `http://webservices.nextbus.com/service/publicJSONFeed?command=predictions&a=sf-muni&r=${line}&s=5317`
    }

    const result = await axios.get(inbound)

    if (result && result.data && result.data.predictions) {
      const direction = result.data.predictions.direction

      if (direction) {
        const times = []

        let directions = []
        if (!Array.isArray(direction)) {
          directions.push(direction)
        } else {
          directions = direction
        }

        directions.forEach((direction) => {
          const pred = direction.prediction
          let array = []

          if (!Array.isArray(pred)) {
            array.push(pred)
          } else {
            array = pred
          }

          array.forEach((p) => {
            times.push(parseInt(p.minutes))
          })
        })

        return times
      }
    }

    return []
  }

  function getTimes(times) {
    times.sort(function(a, b) {
      return a - b
    })

    let time1 = ''
    let time2 = ''

    if (times.length > 0) {
      time1 = times[0]
    }
    if (times.length > 1) {
      time2 = times[1]
    }

    return [time1, time2]
  }
  const refresh = useCallback(async () => {
    const nTimes = await trainTimes('N')
    const nOwlTimes = await trainTimes('N_OWL')
    const times = nTimes.concat(nOwlTimes)

    let [time1, time2] = getTimes(times)

    const twentyNineTimes = await trainTimes('29', true)
    let [twonine1, twonine2] = getTimes(twentyNineTimes)

    setContents(
      <div className='container'>
        <div className='route'>N Train</div>
        <div className='time'>{time1}</div>
        <div className='time'>{time2}</div>
      </div>
    )
    setContents2(
      <div className='container'>
        <div className='route'>29 Bus</div>
        <div className='time'>{twonine1}</div>
        <div className='time'>{twonine2}</div>
      </div>
    )
  }, [])

  useEffect(() => {
    refresh()

    const timer = setInterval(() => {
      refresh()
    }, 30000)

    return () => {
      clearInterval(timer)
    }
  }, [refresh])

  return (
    <div className='App'>
      {contents}
      {contents2}
    </div>
  )
}

export default App
