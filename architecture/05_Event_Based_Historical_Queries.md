# 05 - Event Based Architecture for Querying Historical Records

### Background Context

We're seeing intermittent issues with data displaying in the DEX UI. After inspecting the network requests in the Chrome DevTools, I can see several hashio JSON RPC calls failing with a "HBAR rate limit exceeded" error. This is due to our app exceeding the [global rate limit](https://swirldslabs.com/hashio/) for the JSON RPC service. Due to an increase in the complexity and volume of some of our queries, we're quickly exceeding this rate limit.

### Proposed Solution

After some research and experimentation we've concluded that using Solidity [Events](https://docs.soliditylang.org/en/v0.8.0/abi-spec.html#events) is the preferred approach to expose data to the UI. An indexing service such as [The Graph](https://thegraph.com/en/) is usually needed to scale queries with large datasets. However, after a deeper investigation it looks like the [Hedera Mirror Nodes](https://docs.hedera.com/hedera/core-concepts/mirror-nodes) fulfill a similar indexing service role. The Mirror Nodes read network records, store them in the cloud, then write them to an "off-chain" database for efficient querying. The Graph provides more advanced query features (GraphQL) that would reduce some of data filtering logic on the UI. However, the MirrorNode REST API should sufficient for the time being.

Since querying for Event logs using the MirrorNode is free, using Events + MirrorNode as an alternative to the hashio service should fix the rate limit issues we're seeing.

### [TODO] Diagrams 

The attached diagram outlines the architecture of an Ethereum based application on the left. On the righthand side, I've recreated the architecture diagram using the Hedera equivalent services. The original diagram is from this article: [The Architecture of a Web 3.0 application](https://www.preethikasireddy.com/post/the-architecture-of-a-web-3-0-application).

### Implications

We will need to reassess our approach to Event logging in our contracts:
* Events will need to be emitted anytime state that we want to expose outside the contract is changed
* Indexed Events should be used for more efficient search capabilities.

### Alternative Approaches

###### 1 - Contract Function Getters

*Description:* Contract functions that return necessary data (pair data, proposals, etc.) in a single JSON RPC call.
A comment from <https://github.com/ethers-io/ethers.js/issues/62#issuecomment-343002204>
> For now, you can just have a standard getter on your contract that takes in an index and returns that result. For very complex applications, I expect apps will likely have centralized databases to facilitate indexing and then the authoritative result can be verified against the blockchain.

*Issues:*

* This an expensive way to query for data.
* This does not scale when returning a large list of data (ex. All Proposals) since the maximum gas fee per transaction will hit an upper limit.

###### 2 - JsonRpcBatchProvider

*Description:* Ether.js has a [JsonRpcBatchProvider](https://docs.ethers.org/v5/api/providers/other/#JsonRpcBatchProvider) object that implicitly [batches JSON RPC calls](https://www.jsonrpc.org/specification#batch). This could lower request costs and/or speed up response times.

*Issues:*

* The Hedera JSON RPC Relay does not allow for batch requests and there is [no plan to add it to the roadmap (as of Sept 18, 2022)](https://github.com/hashgraph/hedera-json-rpc-relay/issues/476).
* Batch responses may be returned out of order. This would increase the complexity of the queries in the UI.
* The JSON RPC request is batched; however, if the calls to the contracts are still singular then the hbar costs would remain high.

###### 3 - Improved React Query Caching (Client side caching)

*Description:* Allows us to control and store server data in the UI. We can rely on "stale" data (limit data fetching to a max of every 10 seconds, even on a refresh of the page).

*Issues:*

* This is useful for general performance and UI experience enhancements but does not reduce the number of calls needed to fetch all of the data from the contracts.

###### 4 - Client Side Data Pagination

*Description:* Only execute additional network calls for data that will be immediately rendered in the UI (ex. get all proposal events but only fetch state, vote count, etc. for the first 10 proposals).

*Issues:*

* Can easily hit the JSON RPC hbar rate limit by quickly paginating through pages in a list.
* Client side filtering and sorting will not work without fetching the additional information for all entries. Sever side filtering and sorting is not currently available.
* Adds significant complexity to the UI queries and data management. Would require refactoring several core pieces in the UI.

###### 5 - Server Side Pagination

The MirrorNode API and JSON RPC service may support pagination but it would still result in the same number of contract calls.

###### 6 - Changing JsonRpcSigner Address

*Description:* Change the JsonRpcSigner account address when the rate limit is hit.

*Issues:*

* We're unsure of how hashio tracks usage to apply the hbar rate limits. A wallet account address is not required to setup a JsonRpcProvider / JsonRpcSigner ethers object so it seems unlikely that the limit is applied to a wallet address.
* This still wouldn't provide a long term solution.