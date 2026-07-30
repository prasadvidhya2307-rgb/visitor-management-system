import fs from "node:fs";

const formData = new FormData();

formData.append(
  "visitor",
  JSON.stringify({
    firstName: "Small2 Boy",
    lastName: "Kandhwe",
    identityType: "AADHAAR",
    identityNumber: "1234sddffffif12",
    emails: [
      {
        email: "aayushefefef@example.com",
        isPrimary: true,
      },
    ],
    mobiles: [
      {
        mobile: "9876543210",
        isPrimary: true,
      },
    ],
  }),
);

formData.append(
  "visit",
  JSON.stringify({
    hostEmployeeId: "c9d6d4d0-8c93-4f2c-9d16-6d2d8e5d7b11",
    purpose: "TECHNICAL_DISCUSSION",
    floor: 3,
  }),
);

formData.append(
  "image",
  await fs.openAsBlob("./photo.jpg", {
    type: "image/jpeg",
  }),
  "photo.jpg",
);

const response = await fetch("http://localhost:3000/api/v1/check-in", {
  method: "POST",
  body: formData,
});

const data = await response.json();

console.log("Status:", response.status);
console.dir(data, { depth: null });
