import os
import json
import re

# Get the current working directory
folder_path = os.getcwd()

# Initialize an empty list to store the results
results = []
file_counter = 1
max_entries_per_file = 20000  # Adjust the number of entries per file as needed

# Iterate over each file in the folder
for filename in os.listdir(folder_path):
    if filename.endswith('.html'):
        title_with_number = filename[:-5].strip()
        title = re.sub(r'\s*\d+$', '', title_with_number).strip()
        link = f"https://emirati.top/tv/{title_with_number}"

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
