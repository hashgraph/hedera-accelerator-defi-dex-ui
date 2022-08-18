# 01 - Tech Stack

### Status
`Accepted`
- Last updated `Aug 18th, 2022` by `Damiano Melcarne`.

### Context
A set of tools needed to be selected and agreed upon in order to build out the frontend of the Hedera DEX Application and DEX UI Component Library. Each tool was selected based on its ability to support 1) the long-term development of the accelerator repos, 2) the use cases of the DEX application, and 3) the usage of the DEX UI components / hooks library.

### Decisions

| Utility | Selected Tool | Installed? | Details |
| :------------- | :------------- | :-------------: | :------------- |
| UI Library | [`react (with Hooks)`](https://reactjs.org/) | &check;| A simple and flexible UI library. Used to build UI components. |
| State Management | [`Context API`](https://reactjs.org/docs/context.html), [`@rest-hooks/use-enhanced-reducer`](https://github.com/coinbase/rest-hooks/tree/master/packages/use-enhanced-reducer#readme) | &check; | These tools allow us to create an application data flow that mimicks the approach used in [`redux` + `redux-thunk`](https://redux.js.org/tutorials/fundamentals/part-6-async-logic). The goal is to enforce an opinonated 3-layer seperation of concerns (UI, Actions / AsyncActions, Reducers) without using the full redux ecosystem. The React Context API and the custom `useEnhancedReducer` hook allow us to manage state, actions, and middleware in a similar way that `redux` handles these layers. We may circle back and consider using `redux` if it better fits our scaling needs down the line. |
| Static Typing | [`typescript`](https://www.typescriptlang.org/) | &check; | Intended to help produce code that is more reliable, maintainable, and readable. |
| Inline Documentation / HTML Documentation Generator | [`typedoc`](https://typedoc.org/) | &check;| Allows for JSDoc-like comments directly in the source code. `TypeDoc` can use these inline comments to automatically generate an HTML based documentation template. |
| Component Library | [`chakra-ui`](https://chakra-ui.com/) | &check; | Provides basic building blocks to help build the application UI. The library is good middle ground between heavy weight, opinionated libraries like `MUI` and very lightweight libraries like `tailwind`. |
| Hedera API | [`hash-sdk`](https://github.com/hashgraph/hedera-sdk-js) | &check; | Allows our application to interface with the `Hedera` network and ecosystem. |
| Wallet API | [`hashconnect`](https://github.com/Hashpack/hashconnect) | &check; | Allows our application to communicate with `Hedera` wallets - specifically the `HashPack` wallet. |
| Styling | [`emotion`](https://emotion.sh/docs/introduction), [`chakra-ui`](https://chakra-ui.com/) | &check; | The `chakra-ui` styling and theming features will be used to style components. Chakra UI uses `emotion` (styled components) under the hood. |
| UI Component Explorer | [`storybook`](https://storybook.js.org/) | &check; | Creates a development environment playground that anyone can use to test UI components in isolation. Doubles as an additional source of interactive documentation for UI components. |
| Linting | [`eslint`](https://typescript-eslint.io/) | &check; | Helps enforce coding standards to minimize errors and establish consistent code style. |
| Formatting | [`prettier`](https://prettier.io/) | &check; | Helps keep code style consistent across the team. Can automatically format code to adhere to the configured standards. |
| Monorepo | [`lerna`](https://lerna.js.org/), [`yarn workspaces`](https://classic.yarnpkg.com/lang/en/docs/workspaces/) | &#x2610; | Yarn Workspaces is used to optimize and link different packages together. Lerna is used to optimize the management of monorepos. In future iterations, we can setup a monorepo that includes the DEX UI, Component Library, and Smart Contracts. This enables developers to build and manage packages across all portions of the stack in a single repo. |
| Package Management | [`yarn`](https://classic.yarnpkg.com/en/) | &check; | A JavaScript package manager. `yarn` was choosen over `npm` for package installation speed. |
| Unit Testing | [`jest`](https://jestjs.io/) | &check; | Provides a reliable and simple way to write unit tests. |
| Component Tests | [`test-library`](https://testing-library.com/) | &check; | A preferred alternative to `enzyme` for component testing. Tests are ran in a headless browser. Allows developer to test React components without relying on implementation details - reducing the need to refactor tests when component implementations change. |
| E2E Tests | [`cypress`](https://www.cypress.io/) | &#x2610; | E2E tests will be used at a later point, only when necessary. `cypress` allows developers to test in a real browser environment. |
| Git Hooks | [`husky`](https://typicode.github.io/husky/#/) | &check; | Enforces code standards (formatting, linting, tests, etc.) before pushing to a remote repo. This allows for an earlier detection of code standard violations. |
| Version Control | [`git`](https://git-scm.com/) | &check; | Industry standard for version control. |
| Source Code Management | [`Github`](https://github.com/) | &check; | The go-to for open source projects. |
| Hosting | [`Netlify`](https://www.netlify.com/) | &check; | Secure scalable way to host websites. |
| CI / CD | [`Github Actions`](https://github.com/features/actions) | &check; | An easy way to manage the CI / CD workflows directly in Github. |
