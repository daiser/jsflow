import { Flow } from "./flow";

const fizzbuzzer = (n: number): string[] => {
    if (n % 15 == 0) return ["fb"]
    if (n % 5 == 0) return ["f"]
    if (n % 3 == 0) return ["b"]
    return ["n"]
}

let numbers = Flow.start<number>()

let [fb, f, b, others] = numbers.segregate(fizzbuzzer, ["fb", "f", "b"], true)
fb.peep((v: number) => console.log("FizzBuzz"))
f.peep((v: number) => console.log("Fizz"))
b.peep((v: number) => console.log("Buzz"))
others.peep(console.log)

for (let i = 1; i <= 100; i++) {
    numbers.accept(i)
}
