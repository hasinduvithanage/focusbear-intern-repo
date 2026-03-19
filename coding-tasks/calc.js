function add(a, b) {
  return a + b;
}

if (add(2, 2) !== 4) {
  console.error('Test failed: add(2,2) should be 4'); // eslint-disable-line no-console
  process.exit(1);
}

console.log('Test passed'); // eslint-disable-line no-console

//comment 1

//"//comment 0"

//comment 2
//comment 3
