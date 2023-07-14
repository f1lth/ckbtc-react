import React from 'react';
import icLogo from "./assets/ic.png";
import QRCode from "react-qr-code";

import { fetchTransactions } from './utils';

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


//https://rosetta-api.internetcomputer.org/search/transactions
// {"network_identifier": {"blockchain": "Internet Computer", "network": "00000000000000020101"}, 
// "account_identifier": {"address": "{accountId}"}}
const get_transaction_updates_ckbtc = (addr) => {
  console.log("get_transaction_updates_ckbtc called with address " + addr)

};

///https://icrc-api.internetcomputer.org/api/v1/ledgers/mxzaz-hqaaa-aaaar-qaada-cai/accounts/{principal}/transactions?limit=10
const get_transaction_updates_icp = async (addr) => {
  console.log("get_transaction_updates_icp called with address " + addr)
  let url = "https://icrc-api.internetcomputer.org/api/v1/ledgers/mxzaz-hqaaa-aaaar-qaada-cai/accounts/" + addr + "/transactions?limit=10";

  const response = await fetch(url);
  const ck_btc_transactions = await response.json();
  console.log(ck_btc_transactions); 

};

const TRANSACTION_LIMIT = 10

function Recieve({ address, showTransactions, displayTransactions, goBack }) {

  const [data, setData] = React.useState(null);

  // constantly poll every 30s for change in data
  //React.useEffect(load)

  React.useEffect(() => {

    const fetch = async () => {
      const fetchedData = await fetchTransactions(address, TRANSACTION_LIMIT);
      console.log('showing transactions?')
      setData(fetchedData);
    }
    fetch()
    .catch(console.error)
  }, []);


  React.useEffect(() => {
    const timer = setInterval(() => {
      console.log('refetch ckBTC and ICP');
      get_transaction_updates_ckbtc(address) 
      get_transaction_updates_icp(address) 
    }, 5000);
    return () => clearInterval(timer);
  }, []);

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
