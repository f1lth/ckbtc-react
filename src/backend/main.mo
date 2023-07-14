import Buffer "mo:base/Buffer";
import Iter "mo:base/Iter";
import Result "mo:base/Result";
import Array "mo:base/Array";
import Time "mo:base/Time";
import Debug "mo:base/Debug";
import Principal "mo:base/Principal";

import Types "Types";
import Watcher "Watcher";

/// Simple ICP / ckBTC Checkout
/// Registered users can keep a profile and load saved addressess and notification channels
shared( init_owner ) actor class PaymentWatcher(init_signers : ?[Principal]) {

  type CheckoutProfile = Types.CheckoutProfile;
  type NotificationChannel = Types.NotificationChannel;  
  
  private let CONFIG_TEST_MODE : Bool = true;
  private let OWNER : Principal = init_owner.caller;

  stable var keepers : ?[Principal] = init_signers; //if provided during install, these principals have admin access
  stable var data_backup : [CheckoutProfile] = [];
  var checkoutStorage = Buffer.fromIter<CheckoutProfile>(data_backup.vals());
  var anonCheckoutStorage = Buffer.Buffer<CheckoutProfile>(1);
  var keeperStorage = Buffer.Buffer<Principal>(5);

  system func preupgrade() {
    data_backup := Iter.toArray(checkoutStorage.vals());
    keepers := ?Iter.toArray(keeperStorage.vals());
  };

  system func postupgrade() {
    data_backup := [];
  };

  private func _findCheckout(checkouts : Buffer.Buffer<CheckoutProfile>, checkoutOwner: Principal) : ?Nat{
      var index : ?Nat = null;
      var checkoutArray = Iter.toArray(checkouts.vals());
      for (i in checkoutArray.keys()) {
        if(checkoutArray[i].owner == checkoutOwner){
          return ?i;
        };          
      };        
      return null;
  };

  public query func owner() : async Principal {
    	return OWNER;      
  };

  public query ({ caller }) func whoami() : async Principal {
    	return caller;
  };
 
  //upsert a checkout
  public shared ({ caller }) func addCheckout(checkoutProfile : CheckoutProfile) : async Result.Result<Text, Text> {      

    if(CONFIG_TEST_MODE){
      Debug.print("CALLER " # debug_show(caller));
      Debug.print("Profile Owner " # debug_show(checkoutProfile.owner));    
    };

    var isAnon = Principal.isAnonymous(caller);
    Debug.print("isAnon " # debug_show(isAnon));
    if(isAnon){            
      return #err("no anon cart storage - please login");
    };

    let clone : CheckoutProfile = { 
        owner = caller;
        updated_at = Time.now();
        wallet = checkoutProfile.wallet;      
        notification_channels = checkoutProfile.notification_channels;
    };
  
    let checkoutIndex = _findCheckout(checkoutStorage, caller);
    switch(checkoutIndex){
        case null{              
            checkoutStorage.add(clone);
            Debug.print("did not find checkout, adding new")
        };
        case(?checkoutIndex){            
            checkoutStorage.put(checkoutIndex, clone);
            Debug.print("checkout exists, updating");
        };
    };
    return #ok("updated existing profile");    
    
  };

  // delete my checkout
  public shared ({ caller }) func deleteCheckout() : async Bool {
    var isAnon = Principal.isAnonymous(caller);
    if(CONFIG_TEST_MODE){
      Debug.print("deleteCheckout isAnon " # debug_show(isAnon));
    };    
    if(isAnon){
      Debug.print("anon can't delete checkout");
      return false;
    };    
    let idx = _findCheckout(checkoutStorage, caller);
    switch(idx){
      case null{       
        return false;
      };
      case(?idx){
        let x = checkoutStorage.remove(idx);
        return true;       
      };
    };
  };

  // get my checkouts
  public shared query ({ caller }) func getCheckouts() : async [CheckoutProfile] {    
    let b = Buffer.Buffer<CheckoutProfile>(10);    
    b.append(checkoutStorage);
    b.filterEntries(func(x : Nat, yo : CheckoutProfile){
      return yo.owner == caller;
    });    
    Iter.toArray(b.vals());
  };

  // get my checkouts - admin
  public shared query ({ caller }) func getCheckoutsOwner() : async [CheckoutProfile] {
    //assert(caller == OWNER or Buffer.contains(keeperStorage));
    if(Buffer.contains(keeperStorage, caller, Principal.equal) == false){
      return [];
    };    
    return Iter.toArray(checkoutStorage.vals());
  };

  
  public shared ({ caller }) func clearCheckouts() : async Bool {    
    //assert(caller == OWNER);    
    if(Buffer.contains(keeperStorage, caller, Principal.equal) == false){
      return false;
    };
    anonCheckoutStorage := Buffer.Buffer<CheckoutProfile>(0);
    checkoutStorage := Buffer.Buffer<CheckoutProfile>(0);
    return true;
  };

  
  public query func getCheckoutCount() : async Nat {
      let b = Buffer.Buffer<CheckoutProfile>(10);
      b.append(anonCheckoutStorage);
      b.append(checkoutStorage); //filter for caller?
      Iter.toArray(b.vals()).size();
  };

  public query func greet(name : Text) : async Text {
    return "Hello, max this is your input: " # name # "!";
  };

  public func get_icp_transactions(accountId : Text) : async Text {    
    //return "Error - not implemented";
    //let account = "xxx";
    //let w = Watcher.Watcher(CONFIG_TEST_MODE);
    //return await w.get_icp_usd_exchange();
    //let p : ?[CheckoutProfile] = null;
    let watcher = Watcher.Watcher(CONFIG_TEST_MODE, null);
    return await watcher.get_icp_transactions(accountId);

  };  

  
};