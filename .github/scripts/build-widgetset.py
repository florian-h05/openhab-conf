#!/usr/bin/env python3
import sys
from pathlib import Path
import yaml

def build_widgetset():
    # Resolve directories relative to repository root (.github/scripts/ -> repo root)
    repo_root = Path(__file__).resolve().parent.parent.parent
    widgets_dir = repo_root / "UI" / "widgets" / "florianh-widgetset"
    output_dir = repo_root / "dist"
    output_file = output_dir / "florianh-widgetset.yaml"

    if not widgets_dir.exists():
        print(f"Error: Widgets directory not found at {widgets_dir}", file=sys.stderr)
        sys.exit(1)

    widgets = {}
    yaml_files = sorted(widgets_dir.glob("*.yaml")) + sorted(widgets_dir.glob("*.yml"))

    for filepath in yaml_files:
        with open(filepath, "r", encoding="utf-8") as stream:
            doc = yaml.safe_load(stream)
            if not isinstance(doc, dict):
                print(f"Warning: Skipping {filepath.name} - non-dictionary structure")
                continue

            uid = doc.pop("uid", None)
            if not uid:
                print(f"Warning: Skipping {filepath.name} - missing 'uid' field")
                continue

            widgets[uid] = doc

    result = {
        "version": 1,
        "widgets": widgets
    }

    output_dir.mkdir(parents=True, exist_ok=True)
    with open(output_file, "w", encoding="utf-8") as out:
        yaml.dump(result, out, sort_keys=False, allow_unicode=True)

    print(f"Successfully aggregated {len(widgets)} widgets into {output_file}")

if __name__ == "__main__":
    build_widgetset()
