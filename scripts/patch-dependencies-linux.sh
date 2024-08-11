#!/bin/sh

for f in $(find -L "$DENO_DIR/npm/registry.npmjs.org/@pcd" -name '*.js' -type f)
do
    # Replace exports
    sed -i '/^export.*\.js/b; s/\(^export\ .*"\)\([^@].*\/.*\)\(".*$\)/\1\2.js\3/' $f
    # Replace imports
    sed -i '/^import.*\.js/b; s/\(^import\ .*"\)\([^@].*\/.*\)\(".*$\)/\1\2.js\3/' $f
    # Replace JSON imports
    sed -i -E 's/(import .*\.json");/\1 with { type: "json" };/g' $f
done

# File to be processed
file="$DENO_DIR/npm/registry.npmjs.org/@pcd/pod/0.1.3/dist/esm/src/podCrypto.js"

# Use sed to replace the import statements
sed -i -E 's/import \{ poseidon1 \} from "poseidon-lite\/poseidon1";/import { poseidon1, poseidon2 } from "poseidon-lite";/g' "$file"
sed -i -E '/import \{ poseidon2 \} from "poseidon-lite\/poseidon2";/d' "$file"

main_js_file="$DENO_DIR/npm/registry.npmjs.org/ffjavascript/*/build/main.cjs"
threadman_file="$DENO_DIR/npm/registry.npmjs.org/ffjavascript/*/src/threadman.js"

# Comment out Worker-related definitions
sed -i 's/^\(var Worker.*\)/\/\/\ \1/' $main_js_file
sed -i 's/^import Worker.*//' $threadman_file

# Replace Worker calls
sed -i 's/\(.*new Worker\).*[(]\(.*\)[)].*/\1(\2, { type: "module" });/' $main_js_file
sed -i 's/\(.*new Worker\).*[(]\(.*\)[)].*/\1(\2, { type: "module" });/g' $threadman_file