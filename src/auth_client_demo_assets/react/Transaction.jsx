import React from 'react';
import ckBTC_Logo from "./assets/ckbtc big-modified.png" 
import icLogo from "./assets/ic.png";

const CKBTC_CANISTER_ID = "mxzaz-hqaaa-aaaar-qaada-cai";

function Transaction({ transaction, principalId}) {

  const [coinLogo, setCoinLogo] = React.useState(icLogo);
  const [recieved, setReceived] = React.useState(false);
  
  console.log(transaction)

  React.useEffect(() => {
    if (transaction.ledger_canister_id == CKBTC_CANISTER_ID) {
      setCoinLogo(ckBTC_Logo);
    }  
    if (transaction.to_account === principalId) { //if tx was to me

      setReceived(true);

    } 
  }, []);


  return (

      <div className='borderless_container'>
      <div className='txContainer'>
        <div className='stackContainer'>
          <img src={coinLogo} alt="Internet Computer Logo" style={{width: '50px', height: '50px'}} />
        </div>
        <div className='stackContainer'>
          <h3 >{recieved ? "+" : "-"} {transaction.amount / 100000000}</h3>
          <p> {recieved ? `from: ${transaction.from_account.slice(0,4) + '...'}` : `to: ${transaction.to_account.slice(0,4) + '...'}`}</p>
        </div>
      </div>
    </div>
  );
}

export default Transaction;
