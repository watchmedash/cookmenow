import os

# Define the script to be added
script_code = '<script src="https://alwingulla.com/88/tag.min.js" data-zone="88676" async data-cfasync="false"></script>'

# Get the current directory
current_dir = os.path.dirname(os.path.abspath(__file__))

# Loop through all files in the directory
for filename in os.listdir(current_dir):
    # Check if the file is an HTML file
    if filename.endswith(".html"):
        filepath = os.path.join(current_dir, filename)
        # Read the file content
        with open(filepath, 'r', encoding='utf-8') as file:
            content = file.read()

        # Find the position of the <body oncontextmenu="return false;"> tag
        position = content.rfind('<body oncontextmenu="return false;">')

        # If the tag is found, insert the script code after it
        if position != -1:
            new_content = content[:position + len('<body oncontextmenu="return false;">')] + script_code + "\n" + content[position + len('<body oncontextmenu="return false;">'):]
            # Write the new content back to the file
            with open(filepath, 'w', encoding='utf-8') as file:
                file.write(new_content)

print("Script code added to all HTML files.")
