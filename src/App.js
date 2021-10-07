import { BrowserRouter,Switch,Route } from 'react-router-dom';
import './App.css';
import Home from './components/home/home';
import Room from './components/room/room';


function App() {
  
  return (
    <div>
      <BrowserRouter>
        <Switch>
          <Route path="/" component={Home} exact={true}></Route>
          <Route path="/room/:id" component={Room}></Route>
        </Switch>
      </BrowserRouter>

    </div>
  );
}

export default App;
