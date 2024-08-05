import os

# Directory containing your HTML files
directory = r'C:\Users\mojaz\Documents\GitHub\cookmenow\movies'  # Replace with your actual directory path

# Block to be removed
block_to_remove = """
<!--<div class="discontent"><h3>Choose server:</h3></div>
  <div class="tabs">
  <div class="custom-tab" onclick="switchVideo('server1', 'video-player', 'https://filemoon.sx/e/olphc307bfpy')">Filemoon</div>
  <div class="custom-tab" onclick="switchVideo('server2', 'video-player', 'https://vidsrc.me/embed/movie/tt6263850')">Streamy</div>
  <div class="custom-tab" onclick="switchVideo('server3', 'video-player', 'https://voe.sx/e/fq3plfkkqq7c')">Voe</div>
   -->
<div class="button-container"><a class="watch-now-bur" href="../contact.html">Report Error!</a></div>
<div class="content"><div class="watchmenow-info"><h1>What to watch next? 🎥</h1></div></div><div class="related-movies-gallery">
</div>
<div id="disqus_thread"></div>
<script>
    var disqus_config = function () {
        this.page.url = window.location.href;  // Use the current page URL
        this.page.identifier = document.title; // Use the page title as the unique identifier
    };

    (function() { // DON'T EDIT BELOW THIS LINE
        var d = document, s = d.createElement('script');
        s.src = 'https://nextflix.disqus.com/embed.js';
        s.setAttribute('data-timestamp', +new Date());
        (d.head || d.body).appendChild(s);
    })();
</script>
<noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript">comments powered by Disqus.</a></noscript>
<footer>
<nav class="footer-nav">
<ul class="footer-links">
<li><a href="../home.html">Home</a></li>
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
