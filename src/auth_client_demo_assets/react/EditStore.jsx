import React from 'react';

import Popup from './Popup';

import { useAuth } from './use-auth-client';

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

function EditStore({ goBack, initPopup }) {
  const [name, setName] = React.useState("");
  const [alertEmail, setAlertEmail] = React.useState("");
  const [wallet, setWallet] = React.useState("");
  const [isValid, setIsValid] = React.useState(true); // State variable for input validity

  const [showPopup, setShowPopup] = React.useState(false);

  const { actor, logout } = useAuth();


  React.useEffect(() => {
    const fetch = async () => {
      const store = await actor.getCheckouts();

      if (store.length == 0) {  
        setShowPopup(true)
      }
    };
    fetch().catch((err) => console.log(err));
  }, []);



  const updateStore = async  () => {
    // call to backend
    const whoami = await actor.whoami();

    const chanl = {
      api_key : alertEmail,
      url : 'NA',
      service : 'email',
      enabled : true,
    }
    const newStore = {
      updated_at: Date.now(),
      owner: whoami,
      wallet: wallet,
      notification_channels: [chanl]
    }
   
    console.log('attempting to update store with', newStore)
    const response = await actor.addCheckout(newStore);
    
    console.log(response)
    

    // check if response was ok: "updated existing profile" and if so display happy modal
    if (response.ok == 'updated existing profile'){
      setShowPopup(true)
      //goBack()
    }
  }
    
  return (
    <div className="container">
      {initPopup && <Popup 
        header_text='Please set up your store profile'
        body_text='You need to set up your store profile before you can start accepting payments.'
      />}
      {showPopup && <Popup 
        header_text='Success!'
        body_text='Your store profile was updated.'
      />}
      <h2>Edit store profile</h2>
         <input
            placeholder="Wallet principal"
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            style={{ borderColor: isValid ? "" : "red" }} // Add red border if input is invalid
          />
          {!isValid && <p style={{ color: "red" }}>Invalid address</p>} {/* Display error message if input is invalid */}
          <input
            placeholder="Update alert email"
            value={alertEmail}
            onChange={(e) => setAlertEmail(e.target.value)}
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
