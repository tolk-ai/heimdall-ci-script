#!/usr/bin/env bash

MODULE_="$1"

err_() {
    echo -e "\033[41m\033[90mError on module $1\033[0m"
    exit 1
}

trap 'err_ ${MODULE_}' ERR


generate_() {

  trap 'err_ $1' ERR

  echo -e "\033[35mGenerate sls for $1\033[0m"
  cd $1
  yarn run generate-sls
  cd ..
}

generate_all_() {
  pathList=$(ls -d */ | grep -v "node_modules" | sed "s/\///g")
  lambdas=(${pathList///\n/ })

  for i in "${lambdas[@]}"
  do
      generate_ ${i}
  done
  yarn run generate-sls
}

if [[ -z ${MODULE_} ]]
then
  generate_all_
else
  generate_ ${MODULE_}
fi
