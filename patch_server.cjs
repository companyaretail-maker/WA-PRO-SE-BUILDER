const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /const \{ sku, price, description, amount \} = req\.body;/,
  "const { sku, price, description, amount, custom_id } = req.body;"
);

code = code.replace(
  /amount: \{ currency_code: 'USD', value: amount \|\| price \}/,
  "amount: { currency_code: 'USD', value: amount || price },\n              custom_id: custom_id"
);

fs.writeFileSync('server.ts', code);
