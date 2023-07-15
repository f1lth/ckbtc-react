import React from 'react';
import icLogo from "./assets/ic.png";
import QRCode from "react-qr-code";
import { fetchTransactionsCKBTC, fetchTransactionsICP } from './utils';
import Transaction from './Transaction';
import SHA256 from 'crypto-js/sha256';
import Popup from './Popup';

const CKBTC_CANISTER_ID = "mxzaz-hqaaa-aaaar-qaada-cai";

const whoamiStyles = {
  border: "1px solid #1a1a1a",
  marginBottom: "1rem",
};

const logoStyles = {
  flex: "0 0 auto",
  width: "34px",
  height: "20px",
};


const notify_client = () => {
  console.log("notify_client")
}

const has_data_changed = (old_data, new_data) => {
  const old_records = old_data.data.map(obj =>{
    let h = obj.to_account + obj.from_account + obj.amount + obj.index;
    const hashedData = SHA256(h).toString();    
    return hashedData;
  });

  const new_records = new_data.data.map(obj =>{
    let h = obj.to_account + obj.from_account + obj.amount + obj.index;
    const hashedData = SHA256(h).toString();    
    return hashedData;
  });
  console.log(old_records)
  console.log(new_records)

  if(JSON.stringify(old_records) != JSON.stringify(new_records)){
    return true;
  }else{
    return false;
  }
}

const getTransactionData = (tx, principalId) => {

  const tx_type = principalId === tx.to_account ? 'recieved' : 'sent';
  const tx_amt = tx.amount / 100000000;
  const tx_symbol = tx.ledger_canister_id === CKBTC_CANISTER_ID ? 'ckBTC' : 'ICP';
  
  return {
    type: tx_type,
    val: tx_amt,
    symbol: tx_symbol
  }
}

const TRANSACTION_LIMIT = 10

function Recieve({ principalId, accountId, showTransactions, displayTransactions, goBack }) {

  const [dataICP, setDataICP] = React.useState(null);
  const [dataCKBTC, setDataCKBTC] = React.useState(null);
  const [showPopup, setShowPopup] = React.useState(false);
  const [popupMessage, setPopupMessage] = React.useState(null);

  React.useEffect(() => {
    const fetch = async () => {
      try {
        const ckbtcData = await fetchTransactionsCKBTC(principalId, TRANSACTION_LIMIT);
        const icpData = await fetchTransactionsICP(accountId, TRANSACTION_LIMIT);
        setDataCKBTC(ckbtcData);
        setDataICP(icpData);
        console.log(icpData)
      } catch (error) {
        console.error(error);
      }
    };
    fetch();
  }, []);
  
  React.useEffect(() => {
    const timer = setInterval(async () => {
      console.log('refetch ckBTC and ICP');   
      const newCKBTCData = await fetchTransactionsCKBTC(principalId, TRANSACTION_LIMIT);
      const newICPData = await fetchTransactionsICP(accountId, TRANSACTION_LIMIT);
      var has_changed = has_data_changed(dataCKBTC, newCKBTCData)
      console.log("has changed: " + has_changed)
      if(has_changed){
        setDataCKBTC(newCKBTCData);
        const tx_data = getTransactionData(newCKBTCData.data[0]);
        setPopupMessage(tx_data);
        setShowPopup(true);
        notify_client();
        // close the popup after a couple seconds
        setTimeout(() => {
          setShowPopup(false)
        }, 6000);
      };
    }, 20000);  
    return () => clearInterval(timer);
  }, [dataCKBTC, dataICP]);

  return (
    <div className="container">
      {showPopup && 
      <Popup 
        header_text="New Transaction!"
        body_text={`You ${popupMessage.type} a new transaction of ${popupMessage.val} ${popupMessage.symbol}`}
      />}
      <div className="smallContainer">
        <h3>Send ckBTC</h3>
        <QRCode value={principalId} />
        <div className='rowContainer'>
          <img src={icLogo} alt="Internet Computer Logo" style={logoStyles} />
          <h3>ckBTC: {principalId.slice(0, 4) + "..."}</h3>
        </div>
        {dataCKBTC && showTransactions &&
        <div className='borderless_container' >
          <h1>Recent Transactions: </h1>
          <>
            {dataCKBTC.data.length == 0 ? 
              <h3>No transactions yet</h3> 
            : 
              (dataCKBTC?.data || []).map((transaction, index) => (
                <Transaction 
                  key={index} 
                  transaction={transaction} 
                  principalId={principalId}
                />
              ), [])
            }
          </>
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
