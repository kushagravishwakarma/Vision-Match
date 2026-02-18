import HomePage from './HomePage';
import EntryPage from './entryPage';
import './css/App.css';
import { useEffect, useState } from "react";

function App() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      {show ? (
        <HomePage />
      ) : (
        <EntryPage />
      )}
    </div>
  );
}

export default App;