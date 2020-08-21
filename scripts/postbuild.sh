#!/bin/bash

sed -i '1i#!/usr/bin/env node' dist/cmd/issue.js
chmod +x dist/cmd/issue.js
