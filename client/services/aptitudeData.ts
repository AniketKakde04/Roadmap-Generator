
export const APTITUDE_DATA = {
    "number-system": {
        "chapter_title": "Number System",
        "source": "Quantitative Aptitude by R.S. Aggarwal",
        "sections": [
            {
                "heading": "I. Fundamental Concepts",
                "content": [
                    {
                        "term": "Numeral",
                        "definition": "In Hindu-Arabic system, we have ten digits: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9. A number is denoted by a group of digits, called a numeral."
                    },
                    {
                        "term": "Place Value (Local Value)",
                        "definition": "The value of a digit based on its position in the number.",
                        "example": "In 3254710, the place value of 5 is 50,000."
                    },
                    {
                        "term": "Face Value",
                        "definition": "The value of the digit itself, regardless of its position.",
                        "example": "In 3254710, the face value of 5 is 5."
                    }
                ]
            },
            {
                "heading": "II. Types of Numbers",
                "content": [
                    {
                        "term": "Natural Numbers",
                        "definition": "Counting numbers starting from 1. Set N = {1, 2, 3, 4...}"
                    },
                    {
                        "term": "Whole Numbers",
                        "definition": "All natural numbers plus 0. Set W = {0, 1, 2, 3...}"
                    },
                    {
                        "term": "Integers",
                        "definition": "Whole numbers and their negatives. Set Z = {..., -2, -1, 0, 1, 2...}"
                    },
                    {
                        "term": "Prime Numbers",
                        "definition": "A number greater than 1 having exactly two factors: 1 and itself.",
                        "examples": ["2", "3", "5", "7", "11", "13", "17", "19", "23", "29"]
                    },
                    {
                        "term": "Composite Numbers",
                        "definition": "Numbers greater than 1 that are not prime."
                    },
                    {
                        "term": "Co-Primes",
                        "definition": "Two numbers whose H.C.F is 1. Example: (2, 3), (8, 9)."
                    }
                ]
            },
            {
                "heading": "III. Tests of Divisibility",
                "rules": [
                    { "divisor": "2", "rule": "Unit digit is 0, 2, 4, 6, or 8." },
                    { "divisor": "3", "rule": "Sum of digits is divisible by 3." },
                    { "divisor": "4", "rule": "Number formed by last two digits is divisible by 4." },
                    { "divisor": "5", "rule": "Unit digit is 0 or 5." },
                    { "divisor": "8", "rule": "Number formed by last three digits is divisible by 8." },
                    { "divisor": "9", "rule": "Sum of digits is divisible by 9." },
                    { "divisor": "10", "rule": "Unit digit is 0." },
                    { "divisor": "11", "rule": "Difference between sum of digits at odd places and sum of digits at even places is 0 or divisible by 11." }
                ]
            },
            {
                "heading": "IV. Important Algebraic Formulas",
                "formulas": [
                    "(a + b)² = a² + b² + 2ab",
                    "(a - b)² = a² + b² - 2ab",
                    "(a + b)² + (a - b)² = 2(a² + b²)",
                    "(a + b)² - (a - b)² = 4ab",
                    "(a + b)³ = a³ + b³ + 3ab(a + b)",
                    "(a - b)³ = a³ - b³ - 3ab(a - b)",
                    "a² - b² = (a + b)(a - b)",
                    "a³ + b³ = (a + b)(a² - ab + b²)",
                    "a³ - b³ = (a - b)(a² + ab + b²)"
                ]
            }
        ]
    },
    "average": {
        "chapter_title": "Average",
        "source": "Quantitative Aptitude by R.S. Aggarwal",
        "sections": [
            {
                "heading": "I. Basic Formula",
                "definition": "Average = (Sum of observations) / (Number of observations)",
                "derived_formulas": [
                    "Sum of observations = Average × Number of observations",
                    "Number of observations = (Sum of observations) / Average"
                ]
            },
            {
                "heading": "II. Average Speed",
                "definition": "If a person covers a certain distance at x km/hr and an equal distance at y km/hr, the average speed for the whole journey is not (x+y)/2.",
                "formula": "Average Speed = (2xy) / (x + y) km/hr"
            },
            {
                "heading": "III. Important Concepts",
                "points": [
                    "If the average of n quantities is x, and a constant A is added to each quantity, the new average becomes (x + A).",
                    "If the average of n quantities is x, and each quantity is multiplied by A, the new average becomes (Ax).",
                    "Average of first n natural numbers = (n + 1) / 2",
                    "Average of first n even numbers = (n + 1)",
                    "Average of first n odd numbers = n"
                ]
            }
        ]
    },
    "decimal-fractions": {
        "chapter_title": "Decimal Fractions",
        "source": "Quantitative Aptitude by R.S. Aggarwal",
        "sections": [
            {
                "heading": "I. Basic Concepts",
                "content": [
                    {
                        "term": "Decimal Fractions",
                        "definition": "Fractions in which denominators are powers of 10. (e.g., 1/10 = 0.1, 1/100 = 0.01)"
                    },
                    {
                        "term": "Conversion to Vulgar Fraction",
                        "rule": "Put 1 in the denominator under the decimal point and annex with it as many zeros as is the number of digits after the decimal point. Remove the decimal point from the numerator."
                    }
                ]
            },
            {
                "heading": "II. Operations on Decimal Fractions",
                "operations": [
                    {
                        "name": "Addition and Subtraction",
                        "rule": "Arrange the numbers so that the decimal points lie in the same vertical line. Add or subtract as per ordinary integer rules."
                    },
                    {
                        "name": "Multiplication",
                        "rule": "Multiply without decimal points. In the product, mark the decimal point to have as many decimal places as the sum of decimal places in the given numbers."
                    },
                    {
                        "name": "Division",
                        "rule": "Divide as ordinary numbers. Shift the decimal point in the quotient: (Decimal places in dividend) - (Decimal places in divisor)."
                    }
                ]
            },
            {
                "heading": "III. Recurring Decimals",
                "content": [
                    {
                        "term": "Pure Recurring Decimal",
                        "definition": "A decimal in which all the figures after the decimal point repeat.",
                        "conversion_rule": "Write the repeated figures as the numerator and put as many 9s in the denominator as the number of repeating figures.",
                        "example": "0.555... = 5/9; 0.5353... = 53/99"
                    },
                    {
                        "term": "Mixed Recurring Decimal",
                        "definition": "A decimal in which some figures do not repeat and some repeat.",
                        "conversion_rule": "Numerator = (Number formed by all digits after decimal) - (Number formed by non-repeating digits). Denominator = As many 9s as repeating digits followed by as many 0s as non-repeating digits.",
                        "example": "0.1666... = (16 - 1) / 90 = 15/90 = 1/6"
                    }
                ]
            }
        ]
    },
    "hcf-lcm": {
        "chapter_title": "H.C.F. and L.C.M. of Numbers",
        "source": "Quantitative Aptitude by R.S. Aggarwal",
        "sections": [
            {
                "heading": "I. Factors and Multiples",
                "content": [
                    {
                        "term": "Factor",
                        "definition": "If a number 'a' divides another number 'b' exactly, we say that 'a' is a factor of 'b'."
                    },
                    {
                        "term": "Multiple",
                        "definition": "If 'a' is a factor of 'b', then 'b' is a multiple of 'a'."
                    }
                ]
            },
            {
                "heading": "II. Highest Common Factor (H.C.F.)",
                "definition": "The greatest number which divides each of the two or more numbers exactly. Also known as Greatest Common Measure (G.C.M.) or Greatest Common Divisor (G.C.D.).",
                "methods": [
                    {
                        "name": "Factorization Method",
                        "steps": "Express each number as the product of prime factors. The product of the LEAST powers of common prime factors gives H.C.F."
                    },
                    {
                        "name": "Division Method",
                        "steps": "Divide the larger number by the smaller one. Then divide the divisor by the remainder. Repeat until remainder is 0. The last divisor is the H.C.F."
                    }
                ]
            },
            {
                "heading": "III. Least Common Multiple (L.C.M.)",
                "definition": "The least number which is exactly divisible by each one of the given numbers.",
                "methods": [
                    {
                        "name": "Factorization Method",
                        "steps": "Express each number as the product of prime factors. The product of HIGHEST powers of all factors gives L.C.M."
                    }
                ]
            },
            {
                "heading": "IV. Key Formulas",
                "content": [
                    {
                        "formula": "Product of two numbers = H.C.F. × L.C.M.",
                        "note": "This applies only to two numbers."
                    },
                    {
                        "formula": "H.C.F. of Fractions",
                        "equation": "(H.C.F. of Numerators) / (L.C.M. of Denominators)"
                    },
                    {
                        "formula": "L.C.M. of Fractions",
                        "equation": "(L.C.M. of Numerators) / (H.C.F. of Denominators)"
                    },
                    {
                        "formula": "H.C.F. of Decimals",
                        "steps": "Make same number of decimal places in all numbers. Find H.C.F. as if they are integers. Mark decimal point in result."
                    }
                ]
            }
        ]
    },
    "problems-on-ages": {
        "chapter_title": "Problems on Ages",
        "source": "Quantitative Aptitude by R.S. Aggarwal",
        "sections": [
            {
                "heading": "I. Basic Logic",
                "description": "If the present age of a person is x years:",
                "rules": [
                    "Age after t years = (x + t) years",
                    "Age t years ago = (x - t) years",
                    "Age n times the present age = nx years"
                ]
            },
            {
                "heading": "II. Ratio Problems",
                "description": "If the ages of A and B are in the ratio a:b, then:",
                "method": "Assume their ages are 'ax' and 'bx'. Use the given condition to solve for x."
            },
            {
                "heading": "III. Important Tips",
                "points": [
                    "The difference in age between two persons REMAINS CONSTANT throughout life.",
                    "If A is older than B by 5 years today, A will still be older than B by 5 years after 50 years.",
                    "Always try to form a linear equation in one variable (x) to solve easier problems."
                ]
            }
        ]
    },
    "problems-on-numbers": {
        "chapter_title": "Problems on Numbers",
        "source": "Quantitative Aptitude by R.S. Aggarwal",
        "sections": [
            {
                "heading": "I. Algebraic Representation",
                "description": "Solving word problems requires translating text into algebraic equations.",
                "translations": [
                    { "text": "A number is x", "math": "x" },
                    { "text": "A number exceeds another by x", "math": "A - B = x" },
                    { "text": "Sum of two numbers is x", "math": "A + B = x" },
                    { "text": "Difference of two numbers is x", "math": "A - B = x" }
                ]
            },
            {
                "heading": "II. Two-Digit Numbers",
                "description": "If a number has two digits, let the tens digit be x and unit digit be y.",
                "formulas": [
                    "The number = 10x + y",
                    "Number obtained by reversing the digits = 10y + x",
                    "Sum of digits = x + y"
                ]
            },
            {
                "heading": "III. Three-Digit Numbers",
                "description": "Let hundreds digit be x, tens digit be y, and unit digit be z.",
                "formulas": [
                    "The number = 100x + 10y + z"
                ]
            }
        ]
    },
    "simplification": {
        "chapter_title": "Simplification",
        "source": "Quantitative Aptitude by R.S. Aggarwal",
        "sections": [
            {
                "heading": "I. BODMAS Rule",
                "definition": "Defines the correct sequence of operations.",
                "sequence": [
                    { "letter": "B", "meaning": "Brackets" },
                    { "letter": "O", "meaning": "Of" },
                    { "letter": "D", "meaning": "Division" },
                    { "letter": "M", "meaning": "Multiplication" },
                    { "letter": "A", "meaning": "Addition" },
                    { "letter": "S", "meaning": "Subtraction" }
                ]
            },
            {
                "heading": "II. Order of Brackets",
                "description": "Brackets must be removed in this strict order:",
                "order": [
                    { "name": "Vinculum or Bar Bracket", "symbol": "—" },
                    { "name": "Circular Brackets or Parentheses", "symbol": "()" },
                    { "name": "Curly Brackets or Braces", "symbol": "{}" },
                    { "name": "Square Brackets", "symbol": "[]" }
                ]
            },
            {
                "heading": "III. Modulus of a Real Number",
                "definition": "Modulus of a real number 'a' is defined as:",
                "rules": [
                    "|a| = a, if a > 0",
                    "|a| = -a, if a < 0",
                    "|a| = 0, if a = 0"
                ],
                "example": "|-5| = 5 and |5| = 5"
            },
            {
                "heading": "IV. Virnaculum (Bar Bracket)",
                "rule": "When an expression contains a Virnaculum, before applying BODMAS, we simplify the expression under the Virnaculum.",
                "example": "In the expression 5 - [2 + {3 - (4 - 2)}], (4-2) should be solved first if it had a bar over it."
            }
        ]
    },
    "square-cube-roots": {
        "chapter_title": "Square Roots and Cube Roots",
        "source": "Quantitative Aptitude by R.S. Aggarwal",
        "sections": [
            {
                "heading": "I. Square Root",
                "definition": "The square root of a number x is that number which when multiplied by itself gives x as the product. It is denoted by √x.",
                "methods": [
                    {
                        "name": "Prime Factorization Method",
                        "steps": "1. Express the given number as the product of prime factors.\n2. Arrange the factors in pairs of equal prime factors.\n3. Take the product of one factor from each pair."
                    },
                    {
                        "name": "Division Method",
                        "steps": "Used for large numbers. Group digits in pairs from right to left. Find the largest number whose square is less than or equal to the first pair/digit."
                    }
                ]
            },
            {
                "heading": "II. Cube Root",
                "definition": "The cube root of a given number x is the number whose cube is x. It is denoted by ∛x.",
                "method": "Resolve the number into prime factors. Make groups of three equal factors. Take the product of one factor from each group."
            },
            {
                "heading": "III. Important Properties",
                "points": [
                    "A number ending with 2, 3, 7 or 8 is NEVER a perfect square.",
                    "The number of zeros at the end of a perfect square is always even.",
                    "Square of an even number is always even; Square of an odd number is always odd.",
                    "√xy = √x * √y",
                    "√(x/y) = √x / √y"
                ]
            }
        ]
    },
    "chain-rule": {
        "chapter_title": "Chain Rule",
        "source": "Quantitative Aptitude by R.S. Aggarwal",
        "sections": [
            {
                "heading": "I. Direct Proportion",
                "definition": "Two quantities are directly proportional if on the increase of one, the other increases to the same extent.",
                "examples": [
                    "More articles, more cost.",
                    "More men, more work."
                ]
            },
            {
                "heading": "II. Indirect Proportion",
                "definition": "Two quantities are indirectly proportional if on the increase of one, the other decreases to the same extent.",
                "examples": [
                    "More men, less time taken to finish work.",
                    "More speed, less time taken to cover distance."
                ]
            },
            {
                "heading": "III. Compound Proportion Formula",
                "formula": "(M1 × D1 × H1) / W1 = (M2 × D2 × H2) / W2",
                "legend": "M = Men, D = Days, H = Hours, W = Work"
            }
        ]
    },
    "percentage": {
        "chapter_title": "Percentage",
        "source": "Quantitative Aptitude by R.S. Aggarwal",
        "sections": [
            {
                "heading": "I. Concept of Percentage",
                "definition": "By a certain percent, we mean that many hundredths.",
                "formula": "x% = x / 100",
                "examples": [
                    "20% = 20/100 = 1/5",
                    "48% = 48/100 = 12/25"
                ]
            },
            {
                "heading": "II. Increase and Decrease",
                "rules": [
                    "If a value P increases by x%, new value = (100 + x)% of P",
                    "If a value P decreases by x%, new value = (100 - x)% of P"
                ]
            },
            {
                "heading": "III. Results on Population",
                "description": "Let population of a town be P now and it increases at the rate of R% per annum.",
                "formulas": [
                    "Population after n years = P(1 + R/100)^n",
                    "Population n years ago = P / (1 + R/100)^n"
                ]
            },
            {
                "heading": "IV. Results on Depreciation",
                "description": "Let present value of a machine be P and it depreciates at the rate of R% per annum.",
                "formulas": [
                    "Value of machine after n years = P(1 - R/100)^n",
                    "Value of machine n years ago = P / (1 - R/100)^n"
                ]
            }
        ]
    },
    "pipes-cisterns": {
        "chapter_title": "Pipes and Cisterns",
        "source": "Quantitative Aptitude by R.S. Aggarwal",
        "sections": [
            {
                "heading": "I. Basic Definitions",
                "terms": [
                    { "name": "Inlet", "description": "A pipe connected with a tank/cistern that fills it." },
                    { "name": "Outlet", "description": "A pipe connected with a tank/cistern that empties it." }
                ]
            },
            {
                "heading": "II. Work Formulas",
                "rules": [
                    "If a pipe can fill a tank in x hours, part filled in 1 hour = 1/x.",
                    "If a pipe can empty a tank in y hours, part emptied in 1 hour = 1/y.",
                    "If a pipe fills in x hours and another empties in y hours (where y > x), net part filled in 1 hour = (1/x) - (1/y).",
                    "If a pipe fills in x hours and another empties in y hours (where x > y), net part emptied in 1 hour = (1/y) - (1/x)."
                ]
            }
        ]
    },
    "profit-loss": {
        "chapter_title": "Profit and Loss",
        "source": "Quantitative Aptitude by R.S. Aggarwal",
        "sections": [
            {
                "heading": "I. Basic Terms",
                "definitions": [
                    { "term": "Cost Price (C.P.)", "meaning": "The price at which an article is purchased." },
                    { "term": "Selling Price (S.P.)", "meaning": "The price at which an article is sold." },
                    { "term": "Profit or Gain", "meaning": "If S.P. > C.P., the seller has a profit." },
                    { "term": "Loss", "meaning": "If S.P. < C.P., the seller incurs a loss." }
                ]
            },
            {
                "heading": "II. Fundamental Formulas",
                "formulas": [
                    "Gain = S.P. - C.P.",
                    "Loss = C.P. - S.P.",
                    "Gain % = (Gain / C.P.) × 100",
                    "Loss % = (Loss / C.P.) × 100",
                    "S.P. = ((100 + Gain%) / 100) × C.P.",
                    "S.P. = ((100 - Loss%) / 100) × C.P.",
                    "C.P. = (100 / (100 + Gain%)) × S.P.",
                    "C.P. = (100 / (100 - Loss%)) × S.P."
                ]
            },
            {
                "heading": "III. Special Case",
                "rule": "If a man sells two similar items, one at a gain of x% and another at a loss of x%, then the seller ALWAYS incurs a loss.",
                "formula": "Loss % = (x / 10)^2"
            }
        ]
    },
    "surds-indices": {
        "chapter_title": "Surds and Indices",
        "source": "Quantitative Aptitude by R.S. Aggarwal",
        "sections": [
            {
                "heading": "I. Laws of Indices",
                "formulas": [
                    "a^m × a^n = a^(m + n)",
                    "a^m / a^n = a^(m - n)",
                    "(a^m)^n = a^(mn)",
                    "(ab)^n = a^n * b^n",
                    "(a/b)^n = a^n / b^n",
                    "a^0 = 1"
                ]
            },
            {
                "heading": "II. Surds",
                "definition": "Let 'a' be a rational number and 'n' be a positive integer such that a^(1/n) is irrational. Then a^(1/n) is called a surd of order n.",
                "laws": [
                    "n√a = a^(1/n)",
                    "n√(ab) = n√a × n√b",
                    "n√(a/b) = n√a / n√b",
                    "(n√a)^n = a",
                    "m√(n√a) = mn√a",
                    "(n√a)^m = n√(a^m)"
                ]
            }
        ]
    },
    "time-distance": {
        "chapter_title": "Time and Distance",
        "source": "Quantitative Aptitude by R.S. Aggarwal",
        "sections": [
            {
                "heading": "I. Basic Formulas",
                "formulas": [
                    "Speed = Distance / Time",
                    "Time = Distance / Speed",
                    "Distance = Speed × Time"
                ]
            },
            {
                "heading": "II. Unit Conversion",
                "rules": [
                    "x km/hr = (x × 5/18) m/sec",
                    "x m/sec = (x × 18/5) km/hr"
                ]
            },
            {
                "heading": "III. Average Speed",
                "rule": "If a man covers a certain distance at x km/hr and an equal distance at y km/hr, the average speed for the whole journey is:",
                "formula": "Average Speed = (2xy) / (x + y) km/hr"
            },
            {
                "heading": "IV. Ratio of Speeds",
                "rule": "If ratio of speeds of A and B is a:b, then ratio of times taken to cover the same distance is 1/a : 1/b or b:a."
            }
        ]
    },
    "time-work": {
        "chapter_title": "Time and Work",
        "source": "Quantitative Aptitude by R.S. Aggarwal",
        "sections": [
            {
                "heading": "I. Fundamental Concepts",
                "rules": [
                    "If A can do a piece of work in n days, then A's 1 day's work = 1/n.",
                    "If A's 1 day's work = 1/n, then A can finish the work in n days.",
                    "If A is thrice as good a workman as B, then ratio of work done by A:B = 3:1, and ratio of time taken by A:B = 1:3."
                ]
            },
            {
                "heading": "II. Efficiency Rule",
                "definition": "Time taken is inversely proportional to efficiency (work rate). More efficient workers take less time."
            }
        ]
    },

} as const;
