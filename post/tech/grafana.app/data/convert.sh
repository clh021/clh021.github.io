#!/usr/bin/env bash
# leehom Chen clh021@gmail.com
prefix=$(date +%Y%m%d_%H%M%S)
echo "generating data.tpl.$prefix.docx"
docker run --rm -v ./:/data pandoc/latex:3.2.0.0-alpine --reference-doc template.docx -s data.md -o "data.tpl.$prefix.docx"