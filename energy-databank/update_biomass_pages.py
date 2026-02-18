import os

pages = [
    ('fuelwood-consumption.html', 'Fuelwood Consumption'),
    ('charcoal-consumption.html', 'Charcoal Consumption'),
    ('coal-consumption.html', 'Coal Consumption'),
    ('coal-export.html', 'Coal Export'),
    ('coal-for-electricity.html', 'Coal for Electricity')
]

template_file = 'crude-oil.html'

if not os.path.exists(template_file):
    print(f"Error: {template_file} not found.")
    exit(1)

with open(template_file, 'r') as f:
    template_content = f.read()

# Specific Filter Options for each page
filters_map = {
    'fuelwood-consumption.html': [
        "Fuel Wood Consumption in Manufacturing",
        "Fuel Wood Consumption in Household"
    ],
    'charcoal-consumption.html': [
        "Charcoal Consumption in Households",
        "Charcoal Consumption in Commercial (Restaurants)",
        "Charcoal Export",
        "Total Charcoal Consumption"
    ],
    'coal-consumption.html': [
        "Coal Consumption in Steel Industry",
        "Coal Consumption in Cement Plants",
        "Coal Consumption in Rail Transport",
        "Total Coal Consumption"
    ],
    'coal-export.html': [
        "Coal Export for Industrial Use",
        "Coal Export for Power Generation",
        "Coal Export - Regional",
        "Total Coal Export"
    ],
    'coal-for-electricity.html': [
        "Coal Supplied to Oji River Power Station",
        "Coal Supplied to Itobe Power Plant",
        "Total Coal for Electricity"
    ]
}

for filename, title in pages:
    content = template_content
    
    # Update Page Title and Meta Title
    content = content.replace('<title>Crude Oil Statistics - NEDB</title>', f'<title>{title} Statistics - NEDB</title>')
    content = content.replace('<h1>Crude Oil Statistics</h1>', f'<h1>{title} Statistics</h1>')
    
    # Update Breadcrumbs
    content = content.replace('<span>Petroleum Statistics</span>', '<span>Biomass & Coal Statistics</span>')
    content = content.replace('<span class="current">Crude Oil Statistics</span>', f'<span class="current">{title} Statistics</span>')
    
    # Update Description
    content = content.replace('Comprehensive data on crude oil production, export, and refining in Nigeria.', 
                              f'Comprehensive data on {title.lower()} in Nigeria.')
    
    # Update Filters
    current_filters = filters_map.get(filename, [])
    filter_options_html = '<option value="all">All Descriptions</option>\n'
    for f_opt in current_filters:
        filter_options_html += f'                            <option>{f_opt}</option>\n'
    
    # Match the weird spacing in template if needed, but let's try a simpler replace
    target_filter_block = '<option value="all">All Descriptions</option>\n                            <option>Crude Oil Production Total</option>\n                            <option>Crude Oil Export</option>\n                            <option>Crude Oil Received by Refineries</option>\n                            <option>Crude Oil Processed by Refineries</option>'
    
    content = content.replace(target_filter_block, filter_options_html.strip())
    
    # Update Table Units (Generic Tonnes)
    content = content.replace('<td>Barrels</td>', '<td>Tonnes</td>')
    
    # Update Table Descriptions (Generic)
    content = content.replace('<td>Crude Oil Production Total</td>', f'<td>{title} Total</td>')
    content = content.replace('<td>Crude Oil Export</td>', f'<td>{title} Export</td>')
    content = content.replace('<td>Crude Oil Received by Refineries</td>', f'<td>{title} - Industrial</td>')
    content = content.replace('<td>Crude Oil Processed by Refineries</td>', f'<td>{title} - Commercial</td>')
    
    # Update Navigation Active States
    # 1. Petroleum Statistics should NOT be active
    content = content.replace('<span class="nav-link dropdown-toggle active">Petroleum Statistics', 
                              '<span class="nav-link dropdown-toggle">Petroleum Statistics')
    
    # 2. Electricity should NOT be active
    content = content.replace('<span class="nav-link dropdown-toggle active">Electricity', 
                              '<span class="nav-link dropdown-toggle">Electricity')
    
    # 3. Biomass & Coal SHOULD be active
    content = content.replace('<span class="nav-link dropdown-toggle">Biomass &amp; Coal', 
                              '<span class="nav-link dropdown-toggle active">Biomass &amp; Coal')
    
    # 4. Update the actual links in the dropdown to highlight the current one
    # Note: This is tricky since the template has '#' or specific links.
    # Let's first fix the template's placeholders in the script-generated content.
    
    # Link placeholders in the Biomass dropdown
    dropdown_placeholder = """<div class="drop-menu">
                    <a href="#" class="drop-item">Fuelwood Consumption</a>
                    <a href="#" class="drop-item">Charcoal Consumption</a>
                    <a href="#" class="drop-item">Coal Consumption</a>
                    <a href="#" class="drop-item">Coal Export</a>
                    <a href="#" class="drop-item">Coal for Electricity</a>
                </div>"""
    
    links_html = f'''<div class="drop-menu">
                    <a href="fuelwood-consumption.html" class="drop-item {"active" if filename == "fuelwood-consumption.html" else ""}">Fuelwood Consumption</a>
                    <a href="charcoal-consumption.html" class="drop-item {"active" if filename == "charcoal-consumption.html" else ""}">Charcoal Consumption</a>
                    <a href="coal-consumption.html" class="drop-item {"active" if filename == "coal-consumption.html" else ""}">Coal Consumption</a>
                    <a href="coal-export.html" class="drop-item {"active" if filename == "coal-export.html" else ""}">Coal Export</a>
                    <a href="coal-for-electricity.html" class="drop-item {"active" if filename == "coal-for-electricity.html" else ""}">Coal for Electricity</a>
                </div>'''
    
    content = content.replace(dropdown_placeholder, links_html)

    # Do the same for Mobile Nav
    mobile_dropdown_placeholder = """<div class="mobile-dropdown-content">
                        <a href="#">Fuelwood Consumption</a>
                        <a href="#">Charcoal Consumption</a>
                        <a href="#">Coal Consumption</a>
                        <a href="#">Coal Export</a>
                        <a href="#">Coal for Electricity</a>
                    </div>"""
    
    mobile_links_html = f'''<div class="mobile-dropdown-content">
                        <a href="fuelwood-consumption.html">Fuelwood Consumption</a>
                        <a href="charcoal-consumption.html">Charcoal Consumption</a>
                        <a href="coal-consumption.html">Coal Consumption</a>
                        <a href="coal-export.html">Coal Export</a>
                        <a href="coal-for-electricity.html">Coal for Electricity</a>
                    </div>'''
    
    content = content.replace(mobile_dropdown_placeholder, mobile_links_html)

    # Finally, fix the desktop nav for Petroleum and Electricity to not have active drop-items
    content = content.replace('<a href="crude-oil.html" class="drop-item active">Crude Oil Statistics</a>', 
                              '<a href="crude-oil.html" class="drop-item">Crude Oil Statistics</a>')
    
    with open(filename, 'w') as f:
        f.write(content)

print("Biomass & Coal pages generated successfully.")
