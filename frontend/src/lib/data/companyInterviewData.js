/**
 * COMPANY-SPECIFIC INTERVIEW REPOSITORY
 * Contains Round 1 (MCQs), Round 2 (Coding Challenges with Test Cases & Boilerplate),
 * and Round 3 (Core Technical Q&A) for top companies.
 */

export const COMPANIES_LIST = [
  { id: 'all', name: 'All Companies / General IT', badge: 'General IT', color: 'indigo' },
  { id: 'tcs', name: 'TCS (Tata Consultancy Services)', badge: 'NQT / Digital / Prime', color: 'blue' },
  { id: 'zoho', name: 'Zoho Corporation', badge: 'Round 2 Coding & LLD', color: 'red' },
  { id: 'infosys', name: 'Infosys', badge: 'DSE / Power Programmer', color: 'sky' },
  { id: 'capgemini', name: 'Capgemini', badge: 'Senior Analyst / Dev', color: 'violet' },
  { id: 'accenture', name: 'Accenture', badge: 'AASE & Advanced Tech', color: 'purple' },
  { id: 'amazon', name: 'Amazon', badge: 'SDE-1 & AWS Track', color: 'amber' }
];

export const COMPANY_MCQS = [
  // ==================== TCS MCQs ====================
  {
    id: 'tcs_mcq_1',
    companyId: 'tcs',
    company: 'TCS',
    topic: 'Java & OOP',
    question: 'In Java, which of the following is true regarding multiple inheritance and interfaces?',
    options: [
      'Java supports multiple inheritance of classes directly using the "extends" keyword.',
      'Java achieves multiple inheritance exclusively through interfaces using the "implements" keyword.',
      'Java does not allow a class to implement more than one interface.',
      'Default methods in Java 8 completely removed interfaces from the language.'
    ],
    correctAnswer: 1,
    explanation: 'Java avoids the diamond problem by disallowing multiple class inheritance with "extends", but enables multiple inheritance of type and behavior through multiple interfaces with "implements".'
  },
  {
    id: 'tcs_mcq_2',
    companyId: 'tcs',
    company: 'TCS',
    topic: 'SQL & Database Systems',
    question: 'Which SQL clause is used to filter aggregated group records after a GROUP BY statement?',
    options: [
      'WHERE clause',
      'ORDER BY clause',
      'HAVING clause',
      'LIMIT clause'
    ],
    correctAnswer: 2,
    explanation: 'The WHERE clause filters individual rows before grouping, whereas the HAVING clause is applied after GROUP BY to filter aggregate results (e.g. HAVING COUNT(*) > 5).'
  },
  {
    id: 'tcs_mcq_3',
    companyId: 'tcs',
    company: 'TCS',
    topic: 'Operating Systems & Concurrency',
    question: 'Which of the following is NOT one of the four Coffman conditions necessary for a Deadlock to occur?',
    options: [
      'Mutual Exclusion',
      'Hold and Wait',
      'Preemptive Resource Allocation',
      'Circular Wait'
    ],
    correctAnswer: 2,
    explanation: 'The four Coffman deadlock conditions are: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. "Preemptive allocation" actually prevents deadlocks.'
  },
  {
    id: 'tcs_mcq_4',
    companyId: 'tcs',
    company: 'TCS',
    topic: 'Time Complexity & DSA',
    question: 'What is the worst-case time complexity of searching for an element in a balanced Binary Search Tree (AVL / Red-Black Tree)?',
    options: [
      'O(1)',
      'O(log N)',
      'O(N)',
      'O(N log N)'
    ],
    correctAnswer: 1,
    explanation: 'A balanced BST guarantees a maximum tree height of O(log N), ensuring lookup, insertion, and deletion operations remain O(log N) even in the worst case.'
  },

  // ==================== ZOHO MCQs ====================
  {
    id: 'zoho_mcq_1',
    companyId: 'zoho',
    company: 'Zoho',
    topic: 'C Language & Pointers',
    question: 'What is the output of the following C snippet: `int a[] = {10, 20, 30}; int *p = a; printf("%d", *(p + 1));` ?',
    options: [
      '10',
      '20',
      '30',
      'Garbage address'
    ],
    correctAnswer: 1,
    explanation: '`p` points to the base index 0 (`a[0] = 10`). `*(p + 1)` performs pointer arithmetic moving by 1 integer size to `a[1]`, which holds 20.'
  },
  {
    id: 'zoho_mcq_2',
    companyId: 'zoho',
    company: 'Zoho',
    topic: 'Bitwise Operators & Logic',
    question: 'Which bitwise operation can determine if an integer `n > 0` is a power of 2 in O(1) time?',
    options: [
      '(n & (n + 1)) == 0',
      '(n & (n - 1)) == 0',
      '(n | (n - 1)) == 0',
      '(n ^ (n - 1)) == 0'
    ],
    correctAnswer: 1,
    explanation: 'For powers of 2 (e.g., 8: 1000 in binary), subtracting 1 flips all bits up to the lowest set bit (7: 0111). Thus `n & (n - 1)` equals 0 exclusively for powers of 2.'
  },
  {
    id: 'zoho_mcq_3',
    companyId: 'zoho',
    company: 'Zoho',
    topic: 'Memory Management',
    question: 'In C, what is the key functional difference between `malloc()` and `calloc()`?',
    options: [
      '`malloc()` initializes allocated memory to 0, whereas `calloc()` leaves garbage values.',
      '`calloc()` initializes allocated memory to zero bytes, whereas `malloc()` leaves garbage values.',
      '`malloc()` is allocated in stack, `calloc()` is in heap.',
      'There is no difference in memory initialization.'
    ],
    correctAnswer: 1,
    explanation: '`calloc(num, size)` allocates contiguous memory and clears all bytes to zero, whereas `malloc(size)` allocates uninitialized memory containing garbage values.'
  },

  // ==================== INFOSYS MCQs ====================
  {
    id: 'inf_mcq_1',
    companyId: 'infosys',
    company: 'Infosys',
    topic: 'Graph Theory & Algorithms',
    question: 'Which shortest-path algorithm is suitable for graphs with negative edge weights without negative cycles?',
    options: [
      "Dijkstra's Algorithm",
      'Bellman-Ford Algorithm',
      "Prim's Algorithm",
      "Kruskal's Algorithm"
    ],
    correctAnswer: 1,
    explanation: "Dijkstra's algorithm fails with negative weights because of its greedy assumption. The Bellman-Ford algorithm handles negative weights and detects negative weight cycles in O(V * E)."
  },
  {
    id: 'inf_mcq_2',
    companyId: 'infosys',
    company: 'Infosys',
    topic: 'Dynamic Programming',
    question: 'What are the two mandatory properties a problem must possess to be solvable via Dynamic Programming?',
    options: [
      'Greedy choice property and optimal substructure',
      'Optimal substructure and overlapping subproblems',
      'Divide-and-conquer and non-overlapping subproblems',
      'Breadth-first search and memoization'
    ],
    correctAnswer: 1,
    explanation: 'Dynamic Programming applies when a problem has "Optimal Substructure" (optimal solution contains optimal sub-solutions) and "Overlapping Subproblems" (same subproblems are solved repeatedly).'
  },

  // ==================== CAPGEMINI MCQs ====================
  {
    id: 'cap_mcq_1',
    companyId: 'capgemini',
    company: 'Capgemini',
    topic: 'Modern Web & JavaScript',
    question: 'In JavaScript, how do Promises and MutationObservers get scheduled in the Event Loop compared to `setTimeout`?',
    options: [
      'They are Macrotasks and run after `setTimeout`.',
      'They are Microtasks and execute immediately after the current call stack clears before the next Macrotask.',
      'They run synchronously on the main thread immediately, blocking execution.',
      'They run in a detached background OS thread pool.'
    ],
    correctAnswer: 1,
    explanation: 'Promise `.then()` callbacks and MutationObservers are Microtasks. The JavaScript event loop empties the entire microtask queue before fetching the next macrotask (like setTimeout).'
  },
  {
    id: 'cap_mcq_2',
    companyId: 'capgemini',
    company: 'Capgemini',
    topic: 'Microservices & REST',
    question: 'Which HTTP status code should be returned when a POST request successfully creates a new database resource?',
    options: [
      '200 OK',
      '201 Created',
      '204 No Content',
      '304 Not Modified'
    ],
    correctAnswer: 1,
    explanation: 'HTTP 201 Created is the standard RESTful response code indicating that the request has succeeded and led to the creation of a new resource (often returning the Location header).'
  },

  // ==================== ACCENTURE MCQs ====================
  {
    id: 'acc_mcq_1',
    companyId: 'accenture',
    company: 'Accenture',
    topic: 'Cloud Computing & AWS',
    question: 'In Cloud Architecture, what is the primary benefit of deploying applications across Multiple Availability Zones (Multi-AZ)?',
    options: [
      'Reduces raw network latency to zero.',
      'Guarantees High Availability and Fault Tolerance if one data center fails.',
      'Eliminates the requirement for SSL certificates.',
      'Doubles CPU clock speeds automatically.'
    ],
    correctAnswer: 1,
    explanation: 'Multi-AZ deployments place redundant resources across distinct physical data centers in a region to ensure seamless failover and 99.99%+ high availability.'
  },
  {
    id: 'acc_mcq_2',
    companyId: 'accenture',
    company: 'Accenture',
    topic: 'Software Design & SOLID',
    question: 'What does the "O" in SOLID design principles stand for?',
    options: [
      'Object-Oriented Programming Principle',
      'Open/Closed Principle: Software entities should be open for extension, but closed for modification.',
      'Operational Efficiency Principle',
      'Optimized Code Execution Principle'
    ],
    correctAnswer: 1,
    explanation: 'The Open/Closed Principle (OCP) states that classes/modules should allow new functionality to be added (extension) without altering their existing, tested source code (modification).'
  },

  // ==================== AMAZON MCQs ====================
  {
    id: 'amz_mcq_1',
    companyId: 'amazon',
    company: 'Amazon',
    topic: 'System Design & Distributed Data',
    question: 'According to the CAP Theorem for distributed systems, what does it state regarding Consistency, Availability, and Partition Tolerance?',
    options: [
      'A distributed system can guarantee all three (Consistency, Availability, and Partition Tolerance) simultaneously.',
      'A distributed system can provide at most two out of the three guarantees in the event of a network partition.',
      'Consistency is always sacrificed in modern cloud databases.',
      'Partition tolerance is only required in single-server databases.'
    ],
    correctAnswer: 1,
    explanation: 'The CAP Theorem asserts that in the presence of a network partition (P), a distributed data store must choose between Consistency (all nodes see the same data) and Availability (every request receives a response).'
  },
  {
    id: 'amz_mcq_2',
    companyId: 'amazon',
    company: 'Amazon',
    topic: 'Data Structures & Heaps',
    question: 'What is the time complexity to find the top K largest elements from an unsorted stream of N elements using a Min-Heap of size K?',
    options: [
      'O(N * K)',
      'O(N log K)',
      'O(N log N)',
      'O(K log N)'
    ],
    correctAnswer: 1,
    explanation: 'Maintaining a Min-Heap of size K requires O(log K) for each of the N stream elements, resulting in optimal O(N log K) time and O(K) space complexity.'
  }
];

