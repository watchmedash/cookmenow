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

                    # Find and print any matches
                    matches = old_div_pattern.findall(content)
                    if matches:
                        print(f"Found matches in {filepath}:")
                        for match in matches:
                            print(match)
                    else:
                        print(f"No matches found in {filepath}")

                    # Replace the old div pattern with new content
                    new_content = old_div_pattern.sub(new_div_content, content)

                    # If changes were made, write the new content
                    if new_content != content:
                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        print(f"Replaced text in {filepath}")

                except Exception as e:
                    print(f"Error processing {filepath}: {e}")

# More flexible regex pattern to handle variations in spacing and newlines
old_div_pattern = re.compile(r'''
    <div\s+class="image-contained">\s*   # Match div with class="image-contained"
    <a\s+href="https://go\.dashflix\.top/free50dollars">\s*  # Match the a tag with href
    <img[^>]*?>\s*</a>\s*</div>\s*       # Match the img tag inside the a tag and closing div
    \s*                                  # Allow for optional whitespace or newlines between blocks
    <div\s+class="image-contained">\s*   # Second div block
    <a\s+href="https://go\.dashflix\.top/free50dollars">\s*
    <img[^>]*?>\s*</a>\s*</div>\s*
    \s*                                  # Allow for optional whitespace or newlines between blocks
    <div\s+class="image-contained">\s*   # Third div block
    <a\s+href="https://go\.dashflix\.top/free50dollars">\s*
    <img[^>]*?>\s*</a>\s*</div>
''', re.DOTALL | re.VERBOSE)

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
