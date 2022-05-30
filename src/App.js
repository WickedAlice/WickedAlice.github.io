import React, { useState, useEffect } from 'react';
import { getData } from './getData';
import Banner from './Banner';
import './App.css';

const API_DATA_LINK = 'https://wickedalice.github.io/data.json';
const TARGET_LINK = 'https://intelligence.weforum.org';

function App({id, lang, layout}) {

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    getData(API_DATA_LINK, {id, lang})
      .then(({ data }) => {
        setData(data)
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <a className="Banner"
       href={TARGET_LINK}
       target="_blank"
       rel="noopener noreferrer">
      {isLoading
        ? <div className="Banner-loader"/>
        : <Banner layout={layout} data={data}/>
      }
    </a>

  );
}

export default App;
