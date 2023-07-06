import Iter "mo:base/Iter";
import Result "mo:base/Result";
import Array "mo:base/Array";
import Time "mo:base/Time";
import Debug "mo:base/Debug";
import Principal "mo:base/Principal";

import Types "Types";

module {

    public func test() : async Bool {
        let ic : Types.IC_ICP_Canister = actor("aaaaa-aa");
        let res = await ic.get_transaction("yo");
        return true;
    };

};



// module class Ledger() {

//     public func test() : async Bool {

//         let ic : Types.IC_ICP_Canister = actor("aaaaa-aa");

//         let res = await ic.get_transaction("yo");

//         return true;
//     };

// };