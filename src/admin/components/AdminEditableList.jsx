import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function AdminEditableList({ items = [], onChange, label, placeholder = "Add new item..." }) {
  const [newItem, setNewItem] = useState('');

  const handleAdd = () => {
    if (newItem.trim()) {
      onChange([...items, newItem.trim()]);
      setNewItem('');
    }
  };

  const handleRemove = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleEdit = (index, val) => {
    const newArr = [...items];
    newArr[index] = val;
    onChange(newArr);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label style={{ fontSize: '14px', fontWeight: 'bold' }}>{label}</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--line)' }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input 
              value={item} 
              onChange={e => handleEdit(i, e.target.value)} 
              style={{ flex: 1, padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--line)' }}
            />
            <button type="button" onClick={() => handleRemove(i)} style={{ color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer' }}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' }}>
          <input 
            value={newItem} 
            onChange={e => setNewItem(e.target.value)} 
            placeholder={placeholder} 
            style={{ flex: 1, padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--line)' }}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
          />
          <button type="button" onClick={handleAdd} style={{ color: 'var(--green)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <Plus size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
