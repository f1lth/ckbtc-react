import React from 'react';
import Popup from './Popup';
import { useAuth } from './use-auth-client';

const WALLET_PATTERN = /^(([a-zA-Z0-9]{5}-){4}|([a-zA-Z0-9]{5}-){10})[a-zA-Z0-9]{3}(-[a-zA-Z0-9]{7}\.[a-fA-F0-9]{1,64})?$/;

/**
 *
 * @param goBack - function to return to main screen
 * @param initPopup - show a popup when the component mounts for first time 
 * 
 */
function EditStore({ goBack, initPopup }) {
  const [alertEmail, setAlertEmail] = React.useState("");
  const [wallet, setWallet] = React.useState("");
  const [isValid, setIsValid] = React.useState(true); // State variable for input validity
  const [showPopup, setShowPopup] = React.useState(false);

  const { actor } = useAuth();

  // on mount if there's a store
  React.useEffect(() => {
    const fetch = async () => {
      const store = await actor.getCheckouts();
      if (store.length == 0) {  
        initPopup = true;
      }
    };
    fetch().catch((err) => console.log(err));
  }, []);

  // push a store update to backend 
  const updateStore = async  () => {

    // enter a valid wallet
    if (!WALLET_PATTERN.test(wallet)) {
      setIsValid(false);
      return;
    } setIsValid(true);

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
   
    // push the update
    console.log('attempting to set a new store');
    const response = await actor.addCheckout(newStore);

    // check if store set, if so display update modal
    if (response.ok == 'updated existing profile'){
      setShowPopup(true)
      // close the popup after a few seconds
      setTimeout(() => {
        setShowPopup(false)
      }, 6000);
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
            style={{ borderColor: isValid ? "" : "red" }}
          />
          {!isValid && <p style={{ color: "red" }}>Invalid address</p>}
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
