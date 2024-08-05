import os
import fileinput

# Get the current directory where the script is located
folder_path = os.path.dirname(os.path.abspath(__file__))

# Get a list of all HTML files in the folder
html_files = [f for f in os.listdir(folder_path) if f.endswith('.html')]

# Iterate through each HTML file and replace "../" with an empty string
for file_name in html_files:
    file_path = os.path.join(folder_path, file_name)

    with fileinput.FileInput(file_path, inplace=True) as file:
        for line in file:
            # Replace "../" with an empty string
            updated_line = line.replace("../", "")
            print(updated_line, end='')

print("All '../' occurrences removed from HTML files.")
