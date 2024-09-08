import os
import re

def replace_div_in_files(directory, old_div_pattern, new_div_content):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.html'):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()

                    # Replace only the specific old div pattern when there are exactly 3 consecutive divs
                    new_content = re.sub(old_div_pattern, new_div_content, content, flags=re.DOTALL)

                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                        print(f"Replaced text in {filepath}")

                except Exception as e:
                    print(f"Error processing {filepath}: {e}")

# Define the specific pattern to match three consecutive divs with the same structure
old_div_pattern = re.compile(r'''
    (<div\s+class="image-contained">\s*
    <a\s+href="https://go\.dashflix\.top/free50dollars">.*?</a>\s*
    </div>\s*){3}
''', re.DOTALL)

# Define the new div content to replace the old divs
new_div_content = '''
<div class="terra">
    <script type="text/javascript">
        atOptions = {
            'key' : '1e3bb364d2648c38d52a0b681932f0e1',
            'format' : 'iframe',
            'height' : 90,
            'width' : 728,
            'params' : {}
        };
    </script>
    <script type="text/javascript" src="//perilastronaut.com/1e3bb364d2648c38d52a0b681932f0e1/invoke.js"></script>
</div>
<div class="terra">
    <script async="async" data-cfasync="false" src="//perilastronaut.com/011adeeaa3099f7cac95f3cae6e94d52/invoke.js"></script>
    <div id="container-011adeeaa3099f7cac95f3cae6e94d52"></div>
</div>
'''

# Call the function to replace the div content recursively in all files
replace_div_in_files('.', old_div_pattern, new_div_content)
