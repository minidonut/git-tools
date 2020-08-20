#!/bin/bash

sed -i '1i#!/usr/bin/env node' dist/commands/issue.js
chmod +x dist/commands/issue.js
