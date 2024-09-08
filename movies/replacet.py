import os
import re

def replace_two_divs_in_files(directory, old_div_pattern, new_div_content):
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

# Regular expression pattern to match exactly two <div class="image-contained"> blocks
old_div_pattern = re.compile(r'''
    <div\s+class="image-contained">\s*   # Match the first div
    <a\s+href="https://go\.dashflix\.top/free50dollars">\s*
    <img[^>]*?>\s*</a>\s*</div>\s*       # Match the img inside the a tag
    \s*                                  # Allow optional whitespace or newlines between blocks
    <div\s+class="image-contained">\s*   # Match the second div
    <a\s+href="https://go\.dashflix\.top/free50dollars">\s*
    <img[^>]*?>\s*</a>\s*</div>
''', re.DOTALL | re.VERBOSE)

# New content to replace the matched divs
new_div_content = '''
<div class="terra">
    <script type="text/javascript">
        atOptions = {
            'key' : '2a96efd2197a238b07deb35984b19d75',
            'format' : 'iframe',
            'height' : 60,
            'width' : 468,
            'params' : {}
        };
    </script>
    <script type="text/javascript" src="//perilastronaut.com/2a96efd2197a238b07deb35984b19d75/invoke.js"></script>
</div>
<div class="terra">
    <script type="text/javascript">
        atOptions = {
            'key' : 'bf040c76d43b39046092658d84c88123',
            'format' : 'iframe',
            'height' : 50,
            'width' : 320,
            'params' : {}
        };
    </script>
    <script type="text/javascript" src="//perilastronaut.com/bf040c76d43b39046092658d84c88123/invoke.js"></script>
</div>
'''

# Call the function to replace the divs recursively in all files
replace_two_divs_in_files('.', old_div_pattern, new_div_content)
