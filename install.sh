#!/bin/bash

# Current script dir
cd "$(dirname "$0")"

# Install required tools (node.js, npm, yeoman, bower and grunt)
sudo apt-get update
sudo apt-get install nodejs nodejs-legacy npm -y
sudo npm install -g npm@latest
sudo npm install -g bower grunt-cli yo generator-angular

# Fix premission issues that npm sometimes causes installing things globally
sudo npm cache clear
sudo chown -R `whoami` ~/tmp

# Install packages from packages.json
npm install

# Install all JavaScript (browser) modules required by the appication
# alow-root: Don't fail just in case someone is really running this as root
# config.analytics: Don't prompt for usage stats
bower install --config.analytics=false --allow-root
