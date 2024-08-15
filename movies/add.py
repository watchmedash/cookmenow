import os

# Define the script to be added
script_code = '<meta content="origin" name="referrer"/>'

# Get the current directory
current_dir = os.path.dirname(os.path.abspath(__file__))

# Loop through all files in the directory
for filename in os.listdir(current_dir):
    # Check if the file is an HTML file
    if filename.endswith(".html"):
        filepath = os.path.join(current_dir, filename)
        try:
            # Read the file content
            with open(filepath, 'r', encoding='utf-8') as file:
                content = file.read()

            # Find the position of the </head> tag
            position = content.rfind('</head>')

            # If the tag is found, insert the script code before it
            if position != -1:
                new_content = content[:position] + script_code + "\n" + content[position:]
                # Write the new content back to the file
                with open(filepath, 'w', encoding='utf-8') as file:
                    file.write(new_content)
        except Exception as e:
            print(f"An error occurred while processing {filename}: {e}")

print("Script code added to all HTML files.")
