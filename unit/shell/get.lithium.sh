#!/usr/bin/env bash
cd "$( dirname "${BASH_SOURCE[0]}" )"
currentPath=`pwd`
LITHIUM_BIN=

if test -f "$currentPath/lithium/lithium"; then
    LITHIUM_BIN="$currentPath/lithium/lithium"
elif test -f "$currentPath/../lithium/lithium"; then
    LITHIUM_BIN="$currentPath/../lithium/lithium"
elif test -f "$currentPath/../../lithium/lithium"; then
    LITHIUM_BIN="$currentPath/../../lithium/lithium"
elif test -f "$currentPath/../../../cmake-build-release/src/lithium-frontend"; then
    LITHIUM_BIN="$currentPath/../../../cmake-build-release/src/lithium-frontend"

fi
realpath $LITHIUM_BIN