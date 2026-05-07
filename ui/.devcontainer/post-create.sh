#!/bin/bash

export NVM_VERSION=v0.40.0
export NODE_VERSION=22
export YARN_VERSION=4.5.3

# Install Node
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/${NVM_VERSION}/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"


# Install Node
nvm install ${NODE_VERSION}

# Install Yarn
corepack enable && yes | yarn set version ${YARN_VERSION}