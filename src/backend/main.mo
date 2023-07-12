import Buffer "mo:base/Buffer";
import Iter "mo:base/Iter";
import Result "mo:base/Result";
import Array "mo:base/Array";
import Time "mo:base/Time";
import Debug "mo:base/Debug";
import Principal "mo:base/Principal";

import Types "Types";
import Watcher "Watcher";

/// Simple actor to allow a user to monitor a token address for activity
/// Anon users can setup a quick watcher but will not be persisted 
/// Registered users can keep a profile and load saved addressess and notification channels
shared( init_owner ) actor class PaymentWatcher() {

  type CheckoutProfile = Types.CheckoutProfile;
  type NotificationChannel = Types.NotificationChannel;  
  
  private let CONFIG_TEST_MODE : Bool = true;
  private let OWNER : Principal = init_owner.caller;

  stable var data_backup : [CheckoutProfile] = [];
  var checkoutStorage = Buffer.fromIter<CheckoutProfile>(data_backup.vals());
  var anonCheckoutStorage = Buffer.Buffer<CheckoutProfile>(1);

  system func preupgrade() {
    data_backup := Iter.toArray(checkoutStorage.vals());
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
      //return init_owner.caller;
  };

  public query ({ caller }) func whoami() : async Principal {
    	return caller;
  };

  public func test_watcher() : async Text {   
    
    let account = "xxx";
    //let w = Watcher.Watcher(CONFIG_TEST_MODE);
    //return await w.get_icp_usd_exchange();
    let p : [CheckoutProfile] = [];
    let watcher = Watcher.Watcher(CONFIG_TEST_MODE, p);
    return await watcher.get_icp_transactions_for_account2(account);

  };

  /// allow anon or authenticated checkouts created
  /// anon checkouts are not stable and limited to 1 per session
  /// todo: anon state is shared 
  public shared ({ caller }) func addCheckout(checkoutProfile : CheckoutProfile) : async Result.Result<Text, Text> {      

    if(CONFIG_TEST_MODE){
      Debug.print("CALLER " # debug_show(caller));
      Debug.print("Profile Owner " # debug_show(checkoutProfile.owner));    
    };    

    var isAnon = Principal.isAnonymous(caller);
    Debug.print("isAnon " # debug_show(isAnon));

    let clone : CheckoutProfile = { 
        owner = caller;
        updated_at = Time.now();
        wallets = checkoutProfile.wallets;      
        notification_channels = checkoutProfile.notification_channels;
    };

    if(isAnon){
      //anonCheckoutStorage.add(clone);
      //return #ok("added anon profile");
      return #err("no anon carts - login");
    }else{      
      if(caller != checkoutProfile.owner){
        return #err("invalid principal - please login");
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
    
  };

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

  public shared query ({ caller }) func getCheckouts() : async [CheckoutProfile] {
      let b = Buffer.Buffer<CheckoutProfile>(10);
      //b.append(anonCheckoutStorage);
      b.append(checkoutStorage); //filter for caller?
      return Iter.toArray(b.vals());
  };

  //todo: add permissions
  public shared ({ caller }) func clearCheckouts() : async Bool {    
    anonCheckoutStorage := Buffer.Buffer<CheckoutProfile>(0);
    checkoutStorage := Buffer.Buffer<CheckoutProfile>(0);
    return true;
  };

  // public func getCheckoutCount() : async Nat {
  //   var x = await getCheckouts();
  //   return x.size();
  // };

  public query func getCheckoutCount() : async Nat {
      let b = Buffer.Buffer<CheckoutProfile>(10);
      b.append(anonCheckoutStorage);
      b.append(checkoutStorage); //filter for caller?
      Iter.toArray(b.vals()).size();
  };

  public query func greet(name : Text) : async Text {
    return "Hello, max this is your input: " # name # "!";
  };

  
};