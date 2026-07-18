export const submitLeadAPI = async (payload) => {
  const res = await fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error('Server returned an invalid response');
  }

  if (!res.ok) {
    throw { status: res.status, data };
  }

  return data;
};
