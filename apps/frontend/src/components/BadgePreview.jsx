import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FiDownload } from 'react-icons/fi';

export default function BadgePreview() {
  const badgeCode = `VMS-${Date.now().toString(36).toUpperCase().slice(-8)}`;
  const now = new Date();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="row justify-content-center">
      <div className="col-xl-4 col-lg-6">
        <div className="text-center mb-4">
          <h3 style={{ fontSize: 20, fontWeight: 700 }}>Visitor Badge</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Print this badge and provide it to the visitor
          </p>
        </div>

        <div className="badge-card" id="badge-printable">
          <div className="badge-card-header">
            <div style={{ marginBottom: 8 }}>
              <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="rgba(255,255,255,0.2)"/>
                <path d="M16 8C12.7 8 10 10.7 10 14V18H8V24H24V18H22V14C22 10.7 19.3 8 16 8Z" fill="white"/>
              </svg>
            </div>
            <h2>VISITOR PASS</h2>
            <p>Visitor Management System</p>
          </div>

          <div className="badge-card-body">
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', textAlign: 'left', marginBottom: 8 }}>
              <strong>BADGE CODE:</strong> {badgeCode}
            </div>

            <div className="badge-qr">
              <QRCodeSVG
                value={JSON.stringify({ badge_code: badgeCode, date: now.toISOString() })}
                size={140}
                bgColor="#ffffff"
                fgColor="#0F172A"
                level="M"
                includeMargin={false}
              />
            </div>

            <div style={{ fontSize: 11, color: 'var(--text-secondary)', textAlign: 'left', marginBottom: 8 }}>
              <strong>DATE:</strong> {now.toLocaleDateString()}
            </div>

            <div className="badge-details">
              <div className="badge-detail-row">
                <span className="label">Issue Date</span>
                <span className="value">{now.toLocaleDateString()}</span>
              </div>
              <div className="badge-detail-row">
                <span className="label">Issue Time</span>
                <span className="value">{now.toLocaleTimeString()}</span>
              </div>
              <div className="badge-detail-row">
                <span className="label">Valid For</span>
                <span className="value">Single Day</span>
              </div>
            </div>

            <p style={{ fontSize: 10, color: 'var(--text-light)', marginTop: 16 }}>
              This badge is valid only for the date of issue. Please return this badge upon exit.
            </p>
          </div>
        </div>

        <div className="text-center mt-4">
          <button className="btn-primary-custom" onClick={handlePrint}>
            <FiDownload size={16} /> Print Badge
          </button>
        </div>

        <style>{`
          @media print {
            body * { visibility: hidden; }
            #badge-printable, #badge-printable * { visibility: visible; }
            #badge-printable { position: absolute; left: 50%; transform: translateX(-50%); top: 20px; }
          }
        `}</style>
      </div>
    </div>
  );
}
