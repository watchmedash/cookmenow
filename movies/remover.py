import os

# Directory containing your HTML files
directory = r'C:\Users\HP\Documents\GitHub\cookmenow\movies'  # Replace with your actual directory path

# Block to be removed
block_to_remove = """
<div class="sharethis-inline-share-buttons">
</div><div class="button-container"><a class="watch-now-bur" href="../contact.html">Report Error!</a></div>
<div class="content"><div class="watchmenow-info"><h1>What to watch next? 🎥</h1></div></div><div class="related-movies-gallery">
</div>
<footer>
<nav class="footer-nav">
<ul class="footer-links">
<li><a href="../homer.html">Home</a></li>
<li><a href="../contact.html">Contact Us</a></li>
<li><a href="../privacy policy.html">Privacy Policy</a></li>
<li><a href="../dmca.html">DMCA</a></li>
</ul>
<div class="social-icons">
<a class="social-icon" href="https://perilastronaut.com/gr9n5n0t?key=eff82652240d3dc20b6ea9879deadd74"><i class="fab fa-instagram"></i></a>
<a class="social-icon" href="https://perilastronaut.com/gr9n5n0t?key=eff82652240d3dc20b6ea9879deadd74"><i class="fab fa-youtube"></i></a>
<a class="social-icon" href="https://perilastronaut.com/gr9n5n0t?key=eff82652240d3dc20b6ea9879deadd74"><i class="fab fa-facebook"></i></a>
<a class="social-icon" href="https://perilastronaut.com/gr9n5n0t?key=eff82652240d3dc20b6ea9879deadd74"><i class="fab fa-twitter"></i></a>
</div>
</nav>
<p class="copyright">Nextflix 2024. All rights reserved.</p>
</footer>
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
