import os

# Directory containing your HTML files
directory = r'C:\Users\HP\Documents\GitHub\cookmenow\movies'  # Replace with your actual directory path

# Block to be removed
block_to_remove = """
<header>
<nav>
<div class="logo-title-container">
<div class="logo-container">
<img alt="Nextflix Logo" src="https://i.postimg.cc/Kv4RxRFw/logo1.png"/>
</div>
<div class="nav-title">
<h1>
       Nextflix
      </h1>
<p>
       Stream Free, Stream Now
      </p>
</div>
<div class="menu-icon">
<div class="bar">
</div>
<div class="bar">
</div>
<div class="bar">
</div>
</div>
</div>
<div class="nav-links">
<ul>
<li>
<a href="../homer.html">
<i class="fas fa-home">
</i>
        Home
       </a>
</li>
<li>
<a href="../contact.html">
<i class="fas fa-envelope">
</i>
        Contact Us
       </a>
</li>
<li>
<a href="../about.html">
<i class="fas fa-info-circle">
</i>
        About Us
       </a>
</li>
</ul>
</div>
</nav>
</header>
"""

def remove_block_from_html(directory, block):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.html'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                new_content = content.replace(block, '')
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)

# Call the function to remove the block from HTML files
remove_block_from_html(directory, block_to_remove)
