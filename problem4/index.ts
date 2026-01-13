/**
 * Implementation 1: Loop through numbers
 * 
 * - Time: O(n)
 * - Space: O(1)
 */
function sum_to_n_a(n: number): number {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}

/**
 * Implementation 2: Use math formula
 * 
 * - Time: O(1)
 * - Space: O(1)
 */
function sum_to_n_b(n: number): number {
  return (n * (n + 1)) / 2;
}

/**
 * Implementation 3: Recursion
 * 
 * - Time: O(n)
 * - Space: O(n)
 */
function sum_to_n_c(n: number): number {
  if (n <= 0) return 0;
  if (n === 1) return 1;
  return n + sum_to_n_c(n - 1);
}

(() => {
  const testValue = 10;

  console.log(`\nCalculating sum from 1 to ${testValue}:\n`);

  console.log(`sum_to_n_a(${testValue}) = ${sum_to_n_a(testValue)}`);
  console.log(`sum_to_n_b(${testValue}) = ${sum_to_n_b(testValue)}`);
  console.log(`sum_to_n_c(${testValue}) = ${sum_to_n_c(testValue)}`);

})();
