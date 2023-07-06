interface Input<T> {
    accept(value: T): void;
}

export class Flow<I, O> implements Input<I> {
    mapper: (v: I) => O | null
    outputs: Input<O>[]

    constructor(mapper: (v: I) => O | null) {
        this.mapper = mapper
        this.outputs = new Array()
    }

    public accept(value: I) {
        let result = this.mapper(value)
        if (result != null) {
            for (let output of this.outputs) {
                output.accept(result)
            }
        }
    }

    public acceptMany(values: Iterable<I>) {
        for (let value of values) {
            this.accept(value);
        }
    }

    private attach(input: Input<O>) {
        this.outputs.push(input)
    }

    public map<V>(mapper: (v: O) => V | null): Flow<O, V> {
        let mappedFlow = new Flow(mapper)
        this.attach(mappedFlow)
        return mappedFlow
    }

    public filter(filter: (v: O) => boolean): Flow<O, O> {
        let filterFlow = new Flow((v: O) => filter(v) ? v : null)
        this.attach(filterFlow)
        return filterFlow
    }

    public peep(observer: (v: O) => void): Flow<O, O> {
        let observedFlow = new Flow((v: O) => {
            observer(v)
            return v
        })
        this.attach(observedFlow)
        return observedFlow
    }

    public collect(): O[] {
        var collected = new Array()
        this.collectTo(collected)
        return collected
    }

    public collectTo(to: O[]): void {
        this.attach(new Flow((v: O) => to.push(v)))
    }

    public segregate<C>(
        classify: (v: O) => C[],
        classes: C[],
        withUnclassified: boolean = false
    ): Flow<O, O>[] {
        let classificator = new Classificator(classify, classes, withUnclassified)
        this.attach(classificator)
        return classificator.flows
    }

    public select<S>(selector: (v: O) => Iterable<S>): Flow<S, S> {
        let s = new Selector(selector)
        this.attach(s)
        return s.flow
    }

    public static start<T>(): Flow<T, T> {
        return new Flow((v: T) => v)
    }
}

class Classificator<V, C> implements Input<V> {
    classify: (v: V) => C[]
    flowMap: Map<C, Flow<V, V>>
    unclassified: Flow<V, V> | null
    public flows: Flow<V, V>[]

    constructor(classify: (v: V) => C[], classes: C[], withUnclassified: boolean = false) {
        this.classify = classify

        this.flows = new Array()
        this.flowMap = new Map()

        for (let class_ of classes) {
            let classFlow = Flow.start<V>()
            this.flows.push(classFlow)
            this.flowMap.set(class_, classFlow)
        }

        this.unclassified = withUnclassified ? Flow.start<V>() : null
        if (this.unclassified != null) {
            this.flows.push(this.unclassified)
        }
    }

    private findFlows(classes: C[]): Flow<V, V>[] {
        let flows: Flow<V, V>[] = Array()

        for (let class_ of classes) {
            if (this.flowMap.has(class_)) {
                flows.push(this.flowMap.get(class_)!)
            }
        }
        if (flows.length == 0 && this.unclassified != null) {
            flows.push(this.unclassified)
        }

        return flows
    }

    accept(value: V): void {
        for (let flow of this.findFlows(this.classify(value))) {
            flow.accept(value)
        }
    }
}

class Selector<I, O> implements Input<I> {
    flow: Flow<O, O> = Flow.start<O>()
    selector: (v: I) => Iterable<O>

    constructor(selector: (v: I) => Iterable<O>) {
        this.selector = selector
    }

    accept(value: I): void {
        this.flow.acceptMany(this.selector(value))
    }
}
