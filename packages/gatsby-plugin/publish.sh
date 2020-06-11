#!/usr/bin/env bash
echo "Publishing gatsby-plugin@$1"

nx build gatsby-plugin
cd dist/projects/gatsby-plugin

if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i "" "s|REPLACE|$1|g" package.json
else
    sed -i "s|REPLACE|$1|g" package.json
fi

npm adduser
npm publish --access public --tag latest

