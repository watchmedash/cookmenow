import os
from bs4 import BeautifulSoup

def extract_urls_from_html(directory):
    urls = []

    # Loop through all files in the given directory
    for filename in os.listdir(directory):
        if filename.endswith(".html"):
            filepath = os.path.join(directory, filename)

            # Open and read the file
            with open(filepath, 'r', encoding='utf-8') as file:
                soup = BeautifulSoup(file, 'html.parser')

                # Find the meta tag with property="og:url"
                meta_tag = soup.find('meta', property="og:url")
                if meta_tag and 'content' in meta_tag.attrs:
                    urls.append(meta_tag['content'])

    return urls

def save_urls_to_file(urls, output_file):
    with open(output_file, 'w', encoding='utf-8') as file:
        for url in urls:
            file.write(url + '\n')

def main():
    input_directory = '.'  # Current directory
    output_file = 'urls.html'  # Output file

    urls = extract_urls_from_html(input_directory)
    save_urls_to_file(urls, output_file)
    print(f"Extracted {len(urls)} URLs and saved to {output_file}")

if __name__ == "__main__":
    main()
