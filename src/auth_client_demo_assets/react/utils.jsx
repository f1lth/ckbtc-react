// https://icrc-api.internetcomputer.org/api/v1/ledgers/mxzaz-hqaaa-aaaar-qaada-cai/accounts/fflv5-nf2ry-u3v76-lprfi-rmnpz-y7wbj-3u7w4-u7rjj-smyiu-a4ygx-xqe/transactions?limit=1

export async function fetchTransactions(account) {
    const response = await fetch(`https://icrc-api.internetcomputer.org/api/v1/ledgers/mxzaz-hqaaa-aaaar-qaada-cai/accounts/${account}/transactions?limit=1`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }
  