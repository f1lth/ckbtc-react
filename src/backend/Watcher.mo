import Debug "mo:base/Debug";
import Blob "mo:base/Blob";
import Cycles "mo:base/ExperimentalCycles";
import Error "mo:base/Error";
import Array "mo:base/Array";
import Nat8 "mo:base/Nat8";
import Nat64 "mo:base/Nat64";
import Text "mo:base/Text";
import Types "Types";
import serdeJson "mo:serde/JSON";

module {

    type CheckoutProfile = Types.CheckoutProfile;


    type TransactionRow = { 
       block_identifier: { index: Nat; hash: Text; };
       transaction: Transaction;
    };
   
    type Operations = {
        //type: Text;
        status: Text;
        operation_identifier: { index: Nat; };
        account: { address: Text; };
        amount: { value: Text; currency: { symbol: Text; decimals: Nat; }; };
    };

    type Transaction = {
        transaction_identifier: { hash: Text; };
        operations: [Operations];
        metadata: { block_height: Nat; memo: Text; timestamp: Nat; };
    };

    //type TransactionList = { transactions: [Transaction]; total_count: Int; };
    type TransactionList = { total_count: Nat; transactions: [TransactionRow]; };


    public class Watcher(caller_mode : Bool, caller_profile : ?CheckoutProfile) {

        let mode : Bool = caller_mode;
        let profile : ?CheckoutProfile = caller_profile;

        public func get_icp_transactions(accountId: Text) : async Text {
             //1. DECLARE IC MANAGEMENT CANISTER
            //We need this so we can use it to make the HTTP request
            let ic : Types.IC = actor ("aaaaa-aa");
            

            let host : Text = "rosetta-api.internetcomputer.org";
            let url = "https://rosetta-api.internetcomputer.org/search/transactions";            

            Debug.print("HTTP REQUEST URL: " # debug_show(url));

            // 2.2 prepare headers for the system http_request call
            let request_headers = [
                { name = "Cache-Control"; value = "no-cache, no-store, must-revalidate" },
                { name = "Pragma"; value = "no-cache" },
                //{ name = "Accept"; value = "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7" },
                //{ name = "Accept-Encoding"; value = "gzip, deflate, br" },
                //{ name = "Accept-Language"; value = "en-US,en;q=0.9" },
                { name = "Host"; value = host # ":443" },
                { name = "User-Agent"; value = "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1" },
                { name = "Content-Type"; value = "application/json; charset=utf-8" },
            ];
         
            let request_body_json : Text = "{\"network_identifier\": {\"blockchain\": \"Internet Computer\", \"network\": \"00000000000000020101\"}, \r\n \"account_identifier\": {\"address\": \"" # accountId # "\"}\r\n}";
            let request_body_as_Blob: Blob = Text.encodeUtf8(request_body_json); 
            let request_body_as_nat8: [Nat8] = Blob.toArray(request_body_as_Blob); // e.g [34, 34,12, 0]

            // 2.3 The HTTP request
            let http_request : Types.HttpRequestArgs = {
                url = url;
                max_response_bytes = null; //optional for request
                headers = request_headers;
                body = ?request_body_as_nat8; //optional for request
                method = #post;
                transform = null; //optional for request
            };

            //3. ADD CYCLES TO PAY FOR HTTP REQUEST

            //The IC specification spec says, "Cycles to pay for the call must be explicitly transferred with the call"
            //IC management canister will make the HTTP request so it needs cycles
            //See: https://internetcomputer.org/docs/current/motoko/main/cycles
            
            //The way Cycles.add() works is that it adds those cycles to the next asynchronous call
            //"Function add(amount) indicates the additional amount of cycles to be transferred in the next remote call"
            //See: https://internetcomputer.org/docs/current/references/ic-interface-spec/#ic-http_request
            Cycles.add(220_131_200_000); //minimum cycles needed to pass the CI tests. Cycles needed will vary on many things size of http response, subnetc, etc...).
            
            //4. MAKE HTTPS REQUEST AND WAIT FOR RESPONSE
            //Since the cycles were added above, we can just call the IC management canister with HTTPS outcalls below
            let http_response : Types.HttpResponsePayload = await ic.http_request(http_request);
            Debug.print("HTTP http_response: " # debug_show(http_response));

            //5. DECODE THE RESPONSE
            //We need to decode that [Na8] array that is the body into readable text. 
            //To do this, we:
            //  1. Convert the [Nat8] into a Blob
            //  2. Use Blob.decodeUtf8() method to convert the Blob to a ?Text optional 
            //  3. We use a switch to explicitly call out both cases of decoding the Blob into ?Text
            let response_body: Blob = Blob.fromArray(http_response.body);
            Debug.print("HTTP response_body: " # debug_show(response_body));     
            let status: Nat = http_response.status;
            Debug.print("HTTP status: " # debug_show(status));

            let decoded_text: Text = switch (Text.decodeUtf8(response_body)) {
                case (null) { "No value returned" };
                case (?y) { y };
            };

            let blob = serdeJson.fromText(decoded_text);
            let t : ?TransactionList = from_candid(blob);
             Debug.print("JSON parsed TransactionList: " # debug_show(t));

            //6. RETURN RESPONSE OF THE BODY
            //The API response will looks like this:

            // {body = [114, 101, 113, 117, 101, 115, 116, 32, 99, 97, 117, 103, 104, 116]; headers = [{name = "date"; value = "Wed, 05 Jul 2023 00:44:03 GMT"}, {name = "content-length"; value = "14"}, {name = "content-type"; value = "text/plain; charset=utf-8"}]; status = 200}
           
            decoded_text

        };     

        public func get_ckbtc_transactions(accountId : Text) : async Text {
            return "";
        };

    };   


};
