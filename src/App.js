import { Route } from "react-router-dom";
import Home from "./views/home";
import MainLayout from "./layouts/main";
import Mis_nfts from "./views/Mis_nfts";
import MarketSelvaPunks from "./views/Marketplace";
import Financiamiento from "./views/financiamiento";
import Selvapunks from "./views/Selvapunks";

function App() {
  return (
    <MainLayout>
      <Route path="/" exact component={Home} />
      <Route path="/Mis_nfts" exact component={Mis_nfts} /> 
      <Route path="/MarketSelvaPunks" exact component={MarketSelvaPunks} />
      <Route path="/Financiamiento" exact component={Financiamiento} />
      <Route path="/Selvapunks" exact component={Selvapunks} />
    </MainLayout>
  );
}

export default App;
