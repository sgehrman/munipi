import React, { useState, useEffect } from 'react'
import './App.scss'
import axios from 'axios'

function App() {
  const [contents, setContents] = useState(null)

  async function trainTimes(line) {
    const inbound = `http://webservices.nextbus.com/service/publicJSONFeed?command=predictions&a=sf-muni&r=${line}&s=5206`

    const result = await axios.get(inbound)

    const direction = result.data.predictions.direction

    if (direction) {
      const times = []

      let directions = []
      if (!Array.isArray(direction)) {
        directions.push(direction)
      } else {
        directions = direction
      }

      directions.forEach(direction => {
        const pred = direction.prediction
        let array = []

        if (!Array.isArray(pred)) {
          array.push(pred)
        } else {
          array = pred
        }

        array.forEach(p => {
          times.push(parseInt(p.minutes))
        })
      })

      return times
    }

    return []
  }

  async function refresh() {
    const nTimes = await trainTimes('N')
    const nOwlTimes = await trainTimes('N_OWL')

    const times = nTimes.concat(nOwlTimes)

    let time1 = ''
    let time2 = ''

    times.sort(function(a, b) {
      return a - b
    })

    if (times.length > 0) {
      time1 = times[0]
    }
    if (times.length > 1) {
      time2 = times[1]
    }

    setContents(
      <div className='container'>
        <div className='route'>N Inbound</div>
        <div className='time'>
          {time1}
          <span className='mins'> min</span>
        </div>
        <div className='time'>
          {time2}
          <span className='mins'> min</span>
        </div>
      </div>
    )
  }

  useEffect(() => {
    refresh()

    const timer = setInterval(() => {
      refresh()
    }, 30000)

    return () => {
      clearInterval(timer)
    }
  }, [])

  return <div className='App'>{contents}</div>
}

export default App
