import os

def replace_text_in_files(directory, old_text, new_text):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.html'):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r') as f:
                        content = f.read()

                    new_content = content.replace(old_text, new_text)

                    with open(filepath, 'w') as f:
                        f.write(new_content)
                        print(f"Replaced text in {filepath}")

                except Exception as e:
                    print(f"Error processing {filepath}: {e}")

# Call the function to replace text recursively
replace_text_in_files(
    '.',
    '<script src="https://alwingulla.com/88/tag.min.js" data-zone="88676" async data-cfasync="false"></script>',
    "<script type='text/javascript' src='//perilastronaut.com/27/b0/7b/27b07be5dbd507b6465940348cb90da5.js'></script>"
)
