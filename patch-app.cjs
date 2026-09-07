const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Remove firebase imports
code = code.replace(/import \{ doc, updateDoc \} from 'firebase\/firestore';\n/, '');
code = code.replace(/import \{ db \} from '\.\/firebase';\n/, '');

// Replace handlePurchaseComplete
const oldHandle = `const handlePurchaseComplete = async () => {
    setHasPurchased(true);
    if (user?.uid) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          hasPurchased: true
        });
      } catch (err) {
        console.error("Failed to update purchase in Firebase", err);
      }
    }
  };`;

const newHandle = `const handlePurchaseComplete = async () => {
    setHasPurchased(true);
    if (user?.uid) {
      console.log("Mock updated user purchase state.");
    }
  };`;

code = code.replace(/const handlePurchaseComplete = async \(\) => \{[\s\S]*?\}\s*};\s*/, newHandle + '\n\n  ');

fs.writeFileSync('src/App.tsx', code);
