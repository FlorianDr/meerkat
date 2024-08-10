#!/bin/sh

for f in $(find -L "$DENO_DIR/npm/registry.npmjs.org/@pcd" -name '*.js' -type f)
do
    # Replace exports
    sed -i '' -e '/^export.*\.js/b' -e 's/\(^export\ .*"\)\([^@].*\/.*\)\(".*$\)/\1\2.js\3/' "$f"
    # Replace imports
    sed -i '' -e '/^import.*\.js/b' -e 's/\(^import\ .*"\)\([^@].*\/.*\)\(".*$\)/\1\2.js\3/' "$f"
done

# File to be processed
file="$DENO_DIR/npm/registry.npmjs.org/@pcd/pod/0.1.3/dist/esm/src/podCrypto.js"

# Use sed to replace the import statements
sed -i '' -E 's/import \{ poseidon1 \} from "poseidon-lite\/poseidon1";/import { poseidon1, poseidon2 } from "poseidon-lite";/g' "$file"
sed -i '' -E '/import \{ poseidon2 \} from "poseidon-lite\/poseidon2";/d' "$file"
