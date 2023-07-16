import React from "react";
import { useAuth } from "./use-auth-client";
import Recieve from "./Recieve";
import Send from "./Send";
import EditStore from "./EditStore";

import { Principal } from "@dfinity/principal";

import icLogo from "./assets/ic.png";

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
  //const [address, setAddress] = React.useState(""); // State variable for the fetched data
  const [principalId, setPrincipalId] = React.useState("");
  const [accountId, setAccountId] = React.useState("");
  const [showPopup, setShowPopup] = React.useState(false);
  

  const [showTransactions, setShowTransactions] = React.useState(false); // State variable for the fetched data

  const { actor, logout } = useAuth();



  React.useEffect(() => {

    const fetch = async () => {
<<<<<<< HEAD
      const whoami = await whoamiActor.whoami();
      const store = await whoamiActor.getCheckouts();      
      // if theres no stores 
      //    make a store
      // switch (active component)
=======
      const whoami = await actor.whoami();
      const store = await actor.getCheckouts();

      if (store.length == 0){
        setActiveComponent('edit')
        setShowPopup(true)
      }
      
>>>>>>> 616dbc0 (transaction polling for ckBTC working with modal)
      setAccountId(whoami.toString())
      setPrincipalId(whoami.toHex())      
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
          <h3>ckBTC: {principalId.slice(0, 4) + "..."}</h3>
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
          principalId={accountId} 
          accountId={accountId} 
          showTransactions={showTransactions} 
          displayTransactions={displayTransactions} 
          goBack={goBack} 
          />;
      case 'send':
        return <Send
          goBack={goBack}/>
      case 'edit':
        return <EditStore
        goBack={goBack}
        showPopup={showPopup}/>

      default:
        return null;
    }
  };

  return (
    <>{renderComponent()}</>
    
  );
}

export default LoggedIn;
