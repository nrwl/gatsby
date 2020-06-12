# Gatsby Plugin for Nx

<p align="center"><img src="https://raw.githubusercontent.com/nrwl/gatsby/master/logo.png" width="450"></p>

<div align="center">

[![License](https://img.shields.io/npm/l/@nrwl/workspace.svg?style=flat-square)]()
[![NPM Version](https://badge.fury.io/js/%40nrwl%2Fgatsby.svg)](https://www.npmjs.com/@nrwl/gatsby)
[![Join the chat at https://gitter.im/nrwl-nx/community](https://badges.gitter.im/nrwl-nx/community.svg)](https://gitter.im/nrwl-nx/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Join us @nrwl/community on slack](https://img.shields.io/badge/slack-%40nrwl%2Fcommunity-brightgreen)](https://join.slack.com/t/nrwlcommunity/shared_invite/enQtNzU5MTE4OTQwOTk0LTgxY2E0ZWYzMWE0YzA5ZDA2MWM1NDVhNmI2ZWMyYmZhNWJiODk3MjkxZjY3MzU5ZjRmM2NmNWU1OTgyZmE4Mzc)

</div>

## Getting started

### Create a new Nx workspace:

```
npx create-nx-workspace --cli=nx --preset=empty
```

### Install Gatsby plugin

```
# Using npm
npm install --save-dev @nrwl/gatsby

# Using yarn
yarn add -D @nrwl/gatsby
```

### Create an app

```
npx nx g @nrwl/gatsby:app <app-name>
```

When using Nx, you can create multiple applications and themes in the same workspace. If you don't want to prefix your commands with npx, install `@nrwl/cli` globally.

### Serve the app

```
npx nx serve <app-name> --open
```

In prod mode:

```
npx nx serve <app-name> --prod --open
```

### Build/test/lint the app

```
npx nx build <app-name>
npx nx test <app-name>
npx nx lint <app-name>
```

## Using components from React library

You can use a component from React library generated using Nx package for React. Once you run:

```
npx nx g @nrwl/react:lib ui-button --style=css
```

This will generate the `UiButton` component, which you can use in your app.

```jsx
import { UiButton } from '@myorg/ui-button';
```

## Learn more

Visit the [Nx Documentation](https://nx.dev) to learn more.
