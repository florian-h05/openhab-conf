#!/bin/bash
# Script: NINA_Warn.bash
# Purpose: Get the warning of your are from NINA, the German warning system.
# How it works: Downloads the warnings.json from NINA, then parses it and print it out.
# Copyright (c) 2021 Florian Hotze under MIT License


# Get your url by using the network monitor of web developer tools. 
# Search for a downloaded JSON after selecting your region an warnung.bund.de and copy the url.
url='https://warnung.bund.de/api31/dashboard/082160000000.json'

curl ${url} -s | jq . > response.json
# read each item in the JSON array to an item in the Bash array
readarray -t response < <(jq -c '.[]' response.json)
rm response.json

# create arrays for the individual type of alert/warning
declare -A weather          # provider is DWD
weather=()
declare -A flood            # provider is LHP
flood=()
declare -A civilProtection  # provider is MOWAS, headline does not contain "Corona"
civilProtection=()
declare -A corona           # provider is MOWAS, headline contains "Corona"
corona=()

categorizeWarnings() {
  # iterate through the Bash array
  for item in "${response[@]}"; do
    provider=$(jq '.payload.data.provider' <<< "$item" | sed 's/"//g')
    headline=$(jq '.payload.data.headline' <<< "$item" | sed 's/"//g')
    if [ "${provider}" = "DWD" ]; then
      weather[${#weather[@]}]=${headline}
    elif [ "${provider}" = "LHP" ]; then
      flood[${#flood[@]}]=${headline}
    elif [ "${provider}" = "MOWAS" ]; then
      if [[ ${headline} = *Corona* ]]; then
        corona[${#corona[@]}]=${headline}
      else
        civilProtection[${#civilProtection[@]}]=${headline}
      fi
    fi
  done
}

listWeather() {
  for i in "${weather[@]}"; do
    echo "${i}"
  done
  if [ ${#weather[@]} = 0 ]; then
    echo 'None.'
  fi
}

listFlood() {
  for i in "${flood[@]}"; do
    echo "${i}"
  done
  if [ ${#flood[@]} = 0 ]; then
    echo 'None.'
  fi
}

listCivilProtection() {
  for i in "${civilProtection[@]}"; do
    echo "${i}"
  done
  if [ ${#civilProtection[@]} = 0 ]; then
    echo 'None.'
  fi
}

listCorona() {
  for i in "${corona[@]}"; do
    echo "${i}"
  done
  if [ ${#corona[@]} = 0 ]; then
    echo 'None.'
  fi
}

listAll() {
  echo 'Weather warnings from DWD:'
  listWeather
  echo $'\nFlooding warnings from LHP:'
  listFlood
  echo $'\nCivil protection warnings from MOWAS:'
  listCivilProtection
  echo $'\nCorona information from MOWAS:'
  listCorona
}

categorizeWarnings

### Loop through arguments and process them
# -w    display weather alerts
# -f    display flooding warnings
# -p    display civil protection alerts
# -c    display Corona warnings
for arg in "$@"
do
    case $arg in
        -w)
        listWeather
        ;;
        -f)
        listFlood
        ;;
        -p)
        listCivilProtection
        ;;
        -c)
        listCorona
        ;;
        -a)
        listAll
        ;;
        *)
        echo 'Wrong argument. Valid are: none, -w, -f, -p and -c.'
        ;;
    esac
  done
  
