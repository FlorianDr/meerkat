#!/bin/sh

for f in $(find -L "$DENO_DIR/npm/registry.npmjs.org/@pcd" -name '*.js' -type f)
do
    # Replace JSON imports
    sed -i '' -E 's/(import .*\.json");/\1 with { type: "json" };/g' "$f"
done

main_js_file="$DENO_DIR/npm/registry.npmjs.org/ffjavascript/*/build/main.cjs"
threadman_file="$DENO_DIR/npm/registry.npmjs.org/ffjavascript/*/src/threadman.js"

# Comment out Worker-related definitions
sed -i '' 's/^\(var Worker.*\)/\/\/\ \1/' $main_js_file
sed -i '' 's/^import Worker.*//' $threadman_file

# Replace Worker calls
sed -i '' 's/\(.*new Worker\).*[(]\(.*\)[)].*/\1(\2, { type: "module" });/' $main_js_file
sed -i '' 's/\(.*new Worker\).*[(]\(.*\)[)].*/\1(\2, { type: "module" });/g' $threadman_file
