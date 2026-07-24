with open("src/admin/components/FullProductEditor.jsx", "r") as f:
    content = f.read()

content = content.replace(
    '<input name="price" value={formData.price} onChange={handleChange} placeholder="e.g. From $35 / person" />',
    '<input name="price" value={formData.price} onChange={handleChange} placeholder="e.g. From $35 / person" style={{ border: errors.price ? \'1px solid red\' : \'\' }} />\n                  {errors.price && <span style={{ color: \'red\', fontSize: \'12px\' }}>{errors.price}</span>}'
)

content = content.replace(
    '<select name="category" value={formData.category} onChange={handleChange}>',
    '<select name="category" value={formData.category} onChange={handleChange} style={{ border: errors.category ? \'1px solid red\' : \'\' }}>'
)
content = content.replace(
    '</select>\n                </div>\n                <div className="form-field">\n                  <label>Activity Type',
    '</select>\n                  {errors.category && <span style={{ color: \'red\', fontSize: \'12px\' }}>{errors.category}</span>}\n                </div>\n                <div className="form-field">\n                  <label>Activity Type'
)

with open("src/admin/components/FullProductEditor.jsx", "w") as f:
    f.write(content)
