with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

depth = 0
in_landing = False
for i, line in enumerate(lines):
    if '<div id="screen-landing"' in line:
        in_landing = True
        landing_start_depth = depth
        print(f"screen-landing starts at line {i+1}, depth {depth}")
    
    # count div tags roughly
    depth += line.count('<div') - line.count('</div')
    
    if in_landing and depth == landing_start_depth:
        print(f"screen-landing ends at line {i+1}")
        in_landing = False
