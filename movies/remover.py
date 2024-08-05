import os
import re

# Directory containing your HTML files
directory = r'C:\Users\mojaz\Documents\GitHub\cookmenow\movies'  # Replace with your actual directory path

# Pattern to match and remove the block of HTML content
pattern_to_remove = re.compile(
    r'<div class="content"><div class="watchmenow-info"><h1>What to watch next\? 🎥</h1></div></div>'
    r'\s*<div class="related-movies-gallery"></div>'
    r'\s*<div id="disqus_thread"></div>'
    r'\s*<script>.*?'
    r'<\/script>'
    r'\s*<noscript>.*?<\/noscript>'
    r'\s*<footer>.*?<\/footer>',
    re.DOTALL
)

def remove_block_from_html(directory, pattern):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.html'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                new_content = re.sub(pattern, '', content)
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)

# Call the function to remove the block from HTML files
remove_block_from_html(directory, pattern_to_remove)
