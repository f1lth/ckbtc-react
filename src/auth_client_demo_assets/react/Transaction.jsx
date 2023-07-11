import React from 'react';

const transactionInfoStyles = {

    marginBottom: '0.5rem',
};

function Transaction({ transaction }) {
  return (
    <div className='transaction'>
      <p >Amount: {transaction.amount}</p>
      <p >From Account: {transaction.from_account.slice(0,4) + "..."}</p>
      <p >Transaction Hash: {transaction.transaction_hash.slice(0, 4) + "..."}</p>
      <p >Timestamp: {new Date(transaction.timestamp / 1e6).toLocaleString()}</p>
    </div>
  );
}

export default Transaction;
