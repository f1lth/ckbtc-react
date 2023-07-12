import React from "react";
import { useAuth } from "./use-auth-client";
import Recieve from "./Recieve";
import Send from "./Send";

import { fetchTransactions }from "./utils";



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

      console.log('inside fetch', whoami);
      console.log('inside fetch333', JSON.stringify(whoami))
      const temp_array = new Uint8Array(whoami._arr);
      const temp_address = base32Encode(temp_array, 'RFC4648-HEX').toLowerCase();
      console.log('inside fetch2', temp_address)
      setAddress(temp_address)
      const fetchedData = await fetchTransactions(temp_address, TRANSACTION_LIMIT);
      setData(fetchedData);
      console.log(fetchedData);
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
  
  const handleClick = async () => {
    const whoami = await whoamiActor.whoami();
    console.log('who am i ??', whoami);
    setResult(whoami);
  };

  const renderComponent = () => {
    switch (activeComponent) {
      case 'default':
        return <div className='container'> <h1>Storefront Manager</h1>
        <p>Monitor incoming payments and setup your store</p>
        <button
          type="button"
          id="whoamiButton"
          className="primary"
          onClick={handleClick}
        >
          Who am I?
        </button>
        {result && (
        <><h1>{JSON.stringify(result)}</h1>
        <input
          value={result}
        /></>
        )}
        <input
          type="text"
          readOnly
          id="whoami"
          value={result}
          placeholder="your Identity"
          style={whoamiStyles}
        />
        <button id="recieve" onClick={() => setActiveComponent('recieve')} > Recieve ckBTC </button>
        <button id="send" onClick={() => setActiveComponent('send')} > Send ckBTC </button>
        <button id="edit" onClick={() => setActiveComponent('edit')} > Edit store profile </button>
        <button id="logout" onClick={logout}>
          log out
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
