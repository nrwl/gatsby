[![CircleCI](https://circleci.com/gh/nrwl/gatsby.svg?style=svg)](https://circleci.com/gh/nrwl/gatsby)

<hr>

# Nx Gatsby Plugin

Gatsby CLI supports the following commands for development:

- new
- develop
- build
- serve

See more [in the documentation](https://www.gatsbyjs.org/docs/gatsby-cli/). Here's how they are mapped to Nx commands.

## Getting started

First, create a new Nx workspace:

```
npx create-nx-workspace@latest myorg --preset=empty
```

**Note:** `myorg` is the scope of your workspace, which is used like npm scope for workspace projects. You can change it to something else.

Lastly, add the Nx CLI (so you can run `nx` command):

```
npm install -g @nrwl/cli 
```

### Generate an application

**Nx**

```
nx g @nrwl/gatsby:app <app-name>
```

When using Nx, you can create multiple applications and themes in the same workspace.

Command parameters aren't yet supported by the plugin.

### Development server

**Nx**

```
nx serve <app-name> --open
```

### Production server

**Nx**

```
nx serve <app-name> --prod --open
```

**Note:** This command will build the production app before serving.


### Build

**Nx**

```
nx build <app-name>
```

## Using components from React library

You can use a component from React library generated using Nx package for React. Once you run:

```
nx g @nrwl/react:lib ui-button --style=css
```

This will generate the `UiButton` component, which you can use in your app.

```jsx
import { UiButton } from '@myorg/ui-button';
```

## Further help

Visit the [Nx Documentation](https://nx.dev) to learn more.
