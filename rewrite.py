import re

with open("src/admin/components/FullProductEditor.jsx", "r") as f:
    text = f.read()

# 1. Update Tabs array
tabs_old = r"  const tabs = \[\s*\{ id: 'overview'.*?\];"
tabs_new = """  const tabs = [
    { id: 'basic', label: 'Basic Information' },
    { id: 'media', label: 'Media' },
    { id: 'packages', label: 'Pricing' },
    { id: 'experience', label: 'Experience Details' },
    { id: 'description', label: 'Description' },
    { id: 'meeting', label: 'Location' },
    { id: 'reviews', label: 'Reviews' }
  ];"""
text = re.sub(tabs_old, tabs_new, text, flags=re.DOTALL)

# 2. Update activeTab initial value and string matches
text = text.replace("useState('overview')", "useState('basic')")
text = text.replace("setActiveTab('overview')", "setActiveTab('basic')")
text = text.replace("activeTab === 'overview'", "activeTab === 'basic'")
text = text.replace("tab.id === 'overview'", "tab.id === 'basic'")

# 3. Restructure form fields
# We'll replace the entire <form id="productForm">...</form> 
# Actually, replacing the whole form is easiest.
# Let's extract the form body.
start_form = text.find('<form id="productForm"')
end_form = text.find('</form>', start_form) + 7

form_old = text[start_form:end_form]

# We need the media section
media_section = re.search(r'<div className="form-field">\s*<label>Media Gallery.*?</div>\s*</div>', form_old, re.DOTALL).group(0)

# Remove media from its old place in overview
overview_content = form_old
overview_content = overview_content.replace(media_section, "")

# Remove TAB: TAGS and move it to experience or basic. The user says no tags tab. 
# "Tags: Các nhãn ngắn để hỗ trợ tìm kiếm..." 
# We will put tags at the bottom of Basic Info.

# Change shortDescription
# The user wants shortDescription mapped strictly.
overview_content = overview_content.replace('value={formData.shortDescription || formData.subtitle}', 'value={formData.shortDescription}')

# Change fullDescription to description
overview_content = overview_content.replace('value={formData.fullDescription || formData.description}', 'value={formData.description}')
overview_content = overview_content.replace('name="fullDescription"', 'name="description"')

# Update Activity Type field inside Basic Info
activity_type_html = """
                <div className="form-field">
                  <label>Activity Type</label>
                  <select name="activityType" value={formData.experienceTags?.includes('Online') ? 'Online' : formData.experienceTags?.includes('DIY') ? 'DIY Kit' : 'Offline'} onChange={(e) => {
                    const val = e.target.value;
                    const tags = (formData.experienceTags || []).filter(t => t !== 'Offline' && t !== 'Online' && t !== 'DIY Kit');
                    setFormData(p => ({ ...p, experienceTags: [...tags, val] }));
                  }}>
                    <option value="Offline">Offline</option>
                    <option value="Online">Online</option>
                    <option value="DIY Kit">DIY Kit</option>
                  </select>
                </div>
"""
overview_content = overview_content.replace('<div className="form-field">\s*<label>Product group', activity_type_html + '\n                <div className="form-field">\n                  <label>Product group')

