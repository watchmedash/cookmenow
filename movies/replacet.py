import os
import fileinput

def replace_text_in_files(directory, old_text, new_text):
    for filename in os.listdir(directory):
        if filename.endswith(".html"):
            filepath = os.path.join(directory, filename)
            with fileinput.FileInput(filepath, inplace=True) as file:
                for line in file:
                    print(line.replace(old_text, new_text), end='')

# Replace "Mercenary Enrollment" with "Overgeared" in all HTML files in the current directory
replace_text_in_files('.', 'style.css', 'styles.css')
