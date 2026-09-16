import * as v from 'valibot';
import { setComponent, typedFieldPipe, ɵtypedFieldActions } from '@piying/view-core';
import type {
	AnyOutputsHandlerMap,
	AsyncValueMap,
	CompAction,
	CompActionFactoriesOf,
	CompEntryAction,
	CompTables,
	FieldEntry,
	FieldPathsOf,
	KeyPath,
	PiCommonConfig,
	PiTypeConfig,
	TightenEmpty,
	UnwrapConfig
} from '@piying/view-core';
import type {
	ActionComponent,
	GetComponentInputs,
	GetComponentInputsOrigin,
	GetComponentOutputsHandlerMap,
	GetComponentOutputsOrigin,
	SvelteAttributeName,
	SvelteComponentKey
} from './component-types';

/**
 * 组件类型 -> 表。
 *
 * 这是 Svelte 侧唯一需要写的「读组件」逻辑:
 * 把组件 props 里的非函数 prop 与函数 prop 打包成 `CompTables` 的形状,
 * 之后骨架(工厂 / entry / outputChange)全在 core 里复用一份。
 *
 * Svelte 5 没有独立的双向绑定通道(bind:prop 在类型上就是普通 prop,
 * 运行时也不消费 field.models), 所以 models 两项直接置 never, 工厂那一侧一并摘掉。
 *
 * 推不出组件时落到宽松表: 降级不等于封死,
 * 根路径、props、hooks 等基础功能全部保留, 只是不再校验 key 名。
 */
type TablesOfComponent<C> = [C] extends [never]
	? {
			inputKeys: string;
			inputsOrigin: Record<string, any>;
			outputKeys: string;
			outputsOrigin: Record<string, (...args: any[]) => any>;
			outputsHandlerMap: AnyOutputsHandlerMap;
			modelKeys: never;
			modelsOrigin: never;
		}
	: {
			inputKeys: Extract<keyof GetComponentInputs<C>, string>;
			inputsOrigin: TightenEmpty<GetComponentInputsOrigin<C>>;
			outputKeys: Extract<keyof GetComponentOutputsHandlerMap<C>, string>;
			outputsOrigin: TightenEmpty<GetComponentOutputsOrigin<C>>;
			outputsHandlerMap: GetComponentOutputsHandlerMap<C>;
			modelKeys: never;
			modelsOrigin: never;
		};

/**
 * attributes 工厂: key 收在「标准 HTML 属性名 ∪ 任意自定义名」上。
 *
 * Svelte 的 attributes 最终也是 spread 成 props 落到根元素上,
 * 所以标准名直接取自 svelte/elements 的 HTMLAttributes(摘掉 onXxx), 值仍保持宽松。
 */
export interface TypedAttributesActionsFactory<AttrName extends string> {
	patch: <F, T extends CompTables = CompTables>(
		value: Partial<Record<AttrName, any>>
	) => CompAction<F, T>;
	set: <F, T extends CompTables = CompTables>(
		value: Partial<Record<AttrName, any>>
	) => CompAction<F, T>;
	patchAsync: <
		F,
		T extends CompTables = CompTables,
		Data extends AsyncValueMap<Partial<Record<AttrName, any>>, F> = AsyncValueMap<
			Partial<Record<AttrName, any>>,
			F
		>
	>(
		dataObj: Data
	) => CompAction<F, T>;
	remove: <F, T extends CompTables = CompTables>(list: AttrName[]) => CompAction<F, T>;
	mapAsync: <F, T extends CompTables = CompTables>(
		fn: (field: F) => (value: Partial<Record<AttrName, any>>) => any
	) => CompAction<F, T>;
	top: {
		set: <F, T extends CompTables = CompTables>(
			value: Partial<Record<AttrName, any>>
		) => CompAction<F, T>;
		patch: <F, T extends CompTables = CompTables>(
			value: Partial<Record<AttrName, any>>
		) => CompAction<F, T>;
	};
}

