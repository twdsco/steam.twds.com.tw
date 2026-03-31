#!/usr/bin/env bash

set -euo pipefail

SSH_TARGET="${SSH_TARGET:-user@103.147.22.10}"
BIRD_V4_PROTOCOL="${BIRD_V4_PROTOCOL:-twds_steam_v4}"
BIRD_V6_PROTOCOL="${BIRD_V6_PROTOCOL:-twds_steam_v6}"
OUTPUT_DIR="${1:-data}"
SSH_OPTIONS=(
  -o BatchMode=yes
  -o StrictHostKeyChecking=yes
)

mkdir -p "${OUTPUT_DIR}"

fetch_protocol() {
  local protocol="$1"
  local output_path="$2"
  local today
  local remote_output

  today="$(date +%F)"
  remote_output="$(
    ssh "${SSH_OPTIONS[@]}" "${SSH_TARGET}" \
      "sudo -n birdc 'show route protocol ${protocol} all'"
  )"

  if [[ -z "${remote_output}" ]]; then
    echo "No output returned for protocol ${protocol}" >&2
    return 1
  fi

  {
    printf '#%s\n' "${today}"
    printf '%s\n' "${remote_output}"
  } > "${output_path}"
}

fetch_protocol "${BIRD_V4_PROTOCOL}" "${OUTPUT_DIR}/steam-cache-v4.txt"
fetch_protocol "${BIRD_V6_PROTOCOL}" "${OUTPUT_DIR}/steam-cache-v6.txt"
