import React, { useEffect, useState } from 'react';
import { getMediaObjectUrl } from '../api';

export default function VisitorAvatar({ visitor, className = 'vis-av', style = {} }) {
  const [src, setSrc] = useState(null);
  useEffect(() => { let url; if (visitor?.registrationImageId) getMediaObjectUrl(visitor.registrationImageId).then(value => { url = value; setSrc(value); }).catch(() => {}); return () => { if (url) URL.revokeObjectURL(url); }; }, [visitor?.registrationImageId]);
  return <div className={className} style={{ ...style, overflow: 'hidden' }}>{src ? <img src={src} alt={visitor?.name || 'Visitor'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : visitor?.name?.charAt(0) || '?'}</div>;
}
