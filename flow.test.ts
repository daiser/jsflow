import { describe, expect, test } from '@jest/globals';
import { Flow } from './flow';

describe('flow', () => {
    test(
        'accept-and-peep',
        () => {
            // cooking
            var lastValue: string;
            let f = Flow.start<string>()
            f.peep((v: string) => { lastValue = v })

            // running
            f.accept("some-value")

            // cheking
            expect(lastValue!).toBe("some-value")
        }
    )

    test(
        'accept-many',
        () => {
            // cooking
            let f = Flow.start<number>()
            let passed = f.collect()

            // running
            f.acceptMany([1, 2, 3, 4, 5])

            // checking
            expect(passed).toStrictEqual([1, 2, 3, 4, 5])
        }
    )

    test(
        'collect',
        () => {
            let f = Flow.start<string>()
            let strings = f.collect()

            f.acceptMany(["1", "2", "3"])
            expect(strings).toStrictEqual(["1", "2", "3"])
        }
    )

    test(
        'collectTo',
        () => {
            let f = Flow.start<string>()
            let strings = new Array()
            f.collectTo(strings)

            f.acceptMany(["1", "2", "3"])
            expect(strings).toStrictEqual(["1", "2", "3"])
        }
    )

    test(
        'filter',
        () => {
            // cooking
            let f = Flow.start<number>()
            let lessThan5 = f.filter((v) => v < 5).collect()

            // running
            f.acceptMany([1, 2, 3, 4, 5, 6, 7, 8, 9])

            // checking
            expect(lessThan5).toStrictEqual([1, 2, 3, 4])
        }
    )

    test(
        'map',
        () => {
            // cooking
            let f = Flow.start<number>()
            let strings = f.map((v) => "" + v).collect()

            // running
            f.acceptMany([1, 2, 3, 4, 5])

            // checking
            expect(strings).toStrictEqual(["1", "2", "3", "4", "5"])
        }
    )

    test(
        'select',
        () => {
            // cooking
            let f = Flow.start<string>()
            let filesystem = {
                "folder1": ["file1", "file2"],
                "folder2": ["file3", "file4"],
            }
            let files = f.select((folder) => filesystem[folder]).collect()

            // running
            f.accept("folder1")
            f.accept("folder2")

            // checking
            expect(files).toStrictEqual(["file1", "file2", "file3", "file4"])
        }
    )

    test(
        'segregate-no-unclassified',
        () => {
            // cooking
            let f = Flow.start<number>()
            const classify = (n: number): string[] => {
                return (n % 2) == 0 ? ["even"] : ["odd"]
            }
            let [even, odd] = f.segregate(classify, ["even", "odd"])
            let evens = even.collect()
            let odds = odd.collect()

            // running
            f.acceptMany([1, 2, 3, 4, 5, 6, 7, 8, 9])

            // checking
            expect(evens).toStrictEqual([2, 4, 6, 8])
            expect(odds).toStrictEqual([1, 3, 5, 7, 9])
        }
    )

    test(
        'segregate-unclassified',
        () => {
            // cooking
            let f = Flow.start<number>()
            const classify = (n: number): string[] => {
                let classes = new Array()
                for (let i = 2; i < 10; i++) {
                    if (n % i == 0) {
                        classes.push("div" + i)
                    }
                }
                return classes
            }
            let [div7, other] = f.segregate(classify, ["div7"], true)
            let div7s = div7.collect()
            let others = other.collect()

            // running
            for (let n = 1; n <= 50; n++) {
                f.accept(n)
            }

            // checking
            expect(div7s).toStrictEqual([7, 14, 21, 28, 35, 42, 49])
            expect(others).toHaveLength(43)
        }
    )
})
