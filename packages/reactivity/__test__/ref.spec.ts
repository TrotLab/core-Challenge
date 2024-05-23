import { effect, isRef, proxyRefs, reactive, ref, unRef } from '../src'

describe('ref', () => {
	it('happy path', () => {
		const a = ref(1)
		expect(a.value).toBe(1)
	})

	it('should be reactive', () => {
		const a = ref(1)
		let dummy
		let calls = 0
		effect(() => {
			calls++
			dummy = a.value
		})

		// effect should be called when it init
		expect(calls).toBe(1)
		expect(dummy).toBe(1)

		a.value = 2
		expect(calls).toBe(2)
		expect(dummy).toBe(2)

		// same value should not trigger
		a.value = 2
		expect(calls).toBe(2)
		expect(dummy).toBe(2)
	})

	it('should make nested properties reactive', () => {
		const a = ref({
			count: 1,
		})
		let dummy
		effect(() => {
			dummy = a.value.count
		})

		expect(dummy).toBe(1)

		a.value.count = 2
		expect(dummy).toBe(2)
	})

	it('isRef', () => {
		const a = ref(1)
		const user = reactive({
			age: 1,
		})

		expect(isRef(a)).toBe(true)
		expect(isRef(1)).toBe(false)
		expect(isRef(user)).toBe(false)
	})

	it('unRef', () => {
		const a = ref(1)

		expect(unRef(a)).toBe(1)
		expect(unRef(1)).toBe(1)
	})

	it('proxyRefs', () => {
		const user = {
			age: ref(10),
			name: 'xiaohong',
		}

		const proxyUser = proxyRefs(user)
		expect(user.age.value).toBe(10)
		expect(proxyUser.age).toBe(10)
		expect(proxyUser.name).toBe('xiaohong')

		proxyUser.age = 20
		expect(proxyUser.age).toBe(20)
		expect(user.age.value).toBe(20)

		proxyUser.age = ref(10)
		expect(proxyUser.age).toBe(10)
		expect(user.age.value).toBe(10)
	})

	// https://cn.vuejs.org/guide/essentials/reactivity-fundamentals.html#ref-unwrapping-as-reactive-object-property
	it('should synchronize state.count with ref count and allow replacing with a new ref', () => {
		const count = ref(0)
		const state = reactive({
			count,
		})

		// Initial values
		expect(state.count).toBe(0)
		expect(count.value).toBe(0)

		// Modify state.count and ensure synchronization
		state.count = 1
		expect(state.count).toBe(1)
		expect(count.value).toBe(1)

		// Assign a new ref to state.count
		const otherCount = ref(2)
		state.count = otherCount
		expect(state.count).toBe(2)
		expect(count.value).toBe(1)

		// Modify the new ref and check synchronization
		otherCount.value = 3
		expect(state.count).toBe(3)
		expect(count.value).toBe(1)
	})

	it('happy path: should convert a normal value to ref', () => {
		const valueRef = toRef(1)
		expect(valueRef.value).toBe(1)
	})

	it('toRef getter', () => {
		const x = toRef(() => 1)
		expect(x.value).toBe(1)
		expect(isRef(x)).toBe(true)
		expect(unRef(x)).toBe(1)

		//@ts-expect-error
		expect(() => (x.value = 123)).toThrow()

		expect(isReadonly(x)).toBe(true)
	})

	it('toRef', () => {
		const a = reactive({
			x: 1,
		})
		const x = toRef(a, 'x')
		expect(isRef(x)).toBe(true)
		expect(x.value).toBe(1)

		a.x = 2
		expect(x.value).toBe(2)

		x.value = 3
		expect(a.x).toBe(3)

		let dummy
		effect(() => {
			dummy = x.value
		})
		expect(dummy).toBe(x.value)

		a.x = 4
		expect(dummy).toBe(4)

		// should keep ref
		const r = { x: ref(1) }
		expect(isRef(r, 'x')).toBe(r.x)
	})
})
