import re

path = "/home/sanish/.cargo/registry/src/index.crates.io-1949cf8c6b5b557f/anchor-syn-0.30.1/src/idl/defined.rs"

with open(path, "r") as f:
    content = f.read()

fixed = content.replace(
    "proc_macro2::Span::call_site().source_file().path()",
    "std::path::PathBuf::from(proc_macro2::Span::call_site().file())"
)

with open(path, "w") as f:
    f.write(fixed)

if content != fixed:
    print("Patched successfully")
else:
    print("No change made - pattern not found")
