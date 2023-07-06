import Debug "mo:base/Debug";
import Blob "mo:base/Blob";
import Cycles "mo:base/ExperimentalCycles";
import Error "mo:base/Error";
import Array "mo:base/Array";
import Nat8 "mo:base/Nat8";
import Nat64 "mo:base/Nat64";
import Text "mo:base/Text";
import Types "Types";
import Ledger "Ledger";

module {

    type CheckoutProfile = Types.CheckoutProfile;

    public class Watcher(caller_mode : Bool, caller_profiles : [CheckoutProfile]) {


        let mode : Bool = caller_mode;
        let profiles : [CheckoutProfile] = caller_profiles;

        public func get_icp_transactions_for_account2(accountId : Text) : async Text{
            
            let a = await Ledger.test();
            Debug.print("get_icp_transactions_for_account2 : " # debug_show(a));
            return "";
        };

        // https://icscan.io/ic/ledger/transactions/account?accountId={accountid}&page=0&pageSize=15&up=1
        public func get_icp_transactions_for_account(accountId : Text) : async Text {

            if(accountId.size() < 1){
                Debug.print("get_icp_transactions_for_account not good");
            };            

            // var m = Ledger.Ledger();
            // var ok = await m.test();
            // Debug.print("LedgerICPTester " # debug_show(ok));

            //1. DECLARE IC MANAGEMENT CANISTER
            //We need this so we can use it to make the HTTP request
            let ic : Types.IC = actor ("aaaaa-aa");

            //2. SETUP ARGUMENTS FOR HTTP GET request

            // 2.1 Setup the URL and its query parameters
            // let ONE_MINUTE : Nat64 = 60;
            // let start_timestamp : Types.Timestamp = 1682978460; //May 1, 2023 22:01:00 GMT

            //let host : Text = "icscan.io";

            let host : Text = "localhost";
            
            //let url = "https://" # host # "/products/ICP-USD/candles?start=" # Nat64.toText(start_timestamp) # "&end=" # Nat64.toText(start_timestamp) # "&granularity=" # Nat64.toText(ONE_MINUTE);

            //let url = "https://icscan.io/ic/ledger/transactions/account?accountId=" # accountId # "&page=0&pageSize=15&up=1";            
            
            let url = "https://httpbin.org/get";
            

            Debug.print("HTTP REQUEST URL: " # debug_show(url));

            // 2.2 prepare headers for the system http_request call
            let request_headers = [
                { name = "Accept"; value = "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7" },
                { name = "Accept-Encoding"; value = "gzip, deflate, br" },
                { name = "Accept-Language"; value = "en-US,en;q=0.9" },
                { name = "Host"; value = host # ":443" },
                { name = "User-Agent"; value = "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1" },
                //{ name = "Content-Type"; value = "application/json; charset=utf-8" },
            ];

            // 2.3 The HTTP request
            let http_request : Types.HttpRequestArgs = {
                url = url;
                max_response_bytes = null; //optional for request
                headers = request_headers;
                body = null; //optional for request
                method = #get;
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

            //As per the type declarations in `src/Types.mo`, the BODY in the HTTP response 
            //comes back as [Nat8s] (e.g. [2, 5, 12, 11, 23]). Type signature:
            
            //public type HttpResponsePayload = {
            //     status : Nat;
            //     headers : [HttpHeader];
            //     body : [Nat8];
            // };

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

            //6. RETURN RESPONSE OF THE BODY
            //The API response will looks like this:

            // {body = [114, 101, 113, 117, 101, 115, 116, 32, 99, 97, 117, 103, 104, 116]; headers = [{name = "date"; value = "Wed, 05 Jul 2023 00:44:03 GMT"}, {name = "content-length"; value = "14"}, {name = "content-type"; value = "text/plain; charset=utf-8"}]; status = 200}
           
            decoded_text

        };

        //This method sends a GET request to a URL with a free API we can test.
        //This method returns Coinbase data on the exchange rate between BTC and ICP 
        //for a certain day. The data will look like this:
        //The API response looks like this:
        //  [
        //     [
        //         1682978460, <-- start timestamp
        //         5.714, <-- lowest price during time range 
        //         5.718, <-- highest price during range
        //         5.714, <-- price at open
        //         5.714, <-- price at close
        //         243.5678 <-- volume of ICP traded
        //     ],
        // ]
        
        public func get_icp_usd_exchange() : async Text {

        //1. DECLARE IC MANAGEMENT CANISTER
        //We need this so we can use it to make the HTTP request
        let ic : Types.IC = actor ("aaaaa-aa");

        //2. SETUP ARGUMENTS FOR HTTP GET request

        // 2.1 Setup the URL and its query parameters
        let ONE_MINUTE : Nat64 = 60;
        let start_timestamp : Types.Timestamp = 1682978460; //May 1, 2023 22:01:00 GMT
        let host : Text = "api.pro.coinbase.com";
        let url = "https://" # host # "/products/ICP-USD/candles?start=" # Nat64.toText(start_timestamp) # "&end=" # Nat64.toText(start_timestamp) # "&granularity=" # Nat64.toText(ONE_MINUTE);

        // 2.2 prepare headers for the system http_request call
        let request_headers = [
            { name = "Host"; value = host # ":443" },
            { name = "User-Agent"; value = "exchange_rate_canister" },
        ];

        // 2.3 The HTTP request
        let http_request : Types.HttpRequestArgs = {
            url = url;
            max_response_bytes = null; //optional for request
            headers = request_headers;
            body = null; //optional for request
            method = #get;
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
        
        //5. DECODE THE RESPONSE

        //As per the type declarations in `src/Types.mo`, the BODY in the HTTP response 
        //comes back as [Nat8s] (e.g. [2, 5, 12, 11, 23]). Type signature:
        
        //public type HttpResponsePayload = {
        //     status : Nat;
        //     headers : [HttpHeader];
        //     body : [Nat8];
        // };

        //We need to decode that [Na8] array that is the body into readable text. 
        //To do this, we:
        //  1. Convert the [Nat8] into a Blob
        //  2. Use Blob.decodeUtf8() method to convert the Blob to a ?Text optional 
        //  3. We use a switch to explicitly call out both cases of decoding the Blob into ?Text
        let response_body: Blob = Blob.fromArray(http_response.body);
        let decoded_text: Text = switch (Text.decodeUtf8(response_body)) {
            case (null) { "No value returned" };
            case (?y) { y };
        };

        //6. RETURN RESPONSE OF THE BODY
        //The API response will looks like this:

        // ("[[1682978460,5.714,5.718,5.714,5.714,243.5678]]")

        //Which can be formatted as this
        //  [
        //     [
        //         1682978460, <-- start/timestamp
        //         5.714, <-- low
        //         5.718, <-- high
        //         5.714, <-- open
        //         5.714, <-- close
        //         243.5678 <-- volume
        //     ],
        // ]
        decoded_text
    };

    };


};