import React from 'react';

const WALLET_PATTERN = /^(([a-zA-Z0-9]{5}-){4}|([a-zA-Z0-9]{5}-){10})[a-zA-Z0-9]{3}(-[a-zA-Z0-9]{7}\.[a-fA-F0-9]{1,64})?$/;

const whoamiStyles = {
  border: "1px solid #1a1a1a",
  marginBottom: "1rem",
};

const logoStyles = {
  flex: "0 0 auto",
  width: "34px",
  height: "20px",
};

function Send({ goBack }) {
  const [to, setTo] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [isValid, setIsValid] = React.useState(true); // State variable for input validity

  async function  handleTransfer () {
    if (to !== "") {
      if (WALLET_PATTERN.test(to)) {
        setTo(address)
        setIsValid(true); // Set input validity to true if the address is valid
        // do ICP transfer
        // if success: do modal with success
      } else {
        setIsValid(false); // Set input validity to false if the address is invalid
      }
    }
  }
  

  return (
    <div className="container">
      <h2>Transfer ckBTC</h2>
         <input
            placeholder="Send ckBTC to..."
            value={to}
            onChange={(e) => setTo(e.target.value)}
            style={{ borderColor: isValid ? "" : "red" }} // Add red border if input is invalid
          />
          {!isValid && <p style={{ color: "red" }}>Invalid address</p>} {/* Display error message if input is invalid */}
          <input
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button type="button" id="addressButton" onClick={handleTransfer}>
            Transfer Funds
          </button>
        <button type="button" id="back" onClick={goBack}>
          Go back
        </button>
    </div>
  );
}

export default Send;