export const COMPANY_CODING_CHALLENGES = [
  // ==================== TCS CODING ====================
  {
    id: 'tcs_code_1',
    companyId: 'tcs',
    company: 'TCS',
    title: 'Find Second Largest & Smallest Element in Array',
    difficulty: 'Easy-Medium',
    category: 'Array / Traversal',
    description: `Given an array of integers \`arr\` of size \`n\`, write a function that returns the second largest and second smallest distinct elements in the array in a single or optimal pass. If either does not exist, return -1 for that value.

### Example 1:
- **Input:** \`[1, 2, 4, 7, 7, 5]\`
- **Output:** \`{ secondSmallest: 2, secondLargest: 5 }\`

### Constraints:
- \`2 <= n <= 10^5\`
- \`-10^9 <= arr[i] <= 10^9\`
- Time Complexity Target: **O(N)**, Space: **O(1)**`,
    boilerplates: {
      javascript: `/**
 * Return an object: { secondSmallest: number, secondLargest: number }
 * If either does not exist, return -1 for that value.
 * @param {number[]} arr
 * @return {{ secondSmallest: number, secondLargest: number }}
 */
function solution(arr) {
  // Write your code here
  
}`,
      python: `def solution(arr):
    # Return (second_smallest, second_largest)
    # If either does not exist, return -1 for that value.
    # Write your code here
    pass`,
      java: `public class Solution {
    public static int[] solution(int[] arr) {
        // Return new int[]{ secondSmallest, secondLargest }
        // Write your code here
        return new int[]{-1, -1};
    }
}`
    },
    solutions: {
      javascript: `function solution(arr) {
  // Return an object: { secondSmallest: number, secondLargest: number }
  let smallest = Infinity, secondSmallest = Infinity;
  let largest = -Infinity, secondLargest = -Infinity;

  for (let num of arr) {
    if (num < smallest) {
      secondSmallest = smallest;
      smallest = num;
    } else if (num > smallest && num < secondSmallest) {
      secondSmallest = num;
    }

    if (num > largest) {
      secondLargest = largest;
      largest = num;
    } else if (num < largest && num > secondLargest) {
      secondLargest = num;
    }
  }

  return {
    secondSmallest: secondSmallest === Infinity ? -1 : secondSmallest,
    secondLargest: secondLargest === -Infinity ? -1 : secondLargest
  };
}`,
      python: `def solution(arr):
    # Return (second_smallest, second_largest)
    first_min = second_min = float('inf')
    first_max = second_max = float('-inf')
    
    for x in arr:
        if x < first_min:
            second_min = first_min
            first_min = x
        elif first_min < x < second_min:
            second_min = x
            
        if x > first_max:
            second_max = first_max
            first_max = x
        elif first_max > x > second_max:
            second_max = x
            
    return (
        -1 if second_min == float('inf') else second_min,
        -1 if second_max == float('-inf') else second_max
    )`,
      java: `public class Solution {
    public static int[] solution(int[] arr) {
        int small = Integer.MAX_VALUE, secondSmall = Integer.MAX_VALUE;
        int large = Integer.MIN_VALUE, secondLarge = Integer.MIN_VALUE;
        
        for (int x : arr) {
            if (x < small) { secondSmall = small; small = x; }
            else if (x > small && x < secondSmall) { secondSmall = x; }
            
            if (x > large) { secondLarge = large; large = x; }
            else if (x < large && x > secondLarge) { secondLarge = x; }
        }
        return new int[]{ (secondSmall == Integer.MAX_VALUE ? -1 : secondSmall), (secondLarge == Integer.MIN_VALUE ? -1 : secondLarge) };
    }
}`
    },
    testCases: [
      { input: "[1, 2, 4, 7, 7, 5]", expected: "secondSmallest: 2, secondLargest: 5" },
      { input: "[10, 10, 10]", expected: "secondSmallest: -1, secondLargest: -1" },
      { input: "[-5, -2, 0, 8, 12]", expected: "secondSmallest: -2, secondLargest: 8" }
    ],
    hints: [
      "Keep track of two variables for min and two for max as you iterate.",
      "Check strict inequalities (> and <) to skip duplicate values."
    ]
  },

  // ==================== ZOHO CODING ====================
  {
    id: 'zoho_code_1',
    companyId: 'zoho',
    company: 'Zoho',
    title: 'Matrix Spiral Traversal Order',
    difficulty: 'Medium',
    category: '2D Arrays / Simulation',
    description: `Given an \`m x n\` matrix, write a function to return all elements of the matrix in spiral order (Clockwise from top-left).

### Example 1:
- **Input:** \`[[1, 2, 3], [4, 5, 6], [7, 8, 9]]\`
- **Output:** \`[1, 2, 3, 6, 9, 8, 7, 4, 5]\`

### Constraints:
- \`m == matrix.length\`, \`n == matrix[i].length\`
- \`1 <= m, n <= 20\`
- Zoho Evaluation Rule: Do not use built-in flattening shortcuts. Maintain explicit row and column boundary pointers.`,
    boilerplates: {
      javascript: `/**
 * Return all elements of the matrix in spiral order (clockwise).
 * @param {number[][]} matrix
 * @return {number[]}
 */
function solution(matrix) {
  // Write your code here
  
}`,
      python: `def solution(matrix):
    # Return list of matrix elements in clockwise spiral order
    # Write your code here
    pass`,
      java: `import java.util.*;

public class Solution {
    public static List<Integer> solution(int[][] matrix) {
        // Return elements in clockwise spiral order
        // Write your code here
        return new ArrayList<>();
    }
}`
    },
    solutions: {
      javascript: `function solution(matrix) {
  if (!matrix || matrix.length === 0) return [];
  const result = [];
  let top = 0, bottom = matrix.length - 1;
  let left = 0, right = matrix[0].length - 1;

  while (top <= bottom && left <= right) {
    // 1. Traverse Right
    for (let i = left; i <= right; i++) result.push(matrix[top][i]);
    top++;

    // 2. Traverse Down
    for (let i = top; i <= bottom; i++) result.push(matrix[i][right]);
    right--;

    // 3. Traverse Left
    if (top <= bottom) {
      for (let i = right; i >= left; i--) result.push(matrix[bottom][i]);
      bottom--;
    }

    // 4. Traverse Up
    if (left <= right) {
      for (let i = bottom; i >= top; i--) result.push(matrix[i][left]);
      left++;
    }
  }

  return result;
}`,
      python: `def solution(matrix):
    if not matrix: return []
    res = []
    top, bottom = 0, len(matrix) - 1
    left, right = 0, len(matrix[0]) - 1
    
    while top <= bottom and left <= right:
        for j in range(left, right + 1): res.append(matrix[top][j])
        top += 1
        for i in range(top, bottom + 1): res.append(matrix[i][right])
        right -= 1
        if top <= bottom:
            for j in range(right, left - 1, -1): res.append(matrix[bottom][j])
            bottom -= 1
        if left <= right:
            for i in range(bottom, top - 1, -1): res.append(matrix[i][left])
            left += 1
    return res`,
      java: `import java.util.*;

public class Solution {
    public static List<Integer> solution(int[][] matrix) {
        List<Integer> res = new ArrayList<>();
        if (matrix == null || matrix.length == 0) return res;
        int top = 0, bottom = matrix.length - 1;
        int left = 0, right = matrix[0].length - 1;
        
        while (top <= bottom && left <= right) {
            for (int j = left; j <= right; j++) res.add(matrix[top][j]);
            top++;
            for (int i = top; i <= bottom; i++) res.add(matrix[i][right]);
            right--;
            if (top <= bottom) {
                for (int j = right; j >= left; j--) res.add(matrix[bottom][j]);
                bottom--;
            }
            if (left <= right) {
                for (int i = bottom; i >= top; i--) res.add(matrix[i][left]);
                left++;
            }
        }
        return res;
    }
}`
    },
    testCases: [
      { input: "[[1, 2, 3], [4, 5, 6], [7, 8, 9]]", expected: "[1, 2, 3, 6, 9, 8, 7, 4, 5]" },
      { input: "[[1, 2], [3, 4]]", expected: "[1, 2, 4, 3]" }
    ],
    hints: [
      "Maintain 4 boundary pointers: top, bottom, left, right.",
      "Check `top <= bottom` and `left <= right` before the backward passes."
    ]
  },
  {
    id: 'zoho_code_2',
    companyId: 'zoho',
    company: 'Zoho',
    title: 'Run-Length String Compression',
    difficulty: 'Easy-Medium',
    category: 'String Manipulation',
    description: `Given a string containing letters, compress consecutive repeating characters with their frequency count. If compressed length is not shorter, preserve character counts as format \`a3b2c1\`.

### Example 1:
- **Input:** \`"aaabbc"\`
- **Output:** \`"a3b2c1"\`

### Constraints:
- String contains only lowercase English alphabets.
- Time Complexity Target: **O(N)**.`,
    boilerplates: {
      javascript: `/**
 * Compress consecutive repeating characters with frequency count (e.g. "aaabbc" -> "a3b2c1").
 * @param {string} str
 * @return {string}
 */
function solution(str) {
  // Write your code here
  
}`,
      python: `def solution(s):
    # Compress consecutive repeating characters with count (e.g. "aaabbc" -> "a3b2c1")
    # Write your code here
    pass`,
      java: `public class Solution {
    public static String solution(String str) {
        // Return compressed string (e.g. "a3b2c1")
        // Write your code here
        return "";
    }
}`
    },
    solutions: {
      javascript: `function solution(str) {
  if (!str) return "";
  let result = "";
  let count = 1;

  for (let i = 0; i < str.length; i++) {
    if (i + 1 < str.length && str[i] === str[i + 1]) {
      count++;
    } else {
      result += str[i] + count;
      count = 1;
    }
  }

  return result;
}`,
      python: `def solution(s):
    if not s: return ""
    res = []
    count = 1
    for i in range(len(s)):
        if i + 1 < len(s) and s[i] == s[i+1]:
            count += 1
        else:
            res.append(s[i] + str(count))
            count = 1
    return "".join(res)`,
      java: `public class Solution {
    public static String solution(String str) {
        if (str == null || str.isEmpty()) return "";
        StringBuilder sb = new StringBuilder();
        int count = 1;
        for (int i = 0; i < str.length(); i++) {
            if (i + 1 < str.length() && str.charAt(i) == str.charAt(i + 1)) {
                count++;
            } else {
                sb.append(str.charAt(i)).append(count);
                count = 1;
            }
        }
        return sb.toString();
    }
}`
    },
    testCases: [
      { input: '"aaabbc"', expected: '"a3b2c1"' },
      { input: '"a"', expected: '"a1"' },
      { input: '"aabbcc"', expected: '"a2b2c2"' }
    ],
    hints: ["Iterate through the string and increment count while current char matches next char."]
  },

  // ==================== INFOSYS CODING ====================
  {
    id: 'inf_code_1',
    companyId: 'infosys',
    company: 'Infosys',
    title: 'Coin Change Problem (Minimum Coins)',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    description: `You are given an integer array \`coins\` representing coins of different denominations and an integer \`amount\` representing a total amount of money. Return the **fewest number of coins** that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return \`-1\`.

### Example 1:
- **Input:** \`coins = [1, 2, 5], amount = 11\`
- **Output:** \`3\` (Explanation: 11 = 5 + 5 + 1)

### Constraints:
- \`1 <= coins.length <= 12\`
- \`1 <= coins[i] <= 2^31 - 1\`
- \`0 <= amount <= 10^4\``,
    boilerplates: {
      javascript: `/**
 * Return the fewest number of coins needed to make up amount, or -1 if impossible.
 * @param {number[]} coins
 * @param {number} amount
 * @return {number}
 */
function solution(coins, amount) {
  // Write your code here
  
}`,
      python: `def solution(coins, amount):
    # Return fewest number of coins needed to make up amount, or -1 if impossible
    # Write your code here
    pass`,
      java: `public class Solution {
    public static int solution(int[] coins, int amount) {
        // Return fewest number of coins needed, or -1 if impossible
        // Write your code here
        return -1;
    }
}`
    },
    solutions: {
      javascript: `function solution(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;

  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (i - coin >= 0) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }

  return dp[amount] === Infinity ? -1 : dp[amount];
}`,
      python: `def solution(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for i in range(1, amount + 1):
        for c in coins:
            if i - c >= 0:
                dp[i] = min(dp[i], dp[i - c] + 1)
    return dp[amount] if dp[amount] != float('inf') else -1`,
      java: `import java.util.Arrays;

public class Solution {
    public static int solution(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1);
        dp[0] = 0;
        for (int i = 1; i <= amount; i++) {
            for (int c : coins) {
                if (i - c >= 0) {
                    dp[i] = Math.min(dp[i], dp[i - c] + 1);
                }
            }
        }
        return dp[amount] > amount ? -1 : dp[amount];
    }
}`
    },
    testCases: [
      { input: "coins = [1, 2, 5], amount = 11", expected: "3" },
      { input: "coins = [2], amount = 3", expected: "-1" },
      { input: "coins = [1], amount = 0", expected: "0" }
    ],
    hints: [
      "Use a bottom-up DP table of size amount + 1.",
      "dp[i] represents min coins needed for value i."
    ]
  },

  // ==================== CAPGEMINI CODING ====================
  {
    id: 'cap_code_1',
    companyId: 'capgemini',
    company: 'Capgemini',
    title: 'Valid Parentheses & Bracket Matching',
    difficulty: 'Easy-Medium',
    category: 'Stack / Parsing',
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

### Example 1:
- **Input:** \`"()[]{}"\`
- **Output:** \`true\`

### Example 2:
- **Input:** \`"(]"\`
- **Output:** \`false\``,
    boilerplates: {
      javascript: `/**
 * Determine if the input bracket string is valid.
 * @param {string} s
 * @return {boolean}
 */
function solution(s) {
  // Write your code here
  
}`,
      python: `def solution(s):
    # Determine if input bracket string is valid.
    # Write your code here
    pass`,
      java: `public class Solution {
    public static boolean solution(String s) {
        // Return true if valid bracket string, false otherwise
        // Write your code here
        return false;
    }
}`
    },
    solutions: {
      javascript: `function solution(s) {
  const stack = [];
  const map = {
    ')': '(',
    '}': '{',
    ']': '['
  };

  for (const char of s) {
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else {
      if (stack.length === 0 || stack.pop() !== map[char]) {
        return false;
      }
    }
  }

  return stack.length === 0;
}`,
      python: `def solution(s):
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in mapping.values():
            stack.append(char)
        elif char in mapping:
            if not stack or stack.pop() != mapping[char]:
                return False
    return len(stack) == 0`,
      java: `import java.util.Stack;

public class Solution {
    public static boolean solution(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '{') stack.push('}');
            else if (c == '[') stack.push(']');
            else if (stack.isEmpty() || stack.pop() != c) return false;
        }
        return stack.isEmpty();
    }
}`
    },
    testCases: [
      { input: '"()[]{}"', expected: "true" },
      { input: '"(]"', expected: "false" },
      { input: '"{[]}"', expected: "true" }
    ],
    hints: ["Use a Last-In First-Out (LIFO) Stack to match corresponding closing brackets."]
  },

  // ==================== AMAZON CODING ====================
  {
    id: 'amz_code_1',
    companyId: 'amazon',
    company: 'Amazon',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    category: 'Sliding Window / HashMap',
    description: `Given a string \`s\`, find the length of the **longest substring** without duplicate characters.

### Example 1:
- **Input:** \`"abcabcbb"\`
- **Output:** \`3\` (The answer is "abc", with the length of 3)

### Example 2:
- **Input:** \`"bbbbb"\`
- **Output:** \`1\`

### Constraints:
- \`0 <= s.length <= 5 * 10^4\`
- Target Time Complexity: **O(N)** using Sliding Window.`,
    boilerplates: {
      javascript: `/**
 * Return length of the longest substring without duplicate characters.
 * @param {string} s
 * @return {number}
 */
function solution(s) {
  // Write your code here
  
}`,
      python: `def solution(s):
    # Return length of the longest substring without duplicate characters
    # Write your code here
    pass`,
      java: `public class Solution {
    public static int solution(String s) {
        // Return length of the longest substring without duplicate characters
        // Write your code here
        return 0;
    }
}`
    },
    solutions: {
      javascript: `function solution(s) {
  let maxLength = 0;
  let left = 0;
  const lastSeen = new Map();

  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    if (lastSeen.has(char) && lastSeen.get(char) >= left) {
      left = lastSeen.get(char) + 1;
    }
    lastSeen.set(char, right);
    maxLength = Math.max(maxLength, right - left + 1);
  }

  return maxLength;
}`,
      python: `def solution(s):
    max_len = 0
    left = 0
    last_seen = {}
    for right, char in enumerate(s):
        if char in last_seen and last_seen[char] >= left:
            left = last_seen[char] + 1
        last_seen[char] = right
        max_len = max(max_len, right - left + 1)
    return max_len`,
      java: `import java.util.HashMap;

public class Solution {
    public static int solution(String s) {
        int maxLen = 0, left = 0;
        HashMap<Character, Integer> map = new HashMap<>();
        for (int right = 0; right < s.length; right++) {
            char c = s.charAt(right);
            if (map.containsKey(c) && map.get(c) >= left) {
                left = map.get(c) + 1;
            }
            map.put(c, right);
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }
}`
    },
    testCases: [
      { input: '"abcabcbb"', expected: "3" },
      { input: '"bbbbb"', expected: "1" },
      { input: '"pwwkew"', expected: "3" }
    ],
    hints: [
      "Use two pointers (left and right) representing a sliding window.",
      "Store the most recent index of each character in a Hash Map to jump the left pointer forward."
    ]
  }
];

export function getCompanyMCQs(companyId) {
  if (!companyId || companyId === 'all') return COMPANY_MCQS;
  return COMPANY_MCQS.filter(q => q.companyId === companyId);
}

export function getCompanyCodingChallenges(companyId) {
  if (!companyId || companyId === 'all') return COMPANY_CODING_CHALLENGES;
  return COMPANY_CODING_CHALLENGES.filter(c => c.companyId === companyId);
}
