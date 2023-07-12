import React from "react";
import { useAuth } from "./use-auth-client";
import Recieve from "./Recieve";
import Send from "./Send";
import EditStore from "./EditStore";

import icLogo from "./assets/ic.png";

import { fetchTransactions }from "./utils";

import { Principal } from "@dfinity/principal";



/**
 * 1) if no store then create store
 * 
 * 2) if store then show store
 * 
 * 3) main screen has follinwg options
 *   a) recieve ckBTC
 *   b) send ckBTC
 *   c) edit store
 *   d) logout
 *  
 */
const TRANSACTION_LIMIT = 10

const whoamiStyles = {
  border: "1px solid #1a1a1a",
  marginBottom: "1rem",
};

const logoStyles = {
  flex: "0 0 auto",
  width: "34px",
  height: "20px",
};

function LoggedIn() {
  const [activeComponent, setActiveComponent] = React.useState('default');
  const [address, setAddress] = React.useState(""); // State variable for the fetched data
  const [result, setResult] = React.useState("");
  const [data , setData] = React.useState(null); // State variable for the fetched data
  const [showTransactions, setShowTransactions] = React.useState(false); // State variable for the fetched data

  const { whoamiActor, logout } = useAuth();

  React.useEffect(() => {

    const fetch = async () => {
      const whoami = await whoamiActor.whoami();

      const store = await whoamiActor.getCheckouts();
      console.log(store)
      const fetchedData = await fetchTransactions(whoami.toString(), TRANSACTION_LIMIT);
      console.log('fake local login', whoami.toString())
      setAddress(whoami.toString())
      setData(fetchedData);
    }
    fetch()
    .catch(console.error)
  }, []);
    

  function displayTransactions () {
    setShowTransactions(!showTransactions);
  }

  const goBack = () => {
    setActiveComponent('default')
  }
  

  const renderComponent = () => {
    switch (activeComponent) {
      case 'default':
        return <div className='container'> <h1>Storefront Manager</h1>
        <div className='rowContainer'>
          <img src={icLogo} alt="Internet Computer Logo" style={logoStyles} />
          <h3>ckBTC: {address.slice(0, 4) + "..."}</h3>
        </div>
        <p>Monitor incoming payments and setup your store</p>
        <button id="recieve" onClick={() => setActiveComponent('recieve')} > Recieve ckBTC </button>
        <button id="send" onClick={() => setActiveComponent('send')} > Send ckBTC </button>
        <button id="edit" onClick={() => setActiveComponent('edit')} > Edit store profile </button>
        <button id="logout" onClick={logout}>
          Log out
        </button></div>
          
      case 'recieve':
        return <Recieve 
          address={address} 
          data={data} 
          showTransactions={showTransactions} 
          displayTransactions={displayTransactions} 
          goBack={goBack} 
          />;
      case 'send':
        return <Send
          goBack={goBack}/>
      case 'edit':
        return <EditStore
        goBack={goBack}/>
      default:
        return null;
    }
  };

  return (
    <>{renderComponent()}</>
    
  );
}

export default LoggedIn;
