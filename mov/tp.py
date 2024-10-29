import os
import json
import re

# Get the current working directory
folder_path = os.getcwd()

# Initialize an empty list to store the results
results = []
file_counter = 1
max_entries_per_file = 20000  # Adjust the number of entries per file as needed

# Print files in directory for debugging
print("Files in directory:", os.listdir(folder_path))

# Iterate over each file in the folder
for filename in os.listdir(folder_path):
    if filename.endswith('.html'):
        print(f"Processing file: {filename}")  # Debugging line
        title_with_number = filename[:-5].strip()  # Remove '.html'

        # Check for invalid titles that start with a dot or are single non-alphabet characters
        if title_with_number.startswith('.') or len(title_with_number) < 2:
            print(f"Skipping file due to unrecognizable title: {filename}")
            continue  # Skip this file

        # Remove trailing numbers or non-essential dots
        title = re.sub(r'\s*\.\d+$', '', title_with_number).strip()
        print(f"Extracted title: '{title}'")  # Debugging line
        link = f"https://emirati.top/mov/{title_with_number}"

        # Only add to results if title is not empty
        if title:
            results.append({
                "title": title,
                "link": link
            })

        # Check if we need to write to a new JSON file
        if len(results) >= max_entries_per_file:
            output_file_path = os.path.join(folder_path, f'output_{file_counter}.json')
            with open(output_file_path, 'w') as json_file:
                json.dump(results, json_file, indent=4)
            print(f"JSON file created at {output_file_path}")
            results = []  # Reset for the next file
            file_counter += 1

# Write any remaining entries to a final JSON file
if results:
    output_file_path = os.path.join(folder_path, f'output_{file_counter}.json')
    with open(output_file_path, 'w') as json_file:
        json.dump(results, json_file, indent=4)
    print(f"JSON file created at {output_file_path}")
