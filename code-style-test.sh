#!/usr/bin/env bash

MODULE_="$1"

err_() {
    echo -e "\033[41m\033[90mError on module $1\033[0m"
    exit 1
}

trap 'err_ ${MODULE_}' ERR


test_() {

  trap 'err_ $1' ERR

  echo -e "\033[35mTesting $1\033[0m"
  cd $1
  yarn run code-style
  yarn run test
  cd ..
}

test_all_() {
  pathList=$(ls -d */ | grep -v "node_modules" | sed "s/\///g")
  lambdas=(${pathList///\n/ })

  for i in "${lambdas[@]}"
  do
      test_ ${i}
  done
}

if [[ -z ${MODULE_} ]]
then
  test_all_
else
  # for Travis execution
  if [[ ${MODULE_} = "." ]]
  then
    exit 0
  else
    test_ ${MODULE_}
  fi
fi
