import os

# Directory containing your HTML files
directory = r'C:\Users\HP\Documents\GitHub\cookmenow\movies'  # Replace with your actual directory path

# Script tag to be removed
script_to_remove = "<script type='text/javascript' src='//perilastronaut.com/27/b0/7b/27b07be5dbd507b6465940348cb90da5.js'></script>"

def remove_script_from_body(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.html'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                # Remove the script tag
                new_content = content.replace(script_to_remove, "")
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)

# Call the function to remove the script tag from all HTML files
remove_script_from_body(directory)
