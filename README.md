<div align="center">
<h1>
  Hedera DEX UI Accelerator 
</h1>
<p align="center" style="font-size: 1.2rem;">A DEX (Decentralized Exchange) UI accelerator that operates on the Hedera network. The DEX UI utilizes React primitives from the <a href="https://github.com/hashgraph/hedera-accelerator-defi-dex-ui-components">hedera-accelerator-defi-dex-ui-components</a> UI component library.</p>

[**Read The Docs**]()
</div>
<hr />

## Table of Contents

- [Installation](#installation)
- [Setup Local Environment](#setup-local-environment)
- [Usage](#usage)

## Installation

Install dependencies with yarn.

```
yarn install
```

## Setup Local Environment 

### Setup HTTPS for Local Wallet Pairing

The Hedera DEX Accelerator utilizes the [hashconnect](https://github.com/Hashpack/hashconnect) library to pair with supported wallet extensions. Currently, the only supported wallet extension is [HashPack](https://www.hashpack.app/). The HashConnect 1-click pairing feature only works in an SSL secured environment (**https** URLs). To enable `HTTPS` in your local build:

1. Create an `.env` file in the root of this project.
2. In the `.env` file set the `HTTPS` environment variable to `true`. 

```
/* .env */
HTTPS=true
```

3. Create an SSL certificate. There are several tools that can be used to generate a certificate and key. An easy way to do this is to use the [mkcert](https://github.com/FiloSottile/mkcert) tool.

```
# The [Homebrew](https://brew.sh/) macOS package manager is used for this example

# Install mkcert tool
brew install mkcert

# Install nss (only needed if you use Firefox)
brew install nss

# Setup mkcert on your machine (creates a CA)
mkcert -install

# Create a directory to store the certificate and key
mkdir -p .cert

# Generate the certificate (ran from the root of this project)
mkcert -key-file ./.cert/key.pem -cert-file ./.cert/cert.pem "localhost"
```

4. Set the `SSL_CRT_FILE` and `SSL_CRT_FILE` environment variables to the path of the certificate and key files.

```
/* .env */
HTTPS=true

/* Path to certificate */
SSL_CRT_FILE=./.cert/cert.pem

/* Path to key */
SSL_KEY_FILE=./.cert/key.pem
```

5. Make sure to include `.env` and `.cert` in your `.gitignore` file so this information is not committed to version control.

6. Run the application with `yarn start`. You should see `https://` prefixed to the localhost URL.

[Additional Info](https://create-react-app.dev/docs/using-https-in-development/)

## Usage

### Run The Application

```
yarn start
```

### Run Tests

```
yarn test
```
