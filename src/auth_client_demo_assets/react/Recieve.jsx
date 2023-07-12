import React from 'react';
import icLogo from "./assets/ic.png";
import QRCode from "react-qr-code";

import Transaction from './Transaction';

const whoamiStyles = {
  border: "1px solid #1a1a1a",
  marginBottom: "1rem",
};

const logoStyles = {
  flex: "0 0 auto",
  width: "34px",
  height: "20px",
};

function Recieve({ address, data, showTransactions, displayTransactions, goBack }) {
    console.log('just data -- inside recieve', data)
    console.log('just data?.data -- inside recieve', data?.data)

  return (
    <div className="container">
      <div className="smallContainer">
        <h3>Send ckBTC</h3>
        <QRCode value={address} />
        <div className='rowContainer'>
          <img src={icLogo} alt="Internet Computer Logo" style={logoStyles} />
          <h3>ckBTC: {address.slice(0, 4) + "..."}</h3>
        </div>
        {data && showTransactions &&
        <div className='container' style={whoamiStyles}>
          {(data?.data || []).map((transaction, index) => (
            <Transaction key={index} transaction={transaction} />
          ), [])}
        </div>}
      </div>
      <button type="button" id="addressButton" onClick={displayTransactions}>
        {showTransactions ? "Hide" : "Show"} Transactions
      </button>
      <button type="button" id="addressButton" onClick={goBack}>
        Go back
      </button>
    </div>
  );
}

export default Recieve;
