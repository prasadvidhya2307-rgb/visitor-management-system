const BASE_URL = 'https://vctcr7t3-3000.inc1.devtunnels.ms/api/v1';

function dataURLtoBlob(dataURL) {
  const parts = dataURL.split(',');
  const mime = parts[0].match(/:(.*?);/)[1];
  const bytes = atob(parts[1]);
  const ab = new ArrayBuffer(bytes.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < bytes.length; i++) ia[i] = bytes.charCodeAt(i);
  return new Blob([ab], { type: 'image/jpeg' });
}

export async function recognizeFace(dataURL) {
  const blob = dataURLtoBlob(dataURL);
  const formData = new FormData();
  formData.append('image', blob, 'photo.jpg');
  const res = await fetch(`${BASE_URL}/face/recognize`, { method: 'POST', body: formData });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function checkIn(visitorPayload, visitPayload, dataURL) {
  const blob = dataURLtoBlob(dataURL);
  const formData = new FormData();
  formData.append('visitor', JSON.stringify(visitorPayload));
  formData.append('visit', JSON.stringify(visitPayload));
  formData.append('image', blob, 'photo.jpg');
  const res = await fetch(`${BASE_URL}/check-in`, { method: 'POST', body: formData });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}
