import React from "react";
import Recieve from "./Recieve";
import Send from "./Send";
import EditStore from "./EditStore";
import icLogo from "./assets/ic.png";
import { useAuth } from "./use-auth-client";

const logoStyles = {
  flex: "0 0 auto",
  width: "34px",
  height: "20px",
};

function LoggedIn() {
  const [activeComponent, setActiveComponent] = React.useState('default');
  const [principalId, setPrincipalId] = React.useState("");
  const [accountId, setAccountId] = React.useState("");
  const [showPopup, setShowPopup] = React.useState(false);
  const [showTransactions, setShowTransactions] = React.useState(false); // State variable for the fetched data

  const { actor, logout } = useAuth();

  // on first launch, fetch store data
  React.useEffect(() => {
    const fetch = async () => {
      const whoami = await actor.whoami();
      const store = await actor.getCheckouts();
      // if there's no store lets make one
      console.log(store);
      if (store.length == 0){
        setShowPopup(true)
        setActiveComponent('edit')
      } else {
        setShowPopup(false);
      }
      
      setAccountId(whoami.toString())
      setPrincipalId(whoami.toHex())
    }
    fetch()
    .catch(console.error)
  }, []);
    
  // show transactions on gui
  function displayTransactions () {
    setShowTransactions(!showTransactions);
  }

  // return to main screen
  const goBack = () => {
    setActiveComponent('default')
  }

  // chose which of the menu screens to show
  const renderComponent = () => {
    switch (activeComponent) {
      // main page
      case 'default':
        return <div className='container'> <h1>Storefront Manager</h1>
        <div className='rowContainer'>
          <img src={icLogo} alt="Internet Computer Logo" style={logoStyles} />
          <h3>ckBTC: {principalId.slice(0, 4) + "..."}</h3>
        </div>
        <p>Monitor incoming payments and setup your store</p>
        <button id="recieve" onClick={() => setActiveComponent('recieve')} > Recieve ckBTC </button>
        <button id="send"    onClick={() => setActiveComponent('send')} >    Send ckBTC </button>
        <button id="edit"    onClick={() => setActiveComponent('edit')} >    Edit store profile </button>
        <button id="logout" onClick={logout}>
          Log out
        </button></div>
      // poll for payments and check recent transations
      case 'recieve':
        return <Recieve 
          principalId={accountId} 
          accountId={accountId} 
          showTransactions={showTransactions} 
          displayTransactions={displayTransactions} 
          goBack={goBack} 
          />;
      // do a transfer
      case 'send':
        return <Send
          goBack={goBack}
          />
      // edit your storefront
      case 'edit':
        return <EditStore
        goBack={goBack}
        initPopup={showPopup}/>
      default:
        return null;
    }
  };

  return (
    <> 
      {renderComponent()} 
    </>
  );
}

export default LoggedIn;
