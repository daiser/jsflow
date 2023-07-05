import { Flow } from "./flow"

const arrayRange = (start: number, stop: number, step: number = 1) =>
    Array.from(
        { length: (stop - start) / step + 1 },
        (value, index) => start + index * step
    );

const classify = (n: number): string[] => {
    let classes = new Array()

    classes.push(n % 2 == 0 ? "even" : "odd");

    for (let div of arrayRange(2, 9)) {
        if (n % div == 0) {
            classes.push("div" + div)
        }
    }

    return classes
}

let f = Flow.start<number>()

let [even, odd] = f.peep(console.log).segregate(classify, ["even", "odd"])
let evens = even.collect()
let odds = odd.collect()

f.acceptMany(arrayRange(1,100))

console.log("evens", evens, "odds", odds)
