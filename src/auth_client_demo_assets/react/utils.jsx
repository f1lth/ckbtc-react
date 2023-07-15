// https://icrc-api.internetcomputer.org/api/v1/ledgers/mxzaz-hqaaa-aaaar-qaada-cai/accounts/fflv5-nf2ry-u3v76-lprfi-rmnpz-y7wbj-3u7w4-u7rjj-smyiu-a4ygx-xqe/transactions?limit=1

export async function fetchTransactionsCKBTC(principalId, limit) {
    const response = await fetch(`https://icrc-api.internetcomputer.org/api/v1/ledgers/mxzaz-hqaaa-aaaar-qaada-cai/accounts/${principalId}/transactions?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
}
  

export async function fetchTransactionsICP(accountId, limit) {

  return "";
  
  let url = "https://rosetta-api.internetcomputer.org/search/transactions";

  //let data = "{\"network_identifier\": {\"blockchain\": \"Internet Computer\", \"network\": \"00000000000000020101\"}, \r\n \"account_identifier\": {\"address\": \"" + accountId + "\"}\r\n}";  
  
  let data = {"network_identifier": { "blockchain" : "Internet Computer", "network": "00000000000000020101"}, "account_identifier": { "address": accountId  } };

  const response = await fetch(url, {
    method: "POST", 
    //mode: "cors", // no-cors, *cors, same-origin
    //cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    //credentials: "same-origin", // include, *same-origin, omit
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      //"Pragma": "no-cache",
      //"Host": "rosetta-api.internetcomputer.org:443",
      //"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1",
      "Content-Type": "application/json; charset=utf-8"
    },
    //redirect: "follow", // manual, *follow, error
    //referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json(); // parses JSON response into native JavaScript objects 
}
