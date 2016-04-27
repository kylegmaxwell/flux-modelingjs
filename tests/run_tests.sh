#!/bin/bash

JASM_NODE="jasmine-node"
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
