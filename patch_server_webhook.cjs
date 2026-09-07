const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf8');

serverCode = serverCode.replace(
  /await adminDb\.collection\('users'\)\.doc\(customId\)\.update\(\{\s*hasPurchased: true,\s*lastPurchaseId: capture\.id\s*\}\);/g,
  `console.log("Mock update: user " + customId + " hasPurchased set to true with capture id " + capture.id);`
);

serverCode = serverCode.replace(/import \{ adminDb \} from '.\/server-firebase-admin';\n?/, '');

fs.writeFileSync('server.ts', serverCode);
