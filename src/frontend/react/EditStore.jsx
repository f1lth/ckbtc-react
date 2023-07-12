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

function EditStore({ goBack }) {
  const [name, setName] = React.useState("");
  const [alertEmail, setAlertEmail] = React.useState("");
  const [wallet, setWallet] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [isValid, setIsValid] = React.useState(true); // State variable for input validity



  const   updateStore = async  () => {
    // call to backend
    // open a modal when the store is updated
    console.log('updated store')
  }
    

  



  return (
    <div className="container">
      <h2>Edit store profile</h2>
         <input
            placeholder="Set store name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ borderColor: isValid ? "" : "red" }} // Add red border if input is invalid
          />
          {!isValid && <p style={{ color: "red" }}>Invalid address</p>} {/* Display error message if input is invalid */}
          <input
            placeholder="Update alert channel"
            value={alertEmail}
            onChange={(e) => setAlertEmail(e.target.value)}
          />
          <input
            placeholder="Update wallet"
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
          />
          <button type="button" id="addressButton" onClick={updateStore}>
            Save
          </button>
        <button type="button" id="back" onClick={goBack}>
          Go back
        </button>
    </div>
  );
}

export default EditStore;
