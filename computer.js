
const args = process.argv.slice(2);
if (args.length !== 1) {
    console.log("Error: Please provide a single argument");
    process.exit(1);
}

function transformEquation(equation) {
    const [lhs, rhs, err] = equation.split('=').map(part => part.trim());
    if (!lhs || !rhs || err) {
        console.log("Error: Invalid equation format");
        process.exit(1);
    }
    const lhsTerms = lhs?.split(/(?=[+-])/).map(term => term.replace(/\s+/g, ' ').trim());
    const rhsTerms = rhs?.split(/(?=[+-])/).map(term => term.replace(/\s+/g, ' ').trim());


    const negatedRhsTerms = rhsTerms?.map(term => {

        return term.startsWith('-') ? `+${term.slice(1).trim()}` :
            term.startsWith('+') ? `-${term.slice(1).trim()}` :
                `-${term.trim()}`;
    });


    const combinedTerms = [...lhsTerms, ...negatedRhsTerms];
    const termMap = {};
    combinedTerms.forEach(term => {
        const match = term.match(/([+-]?)\s*(\d*\.?\d*)\s*\*?\s*([X]\^\d+|[X])/);
        if (match) {
            const sign = match[1] === '-' ? -1 : 1;
            const coefficient = match[2] ? parseFloat(match[2]) : 1;
            const variable = match[3];
            if (coefficient !== 0) {
                if (termMap[variable]) {
                    termMap[variable] += sign * coefficient;
                    if (termMap[variable] === 0) {
                        delete termMap[variable];
                    }
                } else {
                    termMap[variable] = sign * coefficient;
                }
            }
        }
    });

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
    let x = value;
    let y = 1;
    while (x - y > 0) {
        x = (x + y) / 2;
        y = value / x;
    }
    return x;
}


function solveEquation(reducedForm) {
    if (reducedForm.length === 0) {
        console.log(0);
        return;
    }
    const coefficients = { 'X^0': 0, 'X^1': 0, 'X^2': 0 };
    reducedForm.forEach(term => {
        const match = term.match(/([+-]?)\s*(\d*\.?\d*)\s*\*\s*(X\^\d+)/);

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

        if (discriminant > 0) {
            const sqrtDiscriminant = customSqrt(discriminant);
            const root1 = (-b - sqrtDiscriminant) / (2 * a);
            const root2 = (-b + sqrtDiscriminant) / (2 * a);
            console.log("Discriminant is strictly positive, the two solutions are:");
            console.log(parseFloat(root1.toFixed(6)));
            console.log(parseFloat(root2.toFixed(6)));
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
        console.log(parseFloat(root.toFixed(6)));
    } else {
        console.log("No valid equation to solve.");
    }
}

const reducedForm = transformEquation(args[0]);
const reducedFormString = reducedForm?.join(' ').replace(/\s+/g, ' ').trim() || "0";
console.log(`Reduced form: ${reducedFormString} = 0`);

const degree = checkDegree(reducedForm);
console.log(`Polynomial degree: ${degree}`);
solveEquation(reducedForm);