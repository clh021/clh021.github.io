#!/usr/bin/env bash
# leehom Chen clh021@gmail.com
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "${DIR}/.."

defaultPort=8000
PORT=${1:-$defaultPort}
# python -m SimpleHTTPServer
# python -m http.server 80 --directory ./dist
python3 -m http.server "$PORT" -b "0.0.0.0"
