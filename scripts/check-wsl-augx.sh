#!/usr/bin/env bash

set -u

fail() {
  printf 'WSL Augx check failed: %s\n' "$1" >&2
  printf '\n' >&2
  printf 'Install a Linux build of Node.js and npm inside WSL, then open a new WSL terminal.\n' >&2
  printf 'Verify that `node -p "process.platform"` prints `linux`.\n' >&2
  printf 'Then run `npm install -g @mytechtoday/augment-extensions` from WSL.\n' >&2
  printf 'The Linux Node and npm paths, npm prefix, and augx command must not point into /mnt/c.\n' >&2
  exit 1
}

node_bin=$(command -v node || true)
if [[ -z "$node_bin" ]]; then
  node_exe=$(command -v node.exe || true)
  if [[ -n "$node_exe" ]]; then
    fail "Linux node is missing; only the Windows executable was found at $node_exe."
  fi
  fail "No node executable is available in this WSL shell."
fi

node_platform=$("$node_bin" -p 'process.platform' 2>/dev/null || true)
if [[ "$node_platform" != "linux" ]]; then
  fail "node resolves to $node_bin and reports platform '$node_platform', not linux."
fi

npm_bin=$(command -v npm || true)
if [[ -z "$npm_bin" ]]; then
  fail "Linux Node is available at $node_bin, but npm is missing from PATH."
fi
case "$npm_bin" in
  /mnt/*|[A-Za-z]:\\*)
    fail "npm resolves to a Windows installation at $npm_bin."
    ;;
esac

npm_prefix=$("$npm_bin" config get prefix 2>/dev/null || true)
if [[ -z "$npm_prefix" ]]; then
  fail "Could not read the global prefix from npm at $npm_bin."
fi
case "$npm_prefix" in
  /mnt/*|[A-Za-z]:\\*)
    fail "npm's global prefix is on Windows: $npm_prefix."
    ;;
esac

augx_bin=$(command -v augx || true)
if [[ -z "$augx_bin" ]]; then
  fail "Augx is not installed in this Linux shell."
fi
case "$augx_bin" in
  /mnt/*|[A-Za-z]:\\*)
    fail "augx resolves to a Windows npm shim at $augx_bin."
    ;;
esac

printf 'WSL Augx paths look Linux-native.\n'
printf '  node:   %s (%s)\n' "$node_bin" "$node_platform"
printf '  npm:    %s\n' "$npm_bin"
printf '  prefix: %s\n' "$npm_prefix"
printf '  augx:   %s\n' "$augx_bin"
