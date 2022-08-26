# 03 - React Hooks + Context API: Redux-like State Management

### Status
`Accepted`
- Last updated `Aug 22th, 2022` by `Damiano Melcarne`.

### Context
The DEX application and components require an application layer to interface with HBAR wallets, the Hedera network, and other external APIs. Interactions with these 
APIs will frequently impact the state of the application UI. A repeatable pattern that establishes the way we mangage these interactions and state changes will help the team build, scale, and test these components.

### Solutions
- [ ] `redux + redux-thunk`
- [X] `React Hooks` + `Context API` + `@rest-hooks/useEnhancedReducer`

### Decisions
- Since the `hedera-accelerator-defi-dex-ui-components` repo is intended to be used as building blocks for other applications, the decision was made to minimize the dependencies on 
additional libraries such as `redux`.
- `React Hooks` + `Context API` + `@rest-hooks/useEnhancedReducer` will be used to create an application data flow that mimics the approach used in 
`redux` + `redux-thunk`. This give us the benefits of a 3-layer separation of concerns (UI, Actions / AsyncActions, Reducers) without the need to use the full redux ecosystem.
- [A diagram that represents the data flow we are simulating](https://d33wubrfki0l68.cloudfront.net/08d01ed85246d3ece01963408572f3f6dfb49d41/4bc12/assets/images/reduxasyncdataflowdiagram-d97ff38a0f4da0f327163170ccc13e80.gif)

### Implications
- There is a possibility that the full `redux` ecosystem will better suite our scaling needs as the application and component repos grow. This would require us to migrate the
existing hook, action, reducer, and context logic to a `redux` friendly format. The current logic is intended to be organized and built in a way that would minimize the effort 
needed for a `redux` migration.
