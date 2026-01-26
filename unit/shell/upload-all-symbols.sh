#!/bin/bash
cd "$(dirname $( dirname "${BASH_SOURCE[0]}" ))"
PROJ_DIR=`pwd`

set -xe

"${PROJ_DIR}/tools/upload-symbol.sh" "${PROJ_DIR}/build/dist/lithium/lithium.sym"
"${PROJ_DIR}/tools/upload-symbol.sh" "${PROJ_DIR}/build/dist/lithium/libcef.so.sym"
