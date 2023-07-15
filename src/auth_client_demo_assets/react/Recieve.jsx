import React from 'react';
import icLogo from "./assets/ic.png";
import QRCode from "react-qr-code";
import { fetchTransactionsCKBTC, fetchTransactionsICP } from './utils';
import Transaction from './Transaction';
import SHA256 from 'crypto-js/sha256';


const whoamiStyles = {
  border: "1px solid #1a1a1a",
  marginBottom: "1rem",
};

const logoStyles = {
  flex: "0 0 auto",
  width: "34px",
  height: "20px",
};


const notify_client = (service) => {
  console.log("notify_client")
  alert("New Transaction detected ! from " + service)
  return false;
}

const compare_icp_data = (old_data, new_data) => {
  if(!old_data || !new_data){
    return false;
  }
  var old_count = old_data.total_count;
  var new_count = new_data.total_count;
  console.log("old icp count: " + old_count);
  console.log("new icp count: " + new_count);
  return old_count != new_count;

}

const compare_ckbtc_data = (old_data, new_data) => {
  if(!old_data || !new_data){
    return false;
  }
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
  // console.log(old_records)
  // console.log(new_records)
  if(JSON.stringify(old_records) != JSON.stringify(new_records)){
    return true;
  }else{
    return false;
  }
}

const TRANSACTION_LIMIT = 10

function Recieve({ principalId, accountId, showTransactions, displayTransactions, goBack }) {

  const [dataICP, setDataICP] = React.useState(null);
  const [dataCKBTC, setDataCKBTC] = React.useState(null);
  
  React.useEffect(() => {
    const fetch = async () => {
      try {
        const ckbtcData = await fetchTransactionsCKBTC(principalId, TRANSACTION_LIMIT);
        const icpData = await fetchTransactionsICP(accountId, TRANSACTION_LIMIT);
        setDataCKBTC(ckbtcData);
        console.log(ckbtcData);
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
      setDataCKBTC(newCKBTCData);
      const newICPData = await fetchTransactionsICP(accountId, TRANSACTION_LIMIT);
      setDataICP(newICPData);

      var has_ckbtc_changed = compare_ckbtc_data(dataCKBTC, newCKBTCData)
      console.log("has_ckbtc_changed: " + has_ckbtc_changed)

      var has_icp_changed = compare_icp_data(dataICP, newICPData);
      console.log("has_icp_changed: " + has_ckbtc_changed)

      if(has_ckbtc_changed){
        notify_client("ckBTC");
      };
      if(has_icp_changed){
        notify_client("ICP");
      };

    }, 5000);  
    return () => clearInterval(timer);
  }, [dataCKBTC, dataICP]);

  return (
    <div className="container">
      <div className="smallContainer">
        <h3>Send ckBTC</h3>
        <QRCode value={principalId} />
        <div className='rowContainer'>
          <img src={icLogo} alt="Internet Computer Logo" style={logoStyles} />
          <h3>ckBTC: {principalId.slice(0, 4) + "..."}</h3>
        </div>
        {dataCKBTC && showTransactions &&
        <div className='container' style={whoamiStyles}>
          {(dataCKBTC?.data || []).map((transaction, index) => (
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
