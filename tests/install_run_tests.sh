#!/bin/bash

if ! NODEJS_LOC="$(type -p nodejs)" || [ -z "$NODEJS_LOC" ]; then
    sudo apt-get install nodejs
fi
if ! NPM_LOC="$(type -p npm)" || [ -z "$NPM_LOC" ]; then
    sudo apt-get install npm
fi

JASM_NODE="jasmine-node"
npm install $JASM_NODE@1.14.1

./run_tests.sh