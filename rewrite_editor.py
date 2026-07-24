import re

with open("src/admin/components/FullProductEditor.jsx", "r") as f:
    content = f.read()

# Replace tabs array
tabs_str = """  const tabs = [
    { id: 'basic', label: 'Basic Information' },
    { id: 'media', label: 'Media' },
    { id: 'packages', label: 'Pricing' },
    { id: 'experience', label: 'Experience Details' },
    { id: 'description', label: 'Description' },
    { id: 'meeting', label: 'Location' },
    { id: 'reviews', label: 'Reviews' }
  ];"""
content = re.sub(r'const tabs = \[\s*\{ id: \'overview\'.*?\];', tabs_str, content, flags=re.DOTALL)

# Replace 'overview' with 'basic' in activeTab initial state and checks
content = content.replace("useState('overview')", "useState('basic')")
content = content.replace("setActiveTab('overview')", "setActiveTab('basic')")
content = content.replace("activeTab === 'overview'", "activeTab === 'basic'")
content = content.replace("tab.id === 'overview'", "tab.id === 'basic'")
content = content.replace("{/* TAB: OVERVIEW */}", "{/* TAB: BASIC */}")

# Now we need to move Media out of BASIC and into its own tab.
# We also need to add Activity Type.
# The user wants:
# Basic Information: Product Name, URL Slug, Category, Activity Type, Collection, Status, Featured, Short Description
# Media: Upload Images, Cover Image, Gallery
# Pricing: Base Price, Packages, Currency
# Experience Details: Duration, Languages, Group Size, Included, Not Included, Highlights
# Description: Full Description, What Customers Will Do, Additional Notes
# Location: Meeting Point, Address, Map URL, Online Meeting Details
# Reviews: Review list, Rating summary

# I will just write a new script that outputs the desired JSX structure.
