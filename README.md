## Getting Started

Stack

FrontEnd - Nextjs app router [https://nextjs.org/docs](https://nextjs.org/docs)
Backend - amplify docs [https://docs.amplify.aws/gen2/start/quickstart/](https://docs.amplify.aws/gen2/start/quickstart/)
Amplify UI - [https://ui.docs.amplify.aws/react/getting-started/installation](https://ui.docs.amplify.aws/react/getting-started/installation)

git clone the repo

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## deploy Backend

Backend Setup - [https://docs.amplify.aws/gen2/start/account-setup/](https://docs.amplify.aws/gen2/start/account-setup/)

`npx amplify sandbox --profile sso-amplify-admin --debug --identifier vivekdev`

## Add Secrets

npx amplify sandbox secret set SECRET --profile sso-amplify-admin
? Enter secret value: ###
Done!

> npx amplify sandbox secret set bar
> ? Enter secret value: ###
> Done!
