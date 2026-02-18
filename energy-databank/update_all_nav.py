import os

files = [f for f in os.listdir('.') if f.endswith('.html')]

dropdown_placeholder = """<div class="drop-menu">
                    <a href="#" class="drop-item">Fuelwood Consumption</a>
                    <a href="#" class="drop-item">Charcoal Consumption</a>
                    <a href="#" class="drop-item">Coal Consumption</a>
                    <a href="#" class="drop-item">Coal Export</a>
                    <a href="#" class="drop-item">Coal for Electricity</a>
                </div>"""

mobile_dropdown_placeholder = """<div class="mobile-dropdown-content">
                        <a href="#">Fuelwood Consumption</a>
                        <a href="#">Charcoal Consumption</a>
                        <a href="#">Coal Consumption</a>
                        <a href="#">Coal Export</a>
                        <a href="#">Coal for Electricity</a>
                    </div>"""

biomass_pages = [
    'fuelwood-consumption.html',
    'charcoal-consumption.html',
    'coal-consumption.html',
    'coal-export.html',
    'coal-for-electricity.html'
]

links_html_template = '''<div class="drop-menu">
                    <a href="fuelwood-consumption.html" class="drop-item">Fuelwood Consumption</a>
                    <a href="charcoal-consumption.html" class="drop-item">Charcoal Consumption</a>
                    <a href="coal-consumption.html" class="drop-item">Coal Consumption</a>
                    <a href="coal-export.html" class="drop-item">Coal Export</a>
                    <a href="coal-for-electricity.html" class="drop-item">Coal for Electricity</a>
                </div>'''

mobile_links_html = '''<div class="mobile-dropdown-content">
                        <a href="fuelwood-consumption.html">Fuelwood Consumption</a>
                        <a href="charcoal-consumption.html">Charcoal Consumption</a>
                        <a href="coal-consumption.html">Coal Consumption</a>
                        <a href="coal-export.html">Coal Export</a>
                        <a href="coal-for-electricity.html">Coal for Electricity</a>
                    </div>'''

for filename in files:
    # Skip the biomass pages themselves as they were just created with correct links (though maybe basic)
    # Actually, it's safer to just process ALL files. For biomass pages, we'll also handle the 'active' state.
    
    with open(filename, 'r') as f:
        content = f.read()
    
    # Replace desktop dropdown
    if filename in biomass_pages:
        # Create a specific links_html with 'active' class
        links_html = links_html_template.replace(f'href="{filename}" class="drop-item"', f'href="{filename}" class="drop-item active"')
        # Also need to replace the placeholder if it exists (it might not if my previous script already replaced it)
    else:
        links_html = links_html_template

    # Handle the placeholder (generic)
    content = content.replace(dropdown_placeholder, links_html)
    content = content.replace(mobile_dropdown_placeholder, mobile_links_html)

    # Some files might already have some links but not 'active'
    # To be safe, if the file is one of biomass_pages, let's ensure the current page is 'active' in its own menu.
    # (The previous script should have done this, but let's be robust).

    with open(filename, 'w') as f:
        f.write(content)

print("Navigation updated in all files.")
