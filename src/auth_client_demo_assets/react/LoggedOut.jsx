import React from "react";
import { useAuth } from "./use-auth-client";
import Recieve from './Recieve';
import icLogo from "./assets/ic.png";
import QRCode from "react-qr-code";

const WALLET_PATTERN = /^(([a-zA-Z0-9]{5}-){4}|([a-zA-Z0-9]{5}-){10})[a-zA-Z0-9]{3}(-[a-zA-Z0-9]{7}\.[a-fA-F0-9]{1,64})?$/;
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

function LoggedOut() {
  const { login } = useAuth();
  const [address, setAddress] = React.useState("");
  const [polling, setPolling] = React.useState(false);
  const [isValid, setIsValid] = React.useState(true); // State variable for input validity
  const [data, setData] = React.useState(null); // State variable for the fetched data
  const [showTransactions, setShowTransactions] = React.useState(false); // State variable for the fetched data

  function goBack () {
    setPolling(false);
  }

  function displayTransactions () {
    setShowTransactions(!showTransactions);
  }

  async function  handleAddress () {
    if (address !== "") {
      if (WALLET_PATTERN.test(address)) {
        setIsValid(true); // Set input validity to true if the address is valid
        
        setPolling(true);
      } else {
        setIsValid(false); // Set input validity to false if the address is invalid
      }
    }
  }

  return (
    <>
    {polling ? 
      <Recieve 
        address={address}         
        showTransactions={showTransactions} 
        displayTransactions={displayTransactions} 
        goBack={goBack} 
      />
    :
    <div className="container">
      <h2>ckBTC Client</h2>
        <h3>Enter a wallet or login to continue:</h3>  
         <input
            placeholder="ckBTC address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            style={{ borderColor: isValid ? "" : "red" }} // Add red border if input is invalid
          />
          {!isValid && <p style={{ color: "red" }}>Invalid address</p>} {/* Display error message if input is invalid */}
          <button type="button" id="addressButton" onClick={handleAddress}>
            Submit
          </button>
        <button type="button" id="loginButton" onClick={login}>
          Log in
        </button>
    </div>
    }
    </>
  );
}

export default LoggedOut;