# Generate new form
form_new = f"""<form id="productForm" onSubmit={{handleSubmit}} className="admin-form-body" style={{{{ flex: 1, overflowY: 'auto', background: '#f1f5f9' }}}}>
          
          {{/* TAB: BASIC */}}
          <div style={{{{ display: activeTab === 'basic' ? 'block' : 'none' }}}}>
            <SectionGroup title="Main Identity" description="Core details used to identify this product on the platform.">
              <div className="field-grid-2">
                <div className="form-field">
                  <label>Product Name <span style={{{{color: 'red'}}}}>*</span></label>
                  <input name="title" value={{formData.title}} onChange={{handleChange}} onBlur={{handleTitleBlur}} style={{{{ border: errors.title ? '1px solid red' : '' }}}} required placeholder="e.g. Traditional Lion Head Crafting" />
                  {{errors.title && <span style={{{{ color: 'red', fontSize: '12px' }}}}>{{errors.title}}</span>}}
                </div>
                <div className="form-field">
                  <label>URL Slug <span style={{{{color: 'red'}}}}>*</span></label>
                  <input name="slug" value={{formData.slug}} onChange={{handleChange}} style={{{{ border: errors.slug ? '1px solid red' : '' }}}} required placeholder="auto-generated-slug" />
                </div>
              </div>
              
              <div className="field-grid-2">
                <div className="form-field">
                  <label>Category</label>
                  <select name="category" value={{formData.category}} onChange={{handleChange}}>
                    {{PRODUCT_CATEGORIES.map(c => <option key={{c.key}} value={{c.key}}>{{c.label}}</option>)}}
                  </select>
                </div>
                {activity_type_html}
                <div className="form-field">
                  <label>Product group / Collection</label>
                  <select name="groupName" value={{formData.groupName}} onChange={{handleChange}}>
                    <option value="">None</option>
                    {{PRODUCT_COLLECTIONS.map(c => <option key={{c}} value={{c}}>{{c}}</option>)}}
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label>Short Description</label>
                <textarea name="shortDescription" value={{formData.shortDescription}} onChange={{handleChange}} rows="2" placeholder="A catchy one-liner..." style={{{{ minHeight: '60px' }}}} />
              </div>
            </SectionGroup>

            <SectionGroup title="Visibility & Ordering" description="Control where and how this product appears on the storefront.">
              <div style={{{{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}}}>
                <label style={{{{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', color: '#334155' }}}}>
                  <input type="checkbox" name="status" checked={{formData.status === 'published'}} onChange={{(e) => setFormData(p => ({{ ...p, status: e.target.checked ? 'published' : 'draft', featured: e.target.checked ? p.featured : false }}))}} style={{{{ width: '18px', height: '18px' }}}} />
                  Active / Published
                </label>
                <label style={{{{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', color: '#334155' }}}}>
                  <input type="checkbox" name="featured" checked={{formData.featured}} onChange={{handleChange}} disabled={{formData.status !== 'published'}} style={{{{ width: '18px', height: '18px', opacity: formData.status === 'published' ? 1 : 0.5 }}}} />
                  Featured on Home
                </label>
                <div style={{{{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '14px', color: '#334155' }}}}>
                  Sort Order:
                  <input type="number" name="sortOrder" value={{formData.sortOrder}} onChange={{handleChange}} style={{{{ width: '80px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}}} />
                </div>
              </div>
              {{errors.featured && <div style={{{{ color: 'red', fontSize: '13px', marginTop: '8px' }}}}>{{errors.featured}}</div>}}
            </SectionGroup>
          </div>

          {{/* TAB: MEDIA */}}
          <div style={{{{ display: activeTab === 'media' ? 'block' : 'none' }}}}>
            <SectionGroup title="Media">
              {media_section}
            </SectionGroup>
          </div>
"""

# Extract the rest of the tabs
packages_section = re.search(r'<div style={{ display: activeTab === \'packages\' \? \'block\' : \'none\' }}>.*?</div>\s*</div>\s*</div>\s*</div>\s*</div>', overview_content, re.DOTALL)
if packages_section:
    pass

# We will just use the original content's packages, experience, description, meeting, reviews sections
# Since the regex above might be too complex, let's just do a string replacement on `overview_content`.

text = text.replace(form_old, form_new + "\n" + form_old[form_old.find("{/* TAB: PRICING / PACKAGES */}"):])

# Now we need to remove the TAGS tab entirely from the old string.
tags_tab = re.search(r'\{\/\* TAB: TAGS \*\/.*?</div>\s*</div>', text, re.DOTALL)
if tags_tab:
    text = text.replace(tags_tab.group(0), "")

# We need to move tags inside experience Details or Basic.
# Let's put Tags at the bottom of Experience Details.
exp_tab_end = text.find("{/* TAB: DESCRIPTION */}")
if exp_tab_end != -1:
    tags_html = """
            <SectionGroup title="Tags" description="Categorize for search and filtering.">
              <div className="form-field">
                <label>Experience Tags</label>
                <ChipSelector options={EXPERIENCE_TAGS} selected={formData.experienceTags || []} onChange={(v) => setFormData(p => ({...p, experienceTags: v}))} />
              </div>
              <div className="form-field" style={{ marginTop: '16px' }}>
                <label>Booking Tags</label>
                <ChipSelector options={BOOKING_TAGS} selected={formData.bookingTags || []} onChange={(v) => setFormData(p => ({...p, bookingTags: v}))} />
              </div>
              <div className="form-field" style={{ marginTop: '16px' }}>
                <label>Priority Tags</label>
                <ChipSelector options={PRIORITY_TAGS} selected={formData.priorityTags || []} onChange={(v) => setFormData(p => ({...p, priorityTags: v}))} />
              </div>
            </SectionGroup>
          </div>
"""
    # Replace the closing div of experience tab
    text = text.replace("            </SectionGroup>\n          </div>\n\n          {/* TAB: DESCRIPTION */}", "            </SectionGroup>\n" + tags_html + "\n          {/* TAB: DESCRIPTION */}")

# Remove the old OVERVIEW tab since we injected TAB: BASIC and TAB: MEDIA
text = re.sub(r'\{\/\* TAB: OVERVIEW \*\/.*?\{\/\* TAB: PRICING', '{/* TAB: PRICING', text, flags=re.DOTALL)

with open("src/admin/components/FullProductEditor.jsx", "w") as f:
    f.write(text)

print("Done")
