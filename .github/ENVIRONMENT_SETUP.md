# GitHub Pages Environment Setup

## Environment File Configuration

The workflow uses a single environment file approach where all environment variables are stored in one GitHub repository variable.

### Repository Settings Location
1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click on the **Variables** tab

### Environment File Setup

#### Create Repository Variable: `FRONT_V2_APP_ENV_FILE`

Add a new variable named `FRONT_V2_APP_ENV_FILE` with the complete `.env` file content:

```
VITE_APP_NAME=Hedera DeFi DEX
VITE_HEDERA_NETWORK=testnet
VITE_HEDERA_ACCOUNT_ID=0.0.123456
VITE_API_BASE_URL=https://api.example.com
VITE_PINATA_GATEWAY=https://gateway.pinata.cloud
VITE_HEDERA_PRIVATE_KEY=your_private_key_here
VITE_PINATA_JWT=your_pinata_jwt_token_here
VITE_FEATURE_FLAGS=auth,payments,analytics
VITE_DEBUG_MODE=false
```

**Important**: Include ALL environment variables in this single variable, including sensitive ones like private keys and JWT tokens.

### Environment-Specific Configuration

The workflow uses the `production` environment. To set environment-specific variables:

1. Go to **Settings** → **Environments**
2. Create or edit the `production` environment
3. Add environment-specific variables and secrets

### GitHub Pages Setup

1. Go to **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. The workflow will automatically deploy when you push to the `main` branch

### Workflow Triggers

The deployment workflow runs on:
- Push to `main` branch
- Manual trigger via **Actions** → **Deploy to GitHub Pages** → **Run workflow**

### Build Output

- Build artifacts are created in the `build/` directory
- Vite environment variables must be prefixed with `VITE_`
- Variables are injected at build time, not runtime

### Security Notes

- Never commit sensitive data like private keys to the repository
- Use GitHub Secrets for sensitive environment variables
- Use GitHub Variables for non-sensitive configuration
- The `production` environment can have additional protection rules
