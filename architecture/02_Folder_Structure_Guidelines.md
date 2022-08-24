# 02 - Folder Structure Guidelines

### Status

`Accepted`
- Last updated `Aug 22th, 2022` by `Damiano Melcarne`.

### Context

An organized folder / file structure allows engineers to more easily and repeatably contribute code. The intent of these guidelines is to communicate the purpose of elements within the project through established naming conventions and a separation of concerns. These guidelines will evolve as these projects mature over time.

### Decisions

_Note: All code is currently under the `hedera-accelerator-defi-dex-ui` repo. The application agnostic DEX UI components and hooks will be migrated to a standalone repo, `hedera-accelerator-defi-dex-ui-components`, in the near future._

#### 1 - repo: hedera-accelerator-defi-dex-ui
> An implementation of a DEX on the Hedera network utilizing UI components and hooks from the `hedera-accelerator-defi-dex-ui-components` repo.

#### app/ - Contains all logic for the UI layer of the DEX accelerator application.

    .
    ├── ...              
    ├── pages/            # Page specific components composed of a combination of shared base, DEX, and layout components. These pages have an associated URL route.
    ├── layouts/          # Layout components (navbar, footer, etc.) used across multiple pages.
    ├── styles/           # Themes and styles that apply to the entire DEX application.
    ├── app.ts            # Primary entry point for the DEX application. Contains TSX wrappers for Context Providers, Theming, Router, etc.
    ├── index.ts          # Contains all exportable (public) application components.
    └── ...
    
#### 2 - repo: hedera-accelerator-defi-dex-ui-components
> A library of components and hooks that contain the building blocks to accelerate the creation of a Hedera DEX application.

#### src/ - Contains all logic for the UI components and hooks.

    .
    ├── ...               
    ├── components/       # Contains the UI layer logic for the set of shared base and DEX specific React components.
    ├── context/          # Context components that allow the access of core state that can be used across components.
    ├── hooks/            # Pluggable functions that provide React components with reusable logic that connect with middleware, application state, and external APIs.
    ├── stories/          # Storybook stories for all UI components.
    ├── middleware/       # Contains middleware that executes additional functionality on dispatched actions. The @rest-hooks/useEnhancedReducer hook enables the use of reducer middleware.
    ├── styles/           # Base theme for all components in the library. Can be imported or extended by a DEX application. 
    ├── constants.ts      # Constants that apply to multiple components. Constants that apply to a specific component will be located within the associated folder.
    ├── types.ts          # Typescript types that apply to multiple components. Types that apply to a specific component will be located within the associated folder.
    ├── utils.ts          # Utility functions that are used across multiple components. Utility functions that apply to a specific component will be located within the associated folder.
    ├── index.ts          # Central location that contains all exported functions and components.
    └── ...
    
#### src/components/ - Contains React UI components.

    .
    ├── ...                       
    ├── base/                         # Simple stateless components with basic styles used as building blocks for more complex components.
    |   ├── BaseComponentName/        
    |   ├── __fixtures__/             # Mock data for this components RTL tests.
    |   ├── __tests__/                # RTL tests specific to this component.
    |   ├── styles                    # Styles specific to this component.
    |   ├── BaseComponentName.tsx     
    |   ├── index.ts                  # Contains all exported UI components.
    ├── DEXComponentName/             # Compound components composed of base components to create DEX specific UI paradigms. Only contains logic around UI behavior and state (no middleware).
    |   ├── __fixtures__/             # [same as above]
    |   ├── __tests__/                # [same as above]
    |   ├── styles/                   # [same as above]
    |   ├── DEXComponentName.tsx      # [same as above]
    |   ├── index.ts                  # [same as above]
    ├── index.ts
    └── ...
    
#### src/hooks/ - Contains React Hooks.

    .
    ├── ...                       
    ├── useHookName/                  
    |   ├── actions/                 
    |   |   ├── actionTypes.ts        # Types for all actions processed by the associated reducer.
    |   |   ├── hookNameActions.ts    # Functions that create action objects (action creators). Async action creators are used to interact with APIs and handle async requests.
    |   ├── reducers/                 
    |   |   ├── hookNameReducer.ts    # Logic for updating the store/state. This is reducer logic from the React Hooks, not Redux.
    |   ├── useHookName.tsx           # Main entry point for hook logic.
    |   ├── constants.ts              # [same as above]
    |   ├── utils.ts                  # [same as above]
    |   ├── index.ts                  # [same as above]
    ├── index.ts
    └── ...
