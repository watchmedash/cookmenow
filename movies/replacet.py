import os
import fileinput

def replace_text_in_files(directory, old_text, new_text):
    for filename in os.listdir(directory):
        if filename.endswith(".html"):
            filepath = os.path.join(directory, filename)
            # Using backup parameter to ensure safety during file replacement
            with fileinput.FileInput(filepath, inplace=True, backup='.bak') as file:
                for line in file:
                    # Replace the old_text with new_text and print each modified line
                    print(line.replace(old_text, new_text), end='')

# Replace "dashflix.xyz" with "dashflix.top" in all HTML files in the current directory
replace_text_in_files('.', 'dashflix.xyz', 'dashflix.top')
