import os

# Directory containing your HTML files
directory = r'C:\Users\mojaz\Documents\GitHub\cookmenow\movies'  # Replace with your actual directory path

# Line to be removed
line_to_remove = '<script src="https://alwingulla.com/88/tag.min.js" data-zone="88676" async data-cfasync="false"></script>\n'

def remove_font_links(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.html'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r') as f:
                    lines = f.readlines()
                with open(filepath, 'w') as f:
                    for line in lines:
                        if line != line_to_remove:
                            f.write(line)

# Call the function to remove font links recursively
remove_font_links(directory)
