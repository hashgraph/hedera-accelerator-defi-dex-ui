<div align="center">
  <h1>
    Hedera DeFi UI Accelerator
  </h1>
</div>
  
<ul>
  <li><b><a href="https://dao.web3nomad.org/">DAO-as-a-Service (Testnet)</a></b></li>
  <li><b><a href="https://hashiodao.swirldslabs.com/">DAO-as-a-Service (Mainnet)</a></b></li>
</ul>

<hr />


## Status: **POC**
The DEX component is not active. 

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

The Hedera DeFi Accelerator apps utilize the [hashconnect](https://github.com/Hashpack/hashconnect) library to pair with supported wallet extensions. Currently, the only supported wallet extension is [HashPack](https://www.hashpack.app/). The HashConnect 1-click pairing feature only works in an SSL secured environment (**https** URLs). To enable `HTTPS` in your local build:

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

6. Run the application with `vercel dev` (see [Usage](#usage) for Vercel installation). You should see `https://` prefixed to the localhost URL.

### Setup Pinata Environment variables to use the Pinata IPFS API

The DeFi apps store and retrieve  IPFS data using Pinata. A Pinata public key, secret key, and gateway URL are necessary for IPFS pinning and fetching features to work as intended. You will need to create a Pinata account to create a new set of keys and a gateway URL. A more comprehensive tutorial can be found in the [Pinata API Docs](https://docs.pinata.cloud/docs/welcome-to-pinata).

```
PRIVATE_PINATA_API_KEY=/** Public Key **/
PRIVATE_PINATA_API_SECRET_KEY=/** Secret Key **/
VITE_PUBLIC_PINATA_GATEWAY_URL=/** Gateway URL **/
```

## Usage

The DeFi apps utilize [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions) to communicate with third-party APIs such as IPFS. You will need to install the [Vercel CLI](https://vercel.com/docs/cli) to run the applications.

### Run The Application

```
vercel dev
```
