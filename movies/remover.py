import os

# Directory containing your HTML files
directory = r'C:\Users\HP\Documents\GitHub\cookmenow\movies'  # Replace with your actual directory path

# Block to be removed
block_to_remove = """
<div class="discontent"><h3>Choose server:</h3></div>
<div class="tabs">
<div class="custom-tab" onclick="switchVideo('server1', 'video-player', 'https://filemoon.sx/e/aesepk62f61n')">Filemoon</div>
<div class="custom-tab" onclick="switchVideo('server2', 'video-player', 'https://streamtape.com/e/M6XPjvKrLRhB1a')">Streamtape</div>
<div class="custom-tab" onclick="switchVideo('server3', 'video-player', 'https://voe.sx/e/nf9tulrbq6ys')">Voe</div>-->
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
