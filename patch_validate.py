with open("src/admin/components/FullProductEditor.jsx", "r") as f:
    content = f.read()

content = content.replace(
    "if (!formData.slug) newErrors.slug = 'Slug is required';",
    "if (!formData.slug) newErrors.slug = 'Slug is required';\n    if (!formData.price) newErrors.price = 'Price is required';"
)

content = content.replace(
    "(errors.title || errors.slug || errors.featured)",
    "(errors.title || errors.slug || errors.price || errors.featured)"
)

with open("src/admin/components/FullProductEditor.jsx", "w") as f:
    f.write(content)
