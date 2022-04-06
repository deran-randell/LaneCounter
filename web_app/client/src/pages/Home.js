import React, {useEffect} from 'react'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  let navigate = useNavigate();

  useEffect(() => {
    navigate(`/dashboard`)
  }, []);

  return (
    <div className="two-column">Moth Counter Home</div>
  );
}