import React, { useState, useEffect } from 'react'
import axios from "axios";

export default function Config()
{

  const [ config, setConfig ] = useState(null);

  useEffect(() =>
  {
    const fetchConfig = async () =>
    {
      try
      {
        const url = `http://` + window.location.hostname + `:3001/config`;
        axios.get(url).then((res) =>
        {
          setConfig(res.data);
        })
      }
      catch (e)
      {
        console.log(e);
        setConfig(null);
      }
    }
    fetchConfig();
  }, []);

  return (
    <div>
      {!config && <div>Loading</div>}
      {config && <div>{config.message}</div>}
    </div>
  )
}