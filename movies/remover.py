import os

# Directory containing your HTML files
directory = r'C:\Users\HP\Documents\GitHub\cookmenow\movies'  # Replace with your actual directory path

# Block to be removed
block_to_remove = """
<script src="//perilastronaut.com/27/b0/7b/27b07be5dbd507b6465940348cb90da5.js" type="text/javascript"></script>
"""

def remove_block_from_html(directory, block):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.html'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                new_content = content.replace(block, '')
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)

# Call the function to remove the block from HTML files
remove_block_from_html(directory, block_to_remove)
