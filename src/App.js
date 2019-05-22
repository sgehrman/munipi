import React, { useState, useEffect } from "react";
import "./App.scss";
import axios from "axios";

function App() {
  const [contents, setContents] = useState(null);

  async function refresh() {
    const inbound =
      "http://webservices.nextbus.com/service/publicJSONFeed?command=predictions&a=sf-muni&r=N_OWL&s=5206";

    const result = await axios.get(inbound);

    const direction = result.data.predictions.direction;

    if (direction) {
      const predictions = direction.prediction;

      const times = [];

      predictions.forEach(direction => {
        times.push(parseInt(direction.minutes));
      });

      let time1 = "";
      let time2 = "";

      times.sort();

      if (times.length > 0) {
        time1 = times[0] + " mins";
      }
      if (times.length > 1) {
        time2 = times[1] + " mins";
      }

      setContents(
        <div>
          <div>N Inbound</div>
          <div className="time">{time1}</div>
          <div className="time">{time2}</div>
        </div>
      );
    }
  }

  useEffect(() => {
    refresh();

    const timer = setInterval(() => {
      refresh();
    }, 10000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return <div className="App">{contents}</div>;
}

export default App;
