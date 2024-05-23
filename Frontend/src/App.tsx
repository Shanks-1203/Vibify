import { Provider } from 'react-redux';
import './App.css';
import { store } from './Store';
import Routing from './Routing';
import HomeLayout from './Layouts/HomeLayout';

function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <Routing />
      </div>
    </Provider>
  );
}

export default App;
