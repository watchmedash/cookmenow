import os

# Define the script to be added
script_code = '<div class="button-container"><a class="watch-now-bur" href="https://dashflix.top/contact">Report Error</a></div>'

# Get the current directory
current_dir = os.path.dirname(os.path.abspath(__file__))

# Loop through all files in the directory
for filename in os.listdir(current_dir):
    # Process only HTML files
    if filename.endswith(".html"):
        filepath = os.path.join(current_dir, filename)
        try:
            # Read the file content
            with open(filepath, 'r', encoding='utf-8') as file:
                content = file.read()

            # Find the position of the <div class="content"> tag
            position = content.rfind('<div class="button-container"><a class="watch-now-bur" href="https://dashflix.top/home">Home</a></div>')

            # If the tag is found, insert the script code before it
            if position != -1:
                new_content = content[:position] + script_code + "\n" + content[position:]
                # Write the modified content back to the file
                with open(filepath, 'w', encoding='utf-8') as file:
                    file.write(new_content)
        except Exception as e:
            print(f"Error processing {filename}: {e}")

print("Script code added to all applicable HTML files.")
