import os, glob

frontend_dir = r'd:\COMPLETE_PROJECTS\DataVista\frontend'
for filepath in glob.glob(os.path.join(frontend_dir, '*.html')):
    if 'index.html' in filepath: continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Add responsive.css link
    if 'responsive.css' not in content:
        content = content.replace('<link rel="stylesheet" href="footer-styles.css">', '<link rel="stylesheet" href="footer-styles.css">\n    <link rel="stylesheet" href="responsive.css">')
        
    # Add hamburger menu
    if '<div class="hamburger">' not in content:
        hamburger_html = '''            </ul>
            <div class="hamburger">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>'''
        content = content.replace('            </ul>\n        </div>', hamburger_html)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print('Updated all subpages successfully')
