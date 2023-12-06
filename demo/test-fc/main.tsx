import React, {useState} from 'react';
import ReactDOM from 'react-dom/client'

const App = () => {
  const [n, setN] = useState(0)
  window.setN = setN
  return <span x={n > 3 ? n : 1}>{n}</span>
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />,
)
