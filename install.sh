#!/bin/bash

cd "$(dirname "$0")"

sudo apt-get update
sudo apt-get install nodejs nodejs-legacy npm -y
sudo npm install -g npm@latest
sudo npm install -g yo bower grunt-cli

# npm sometimes causes permission issues after installing things globally
sudo npm cache clear
sudo chown -R `whoami` ~/tmp

npm install

# don't fail just in case someone is really running this as root
# analytics: don't prompt for usage stats
bower install --config.analytics=false --allow-root