/**
 * 组件版 action 工厂集合。
 *
 * `Tables` 只当配对通道上的上界, 真正生效的表由 entry 的期望元素类型反推,
 * 所以这里直接复用 core 的骨架。
 * Svelte 侧额外摘掉 `models`(运行时不消费) 与 `attributes`(换成 HTML 名约束)。
 */
export type TypedComponentActionFactories<Cfg = unknown> = Omit<
	CompActionFactoriesOf<CompTables, Cfg>,
	'models' | 'attributes'
> & {
	attributes: TypedAttributesActionsFactory<SvelteAttributeName>;
};

/** 可用的组件标识: 配置里注册的类型 key, 直接传组件, 或者直接传懒加载函数 */
export type ComponentKeyOf<Cfg> = keyof TypesOfKey<Cfg> | SvelteComponentKey;

type TypesOfKey<Cfg> = NonNullable<Cfg extends { types?: infer T } ? T : never>;

/** 能不能从配置项里解析出组件: 直接给 type(含懒加载), 要么给了非空 actions */
type IsComponentLike<A> = A extends { type: SvelteComponentKey }
	? true
	: A extends { actions: readonly [any, ...any[]] }
		? true
		: false;

/**
 * 由组件标识解析出真正的组件类型。
 *
 * 解析不出组件时落到 never 而不是 any:
 * `any` 会让后续 input/output 的 key 约束整体静默失效。
 */
export type ComponentOf<Cfg, K> = K extends keyof TypesOfKey<Cfg>
	? IsComponentLike<TypesOfKey<Cfg>[K]> extends true
		? ActionComponent<Extract<TypesOfKey<Cfg>[K], PiTypeConfig<any, any>>>
		: never
	: K;

/**
 * 定义单条 entry: 路径 + 组件 + 该路径下的 actions。
 *
 * - 路径 P 由第一个实参推断, 组件 K 由第二个实参推断;
 * - 组件先翻成表再进 `CompEntryAction`, 工厂侧靠 `CompAction` 的配对通道拿到同一张表,
 *   所以 `d.inputs.patchAsync({...})` 的 key/值类型依旧由这条 entry 的组件决定。
 */
export type DefineComponentEntry<
	Root extends v.BaseSchema<any, any, any>,
	Cfg
> = TypedComponentActionFactories<Cfg> & {
	<P extends FieldPathsOf<Root>, K extends ComponentKeyOf<Cfg>>(
		path: [...P],
		component: K,
		actions: readonly CompEntryAction<Root, P, TablesOfComponent<ComponentOf<Cfg, K>>>[]
	): FieldEntry;
};

/**
 * typedFieldPipe + 组件类型约束的组合形态。
 *
 * 按「路径 + 组件」写配置:
 * - 回调里的 field 与 `builder.get(path)` 类型完全等价, 可以直接 get;
 * - `d.inputs` 的 key 来自组件的非函数 props, `d.outputs` 的 key 来自函数 props。
 *
 * 每条 entry 都会下发 `setComponent(component)`, 保证「校验用的类型」就是「真正渲染的组件」。
 * 不需要组件类型时, 直接用 `typedFieldPipe`。
 *
 * 注意: 必须使用返回值, 原 schema 不被修改。
 */
export function typedFieldComponentPipe<
	S extends v.BaseSchema<any, any, any>,
	C extends PiCommonConfig | { define: PiCommonConfig }
>(
	schema: S,
	// 只参与类型推断, 运行时不需要配置
	_config: C,
	cb: (define: DefineComponentEntry<S, UnwrapConfig<C>>) => readonly FieldEntry[]
): S {
	const define = Object.assign(
		(path: KeyPath, component: any, actions: readonly any[]): FieldEntry => ({
			path,
			actions: [setComponent(component), ...(actions ?? [])]
		}),
		ɵtypedFieldActions
	) as unknown as DefineComponentEntry<S, UnwrapConfig<C>>;

	return typedFieldPipe(schema, () => cb(define));
}
