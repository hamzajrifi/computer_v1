
const args = process.argv.slice(2);
if (args.length !== 1) {
    console.log("Error: Please provide a single argument");
    process.exit(1);
}

function transformEquation(equation) {
    // equation = equation.replace(/X\^0/g, '1');
    const [lhs, rhs] = equation.split('=').map(part => part.trim());

    const lhsTerms = lhs?.split(/(?=[+-])/).map(term => term.replace(/\s+/g, '').trim());
    const rhsTerms = rhs?.split(/(?=[+-])/).map(term => term.replace(/\s+/g, '').trim());


    const negatedRhsTerms = rhsTerms?.map(term => {

        return term.startsWith('-') ? `+${term.slice(1).trim()}` :
            term.startsWith('+') ? `-${term.slice(1).trim()}` :
                `-${term.trim()}`;
    });


    const combinedTerms = [...lhsTerms, ...negatedRhsTerms];
    const termMap = {};
    combinedTerms.forEach(term => {
        const match = term.match(/([+-]?)\s*(\d*\.?\d*)\s*\*?\s*([a-zA-Z]\^\d+|[a-zA-Z])/);
        console.log("match", match);
        if (match) {
            const sign = match[1] === '-' ? -1 : 1;
            const coefficient = match[2] ? parseFloat(match[2]) : 1;
            const variable = match[3];

            if (termMap[variable]) {
                termMap[variable] += sign * coefficient;
            } else {
                termMap[variable] = sign * coefficient;
            }
        }
    });
console.log("termMap", termMap);
    const simplifiedTerms = Object.entries(termMap).map(([variable, coefficient]) => {
        const sign = coefficient < 0 ? '-' : '+';
        const absCoefficient = coefficient < 0 ? -coefficient : coefficient;
        return `${sign} ${absCoefficient} * ${variable}`;
    });

    if (simplifiedTerms[0]?.startsWith('+')) {
        simplifiedTerms[0] = simplifiedTerms[0].slice(1).trim();
    }

    return simplifiedTerms;
}

function checkDegree(equation) {
    const degreeMatch = equation.join(' ').match(/X\^(\d+)/g);
    if (degreeMatch) {
        const degrees = degreeMatch.map(match => parseInt(match.split('^')[1]));
        const maxDegree = degrees.reduce((max, current) => (current > max ? current : max), degrees[0]);
        if (maxDegree > 2) {
            console.log(`Polynomial degree: ${maxDegree}`);
            console.log("The polynomial degree is strictly greater than 2, I can't solve.");
            process.exit(1);
        }
        return maxDegree;
    }
    return 0;
}


function customSqrt(value) {
    if (value < 0) return NaN;
    let x = value;
    let y = 1;
    const e = 0.000001; // precision level
    while (x - y > e) {
        x = (x + y) / 2;
        y = value / x;
    }
    return x;
}


function solveEquation(reducedForm) {
    if (reducedForm.length === 0) {
        console.log("The solution is:\n0");
        return;
    }
    console.log("------ ", reducedForm);
    const coefficients = { 'X^0': 0, 'X^1': 0, 'X^2': 0 };
    reducedForm.forEach(term => {
        const match = term.match(/([+-]?)\s*(\d*\.?\d*)\s*\*\s*(X\^\d+)/);
// console.log("match", match);
        if (match) {
            const sign = match[1] === '-' ? -1 : 1;
            const coefficient = match[2] ? parseFloat(match[2]) : 1;
            const variable = match[3];
            coefficients[variable] = sign * coefficient;
        }
    });

    const a = coefficients['X^2'];
    const b = coefficients['X^1'];
    const c = coefficients['X^0'];

    if (a !== 0) {
        const discriminant = b * b - 4 * a * c;
        console.log(`Discriminant: ${discriminant}`);
        if (discriminant > 0) {
            const sqrtDiscriminant = customSqrt(discriminant);
            const root1 = (-b + sqrtDiscriminant) / (2 * a);
            const root2 = (-b - sqrtDiscriminant) / (2 * a);
            console.log("Discriminant is strictly positive, the two solutions are:");
            console.log(root1);
            console.log(root2);
        } else if (discriminant === 0) {
            const root = -b / (2 * a);
            console.log("Discriminant is zero, the solution is:");
            console.log(root);
        } else {
            console.log("Discriminant is strictly negative, there are no real solutions.");
        }
    } else if (b !== 0) {
        const root = -c / b;
        console.log("The solution is:");
        console.log(root);
    } else {
        console.log("No valid equation to solve.");
    }
}


const reducedForm = transformEquation(args[0]);
const degree = checkDegree(reducedForm);


const reducedFormLength = reducedForm.join(' ').replace(/\s+/g, ' ').trim();
console.log(`Reduced form: ${reducedFormLength ? reducedForm?.join(' ').replace(/\s+/g, ' ').trim() : "0"} = 0`);
console.log(`Polynomial degree: ${degree}`);
solveEquation(reducedForm);



// ./computor "5 * X^0 + 4 * X^1 - 9.3 * X^2 = 1 * X^0"
// Reduced form: 4 * X^0 + 4 * X^1 - 9.3 * X^2 = 0
// Polynomial degree: 2
// Discriminant is strictly positive, the two solutions are:
// 0.905239
// -0.475131
// $>./computor "5 * X^0 + 4 * X^1 = 4 * X^0"
// Reduced form: 1 * X^0 + 4 * X^1 = 0
// Polynomial degree: 1
// The solution is:
// -0.25
// ./computor "8 * X^0 - 6 * X^1 + 0 * X^2 - 5.6 * X^3 = 3 * X^0"
// Reduced form: 5 * X^0 - 6 * X^1 + 0 * X^2 - 5.6 * X^3 = 0
// Polynomial degree: 3
// The polynomial degree is strictly greater than 2, I can't solve.