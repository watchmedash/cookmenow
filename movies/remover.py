import os

# Directory containing your HTML files
directory = r'C:\Users\HP\Documents\GitHub\cookmenow\movies'  # Replace with your actual directory path

# Block to be removed
block_to_remove = """
<style>
}
.video-container {
   position: relative;
   padding-bottom: 56.25%; /* 16:9 aspect ratio */
   height: 0;
   overflow: hidden;
   width: 80%;
   max-width: 800px; /* Optional: Set a max-width for larger screens */
   margin: 0 auto;
}
.video-container iframe {
   position: absolute;
   top: 0;
   left: 0;
   width: 100%;
   height: 100%;
   border: 0; /* Optional: Removes border around iframe */
   object-fit: cover;
}
.overlay {
    position: absolute;
    top: 10px; /* Adjust this to cover the pop-out icon */
    right: 10px; /* Adjust this to cover the pop-out icon */
    width: 50px; /* Adjust this to cover the pop-out icon */
    height: 50px; /* Adjust this to cover the pop-out icon */
    background: transparent;
    z-index: 10;
}
    </style>
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
