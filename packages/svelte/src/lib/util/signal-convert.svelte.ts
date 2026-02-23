import { effect, Injector } from 'static-injector';
import { InjectorToken } from '../token';
import { getContext } from 'svelte';

export function signalToState<T>(value: () => T | undefined) {
	const injector = getContext<() => Injector>(InjectorToken)!;
	let dataRef = $state.raw<T | undefined>(undefined as any);
	$effect.pre(() => {
		dataRef = value();
		const ref = effect(
			() => {
				const currentValue = value();
				if (!Object.is(dataRef, currentValue)) {
					dataRef = currentValue;
				}
			},
			{ injector: injector() }
		);
		return () => {
			ref.destroy();
		};
	});
	return () => dataRef;
}
