import Debug "mo:base/Debug";
import Blob "mo:base/Blob";
import Cycles "mo:base/ExperimentalCycles";
import Error "mo:base/Error";
import Array "mo:base/Array";
import Nat8 "mo:base/Nat8";
import Nat64 "mo:base/Nat64";
import Text "mo:base/Text";
import Buffer "mo:base/Buffer";
import Types "Types";

import serdeJson "mo:serde/JSON";

module {

    type CheckoutProfile = Types.CheckoutProfile;   
    type NotificationChannel = Types.NotificationChannel;

    // public type NotificationChannel = {
    //     service: Text; //twillio, email
    //     url: Text; //api.twillio.com
    //     api_key: Text; //user key
    //     enabled: Bool;
    // };

    type CourierMessage = {
        message: {
            content: { title: Text; body: Text; }; 
            to: { user_id: Text; email: Text; phone_number: Text; };
        };
    };

    public class Courier(p : CheckoutProfile) {
       
        let profile : CheckoutProfile = p;

        public func send_notification() : async Text {

            let channels = profile.notification_channels;
            let sms_channel = Array.filter<NotificationChannel>(channels, func(x) = x.service == "sms");
            Debug.print("sms_channel: " # debug_show(sms_channel));
            
            let email_channel = Array.filter<NotificationChannel>(channels, func(x) = x.service == "email");
            Debug.print("email_channelL: " # debug_show(email_channel));

            //return "";

            let ic : Types.IC = actor ("aaaaa-aa");
            let host : Text = "api.courier.com";
            let url = "https://api.courier.com/send";

            Debug.print("HTTP REQUEST URL: " # debug_show(url));
            
            let request_headers = [                
                { name = "Accept"; value = "Accept: application/json" },
                { name = "Authorization"; value = "Bearer pk_prod_K9YYS4D1TGMWFJJ1K000X334E5KE" },
                { name = "Content-Type"; value = "application/json" },                
                { name = "Host"; value = host # ":443" },
            ];

            let request_body_json = "{\"message\": {\"content\": {\"title\": \"Hey\", \"body\": \"here is your test from courier\"}, \"to\": {\"user_id\": \"dimi\", \"email\": \"social@janus.ai\", \"phone_number\": \"16474060959\" } }}";          
            let request_body_as_Blob: Blob = Text.encodeUtf8(request_body_json); 
            let request_body_as_nat8: [Nat8] = Blob.toArray(request_body_as_Blob); // e.g [34, 34,12, 0]
            
            Debug.print("courier json " # debug_show(request_body_json));

            return "";


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
                case (null) { "send_notification No value returned" };
                case (?y) { y };
            };

            // let blob = serdeJson.fromText(decoded_text);
            // let t : ?TransactionList = from_candid(blob);
            //  Debug.print("JSON parsed TransactionList: " # debug_show(t));

            //6. RETURN RESPONSE OF THE BODY
            //The API response will looks like this:

            // {body = [114, 101, 113, 117, 101, 115, 116, 32, 99, 97, 117, 103, 104, 116]; headers = [{name = "date"; value = "Wed, 05 Jul 2023 00:44:03 GMT"}, {name = "content-length"; value = "14"}, {name = "content-type"; value = "text/plain; charset=utf-8"}]; status = 200}
           
            decoded_text

        };

         public func send_notification_test() : async Text {
          
            let ic : Types.IC = actor ("aaaaa-aa");
            let host : Text = "api.courier.com";
            let url = "https://api.courier.com/send";

            Debug.print("HTTP REQUEST URL: " # debug_show(url));
            
            let request_headers = [                
                { name = "Accept"; value = "Accept: application/json" },
                { name = "Authorization"; value = "Bearer pk_prod_K9YYS4D1TGMWFJJ1K000X334E5KE" },
                { name = "Content-Type"; value = "application/json" },                
                { name = "Host"; value = host # ":443" },
            ];

            let request_body_json = "{\"message\": {\"content\": {\"title\": \"Hey\", \"body\": \"here is your test from courier\"}, \"to\": {\"user_id\": \"dimi\", \"email\": \"social@janus.ai\", \"phone_number\": \"16474060959\" } }}";          
            let request_body_as_Blob: Blob = Text.encodeUtf8(request_body_json); 
            let request_body_as_nat8: [Nat8] = Blob.toArray(request_body_as_Blob); // e.g [34, 34,12, 0]
            
            Debug.print("courier json " # debug_show(request_body_json));

            return "";


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
                case (null) { "send_notification No value returned" };
                case (?y) { y };
            };

            // let blob = serdeJson.fromText(decoded_text);
            // let t : ?TransactionList = from_candid(blob);
            //  Debug.print("JSON parsed TransactionList: " # debug_show(t));

            //6. RETURN RESPONSE OF THE BODY
            //The API response will looks like this:

            // {body = [114, 101, 113, 117, 101, 115, 116, 32, 99, 97, 117, 103, 104, 116]; headers = [{name = "date"; value = "Wed, 05 Jul 2023 00:44:03 GMT"}, {name = "content-length"; value = "14"}, {name = "content-type"; value = "text/plain; charset=utf-8"}]; status = 200}
           
            decoded_text

        };
       

    };

};
