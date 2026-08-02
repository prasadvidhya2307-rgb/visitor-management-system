import React, { useEffect, useState } from 'react';
import { getMediaObjectUrl } from '../api';

export default function EmployeeAvatar({ employee, size = 38 }) {
  const [src, setSrc] = useState(null);
  useEffect(() => { let url; if (employee?.profileImageId) getMediaObjectUrl(employee.profileImageId).then(value => { url = value; setSrc(value); }).catch(() => {}); return () => { if (url) URL.revokeObjectURL(url); }; }, [employee?.profileImageId]);
  return <div className="employee-avatar" style={{ width: size, height: size }}>{src ? <img src={src} alt={employee?.name || 'Employee'} /> : employee?.name?.charAt(0) || '?'}</div>;
}
