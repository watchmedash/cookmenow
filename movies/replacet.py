import os
import fileinput

def replace_text_in_files(directory, old_text, new_text):
    for filename in os.listdir(directory):
        if filename.endswith(".html"):
            filepath = os.path.join(directory, filename)
            # Specify utf-8 encoding to avoid encoding errors and avoid backup files
            with fileinput.FileInput(filepath, inplace=True, encoding='utf-8') as file:
                for line in file:
                    # Replace old_text with new_text and print each modified line
                    print(line.replace(old_text, new_text), end='')

# Replace "dashflix.xyz" with "dashflix.top" in all HTML files in the current directory
replace_text_in_files('.', 'https://emirati.top/movies', 'https://dash-tv.com/movies')
