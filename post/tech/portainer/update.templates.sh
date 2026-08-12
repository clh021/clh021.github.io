#!/usr/bin/env bash
# leehom Chen clh021@gmail.com
# 本脚本旨在提供一个用于快速编写 shell 脚本模板
set -e

# 路径准备
OldPath=$(pwd)
# SCRIPT_PATH=$(realpath "${BASH_SOURCE[0]}")
SCRIPT_PATH=$(realpath "$0")
ProjectPath="$(dirname "$(dirname "$SCRIPT_PATH")")"

# pushd $ProjectPath > /dev/null
# if [ -f "$ProjectPath/.env" ]; then
#   source "$ProjectPath/.env"
# fi

wget -c https://raw.githubusercontent.com/portainer/templates/master/templates-2.0.json -O portainer.templates.json
wget -c https://raw.githubusercontent.com/Qballjos/portainer_templates/master/Template/template.json -O homelab.qballjos.templates.json
wget -c https://github.com/technorabilia/portainer-templates/raw/main/lsio/templates/templates-2.0.json -O technorabilia.templates.json
wget -c https://github.com/gtrummell/gnas-portainer-templates/raw/master/templates.json -O gnas.templates.json
wget -c https://raw.githubusercontent.com/ykxVK8yL5L/dockertemplates/main/templates-2.0.json -O ykxVK8yL5L.templates.json
wget -c https://raw.githubusercontent.com/lihaixin/dockerfile/master/templates-2.0.json -O lihaixin.templates.json

popd > /dev/null

cd "$OldPath"

