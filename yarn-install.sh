#!/usr/bin/env bash

pathList=$(ls -d */ | grep -v "node_modules" | sed "s/\///g")
lambdas=(${pathList///\n/ })

install() {
  yarn

  for i in "${lambdas[@]}"
  do
    cd ${i}
    echo -e "\033[35mInstalling $i\033[0m"
    yarn
    cd ..
  done
}

uninstall() {
  rm -rf node_modules

  for i in "${lambdas[@]}"
  do
    cd ${i}
    echo -e "\033[35mCleaning $i\033[0m"
    rm -rf node_modules
    cd ..
  done
}

if [[ "$1" == "install" ]]; then
  install
elif [[ "$1" == "uninstall" ]]; then
  uninstall
else
  echo "Option not recognized"
fi
