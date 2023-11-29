import React, {useState} from 'react';
import ReactDOM from 'react-dom/client'

const App = () => {
  const [n, setN] = useState(0)
  window.setN = setN
  return <span>{n}</span>
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />,
)
