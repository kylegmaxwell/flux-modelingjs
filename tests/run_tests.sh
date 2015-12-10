#!/bin/bash

if ! NODEJS_LOC="$(type -p nodejs)" || [ -z "$NODEJS_LOC" ]; then
    sudo apt-get install nodejs
fi
if ! NPM_LOC="$(type -p npm)" || [ -z "$NPM_LOC" ]; then
    sudo apt-get install npm
fi

JASM_NODE="jasmine-node"
npm install $JASM_NODE@1.14.1
NPM_ROOT="$(npm root)"
JASM_EXEC_PATH=$NPM_ROOT/$JASM_NODE/bin
if [ ! -d "$JASM_EXEC_PATH" ]; then
    echo "Failed to locate ${JASM_NODE} at path ${JASM_EXEC_PATH}"
    exit 1
fi

JASM_EXEC=$JASM_EXEC_PATH/$JASM_NODE
if [ ! -f "$JASM_EXEC" ]; then
    echo "Failed to locate ${JASM_EXEC}"
    exit 1
fi

JASM_FLAGS="--verbose --captureExceptions"
${JASM_EXEC} ${JASM_FLAGS} ./
