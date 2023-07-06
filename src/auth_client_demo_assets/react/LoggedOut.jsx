import React from "react";
import { useAuth } from "./use-auth-client";
import { fetchTransactions } from "./utils";

const WALLET_PATTERN = /^([a-zA-Z09-]{5}-){5}[a-zA-Z0-9]{3}$/;


const whoamiStyles = {
  border: "1px solid #1a1a1a",
  marginBottom: "1rem",
};
 

function LoggedOut() {
  const { login } = useAuth();
  const [address, setAddress] = React.useState("");
  const [polling, setPolling] = React.useState(false);
  const [isValid, setIsValid] = React.useState(true); // State variable for input validity

  function handleAddress() {
    if (address !== "") {
      if (WALLET_PATTERN.test(address)) {
        setPolling(true);
        setIsValid(true); // Set input validity to true if the address is valid
      } else {
        setIsValid(false); // Set input validity to false if the address is invalid
      }
    }
  }

  return (
    <>
    {polling ? 
    <div className="container">
      <h1> addy connected: </h1>
        <p>{address.slice(0, 6) + "..."}</p>
    </div>
    : 
    <div className="container">
      <h1>ckBTC Client</h1>
        <h2>Enter a wallet or login to continue:</h2>  
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
