const fs = require('fs');

function replacePayPal(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  
  // Replace createOrder
  code = code.replace(/createOrder=\{\(data, actions\) => \{[\s\S]*?return actions\.order\.create\(\{[\s\S]*?purchase_units: \[\{ amount: \{ currency_code: "USD", value: ("35\.00"|"99\.00"|amount) \}(?:, description)?(?:, custom_id: user\?\.uid)? \}\][\s\S]*?\}\);\n\s*\}\}/g, (match, p1) => {
    let sku = p1 === '"35.00"' ? '"SINGLE_FORM"' : (p1 === '"99.00"' ? '"FULL_PACKET"' : 'description || "GENERIC_PURCHASE"');
    return `createOrder={async (data, actions) => {
            const res = await fetch("/api/paypal/create-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                sku: ${sku},
                amount: ${p1},
                custom_id: user?.uid
              })
            });
            const order = await res.json();
            return order.id;
          }}`;
  });

  // Replace onApprove
  code = code.replace(/onApprove=\{async \(data, actions\) => \{[\s\S]*?if \(actions\.order\) \{[\s\S]*?const details = await actions\.order\.capture\(\);[\s\S]*?console\.log\(".*?Transaction completed by.*?", details\.payer\?\.name\?\.given_name\);[\s\S]*?(setIsPaid\(true\);)?[\s\S]*?(onComplete\(\);|onPurchaseComplete\?\.\(\);)[\s\S]*?\}[\s\S]*?\}\}/g, (match, p1, p2) => {
    return `onApprove={async (data, actions) => {
            const res = await fetch("/api/checkout/confirm", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: data.orderID
              })
            });
            const confirmData = await res.json();
            if (confirmData.status === 'COMPLETED' || confirmData.status === 'APPROVED') {
              ${p1 ? p1 : ''}
              ${p2 ? p2 : ''}
            }
          }}`;
  });

  // Also catch the second variant in PacketViewer (Premium Package)
  code = code.replace(/onApprove=\{async \(data, actions\) => \{[\s\S]*?if \(actions\.order\) \{[\s\S]*?const details = await actions\.order\.capture\(\);[\s\S]*?console\.log\("Premium Package unlocked by", details\.payer\?\.name\?\.given_name\);[\s\S]*?(setIsPaid\(true\);)?[\s\S]*?(onPurchaseComplete\?\.\(\);)[\s\S]*?\}[\s\S]*?\}\}/g, (match, p1, p2) => {
    return `onApprove={async (data, actions) => {
            const res = await fetch("/api/checkout/confirm", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: data.orderID
              })
            });
            const confirmData = await res.json();
            if (confirmData.status === 'COMPLETED' || confirmData.status === 'APPROVED') {
              ${p1 ? p1 : ''}
              ${p2 ? p2 : ''}
            }
          }}`;
  });

  fs.writeFileSync(filePath, code);
}

replacePayPal('src/components/PacketViewer.tsx');
replacePayPal('src/components/PayPalCheckout.tsx');
