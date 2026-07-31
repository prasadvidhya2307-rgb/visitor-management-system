import fs from "node:fs";

const formData = new FormData();

formData.append(
  "visitor",
  JSON.stringify({
    firstName: "Small2 Boy",
    lastName: "Kandhwe",
    identityType: "AADHAAR",
    identityNumber: "124",
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
    hostEmployeeId: "408332e9-b753-4eed-bc8e-17935ea09b88",
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
